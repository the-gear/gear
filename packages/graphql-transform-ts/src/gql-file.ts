/**
 * Stages:
 * 1. preprocess — read hash directives (#import… etc)
 * 2. parse — read source, create AST
 * 3. transformAST — get
 * 4. getSchema — load schema for queries, or create schema
 * 5. process
 * 6. ready for getTsCode, getJsCode, getTsDeclarations
 */

import { createHash, HexBase64Latin1Encoding } from 'crypto';
import { posix } from 'path';
import { parse, SchemaDefinitionNode, ObjectTypeDefinitionNode, DocumentNode } from 'graphql';
// import { Source } from 'graphql/language/source';
import { Source } from 'graphql';
import closestFileData, { IDataReader } from 'closest-file-data';
import { resolveConfig, format } from 'prettier';
import { GraphqlTsOptions } from './types';
import { transpileModule, TranspileOutput } from './ts-transpiler';
import { fileLink } from './file-link';

const reIsDirective = /^\s*#\s*(declare|import|export|include|use|extend)\s+(.*)\s*$/;
const reDeclareContent = /^(schema\s+)?(.*)\s*$/;

const getWarning = (moduleName: string) => `
/******************************==~~^^^^^^ W A R N I N G !! ^^^^^^~~==******************************/
/*                                   THIS IS AUTOGENERATED FILE                                   */
/*                                                                                                */
/* Do not edit this file. If you need to do any changes, edit GraphQL source instead:             */
/* ${moduleName.padEnd(94)} */
/*                                                                                                */
/*********************************=______________________________=*********************************/
`;

const shortNotice = `
/*********************************** THIS IS AUTOGENERATED FILE ***********************************/
`;

const packageNameReader: IDataReader<string> = {
  basename: 'package.json',
  read: (pkg) => require(pkg).name,
};

function json(val: any): string {
  return JSON.stringify(val);
}

/**
 * Same interface as graphql.Source
 * This instance keep different file identities.
 * At first, it represents GraphQL source
 * and in addition it keeps transformed typescript file(s)
 */
export class GqlFile extends Source {
  options: GraphqlTsOptions;
  tsFileName: string;
  lines: string[];
  documentNode: DocumentNode;
  exportDefault: string | null = null;
  declaredSchema: string | null = null;
  // graphqlImports: Set<string> = new Set();
  /** module → (exportedId → localId) */
  importedModules: Map<string, Map<string | null, string>> = new Map();
  includes: Set<string> = new Set();
  exports: string[] = [];
  codeBlocks: string[] = [];

  private moduleName: string | null = null;
  private usedIdentifiers: Set<string> = new Set();
  private tsCode: string | null = null;
  private transpileOutput: TranspileOutput | null = null;

  /**
   * Like `graphql.Source` but with additional functionality
   */
  constructor(body: string, name: string, options: GraphqlTsOptions) {
    super(body, name, options && options.locationOffset);
    this.options = options;
    this.tsFileName = `${name}.ts`;
    this.lines = body.split(/\r\n|\r|\n/g);
    console.log(`[graphql-ts] processing ${fileLink(this.getModuleName(), name)}`);
    this.documentNode = parse(this.body, {
      ...this.options.parseOptions,
      noLocation: true,
    });
  }

  /**
   * Get module id relative to closest `package.json`
   * Output may be like `@scope/pkg-name/src/file.graphql`
   */
  getModuleName(): string {
    if (this.moduleName) {
      return this.moduleName;
    }

    // this.moduleName = options.rootDir ? relative(options.rootDir, name) : name;

    const closest = closestFileData(this.name, packageNameReader);
    if (!closest) {
      throw new Error(`Cannot find package.json for '${this.name}'`);
    }

    this.moduleName =
      closest.data + '/' + posix.relative(posix.resolve(closest.path, '..'), this.name);
    return this.moduleName;
  }

  private getFreeIdentifier(ident: string): string {
    let nameBase = ident;
    let freeIdent = nameBase;
    let i = 0;
    while (this.usedIdentifiers.has(freeIdent)) {
      freeIdent = `${nameBase}${++i}`;
    }
    this.usedIdentifiers.add(freeIdent);
    return freeIdent;
  }

  // private getImport(module: string, identifier: string | null = null, alias?: string): string {
  //   const importedModule = this.importedModules.get(module);
  //   const prefferedIdentifier: string = identifier || alias || 'gqlid';
  //   if (importedModule) {
  //     const mappedIdent = importedModule.get(identifier);
  //     if (mappedIdent) {
  //       return mappedIdent;
  //     } else {
  //       const newIdent = this.getFreeIdentifier(prefferedIdentifier);
  //       importedModule.set(identifier, newIdent);
  //       return newIdent;
  //     }
  //   } else {
  //     const identMap = new Map();
  //     const newName = this.getFreeIdentifier(prefferedIdentifier);
  //     identMap.set(identifier, newName);
  //     this.importedModules.set(module, identMap);
  //     return newName;
  //   }
  // }

  // private getTypeImport(module: string, qualifiedTypeName: string): string {
  //   // return this.getImport(module, identifier, alias);
  //   return `import(${json(module)}).${qualifiedTypeName}`;
  // }

  private getImportTsSource(): string {
    const imports: string[] = [];
    for (const [module, identMap] of this.importedModules) {
      const idents: string[] = [];
      let defaultAlias = null;
      for (const [name, alias] of identMap) {
        if (name === null) {
          defaultAlias = alias;
        } else {
          if (name === alias) {
            idents.push(name);
          } else {
            idents.push(`${name} as ${alias}`);
          }
        }
      }
      const fromModule = JSON.stringify(module);
      if (idents.length) {
        if (defaultAlias) {
          imports.push(`import ${defaultAlias}, { ${idents.join(', ')} } from ${fromModule};`);
        } else {
          imports.push(`import { ${idents.join(', ')} } from ${fromModule};`);
        }
      } else {
        if (defaultAlias) {
          imports.push(`import ${defaultAlias} from ${fromModule};`);
        } else {
          imports.push(`import ${fromModule};`);
        }
      }
    }
    return imports.join('\n');
  }

  getHash(algorithm: string = 'sha384', encoding: HexBase64Latin1Encoding = 'base64'): string {
    return createHash(algorithm)
      .update(this.body, 'utf8')
      .digest(encoding);
  }

  private setExportDefault(value: string) {
    this.exportDefault = value;
  }

  private addCodeBlock(code: string, name?: string) {
    if (name) {
      if (this.usedIdentifiers.has(name)) {
        new Error(`code block with name '${name}' already defined`);
      }
      this.usedIdentifiers.add(name);
    }
    this.codeBlocks.push(code);
  }

  private preprocess() {
    const { lines } = this;
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const directive = line.match(reIsDirective);
      if (directive) {
        const [, directiveName, content] = directive;
        console.log(`[graphql-ts] directive ${directiveName} ${content}`);
        switch (directiveName) {
          case 'declare': {
            // declare schema,...
            const match = content.match(reDeclareContent);
            if (!match) {
              throw new Error(
                `'declare' directive is not in valid format (at ${this.name}:${lineIndex + 1}:1)`,
              );
            }
            const newName = match[2];
            if (this.declaredSchema && this.declaredSchema !== newName) {
              throw new Error(
                `'declare' directive: cannot redeclare from '${
                  this.declaredSchema
                }' to '${newName}' (at ${this.name}:${lineIndex + 1}:1)`,
              );
            }
            this.declaredSchema = newName;
            break;
          }
          case 'import': {
            // TODO: import ts module
            // this.importedModules.push(`import ${content}`);
            break;
          }
          case 'export': {
            // export, export default ... (ts)
            if (/^default\s+/.test(content)) {
              if (this.exportDefault) {
                throw new Error(`multiple 'export default' (at ${this.name}:${lineIndex + 1}:1)`);
              }
              this.exportDefault = `export ${content}`;
            } else {
              this.exports.push(`export ${content}`);
            }
            break;
          }
          case 'include': {
            this.includes.add(content);
            break;
          }
          case 'use': {
            // TODO: use schema
            break;
          }
          case 'extend': {
            // TODO: define schema extension
            break;
          }
        }
      }
    }
  }

  private processObjectTypeDefinition(node: ObjectTypeDefinitionNode) {
    const strTypeName = node.name.value;
    const idTypeName = `${strTypeName}Type`;
    const idTypeFactory = `create${idTypeName}`;
    const idGraphQLObjectType = this.getImport('graphql', 'GraphQLObjectType');
    // const idGraphQLObjectTypeConfig = this.getTypeImport('graphql/type', 'GraphQLObjectTypeConfig');
    const description = node.description && node.description.value;
    // name: string;
    // description?: ?string
    // interfaces?: GraphQLInterfacesThunk | Array<GraphQLInterfaceType>;
    // isTypeOf?: (value: any, info?: GraphQLResolveInfo) => boolean;
    // fields: GraphQLFieldConfigMapThunk | GraphQLFieldConfigMap;

    this.addCodeBlock(
      `
      /**
       *
       */
      export type ${idTypeName} = ${idGraphQLObjectType}<any,any,any>;
      `,
      idTypeName,
    );

    this.addCodeBlock(
      `
      /**
       * Type config for object ${node.name.value}
       *
       * ${description}
       */
      export function ${idTypeFactory}(): ${idGraphQLObjectType} {
        return new ${idGraphQLObjectType}({
          name: ${json(strTypeName)},
          ${description ? `description: ${json(description)},` : ''}
          // interfaces?: GraphQLInterfacesThunk | Array<GraphQLInterfaceType>;,
          fields: () => {

          }
        });
      };
      `,
      idTypeFactory,
    );
  }

  private processSchemaDefinition(_node: SchemaDefinitionNode) {
    const buildASTSchemaId = this.getImport('graphql/utilities/buildASTSchema', 'buildASTSchema');
    this.addCodeBlock(
      `export const schema = /*@__PURE__*/ ${buildASTSchemaId}(documentAst)`,
      'schema',
    );
    this.setExportDefault(`export default schema;`);
  }

  private process() {
    for (const def of this.documentNode.definitions) {
      switch (def.kind) {
        case 'ObjectTypeDefinition': {
          this.processObjectTypeDefinition(def);
          console.log(`[graphql-ts] ObjectTypeDefinition ${def.name.value}`);
          break;
        }
        case 'SchemaDefinition': {
          this.processSchemaDefinition(def);
          break;
        }
        // definitions:
        case 'OperationDefinition':
        case 'FragmentDefinition':
        case 'ScalarTypeDefinition':
        case 'ObjectTypeDefinition':
        case 'InterfaceTypeDefinition':
        case 'UnionTypeDefinition':
        case 'EnumTypeDefinition':
        case 'InputObjectTypeDefinition':
        case 'DirectiveDefinition':
        // extensions:
        case 'SchemaExtension':
        case 'ScalarTypeExtension':
        case 'ObjectTypeExtension':
        case 'InterfaceTypeExtension':
        case 'UnionTypeExtension':
        case 'EnumTypeExtension':
        case 'InputObjectTypeExtension':
        default: {
          console.log(`[graphql-ts] ${def.kind}`);
        }
      }
    }
  }

  getTsCode(): string {
    if (this.tsCode) {
      return this.tsCode;
    }

    const idParse = this.getImport('graphql/language/parser', 'parse');
    const idSource = this.getImport('graphql/language/source', 'Source');
    const moduleName = this.getModuleName();

    // Preprocess
    this.preprocess();
    this.process();
    const hash = this.getHash();
    const includeImports: string[] = [];
    const includedIds: string[] = [];
    for (const includedFile of this.includes.values()) {
      const includedId = this.getFreeIdentifier('included');
      includedIds.push(includedId);
      includeImports.push(`import * as ${includedId} from ${includedFile};`);
    }
    const codeBlocks = [
      `// #sha384: ${hash}`,
      `// #body: ${moduleName}`,
      getWarning(moduleName),
      this.getImportTsSource(),
      ...includeImports,
      ...this.exports,
      `export const sha384Hash: string = ${JSON.stringify(hash)};`,
      shortNotice,
      `export const src: string = \`${this.body.replace(/[`$\\]/g, (m) => `\\${m}`)}\``,
      shortNotice,
      `export const source: ${this.getTypeImport(
        'graphql',
        'Source',
      )} = /*@__PURE__*/ new ${idSource}(`,
      `  src,`,
      `  ${JSON.stringify(moduleName)}`,
      `);`,
      shortNotice,
      `export const documentNode = /*@__PURE__*/ ${idParse}(source, ${JSON.stringify(
        this.options.parseOptions,
      )});`,
      shortNotice,
      // TODO: Write splitted exports, one for each named query
      ...includedIds.map((id) => `// included ${id}`),
      `export const documentAst: import('graphql').DocumentNode = ${JSON.stringify(
        this.documentNode,
      )};`,
      shortNotice,
      ...this.codeBlocks,
      this.exportDefault || `export default documentNode;`,
    ];

    let tsCode = codeBlocks.join('\n');

    if (this.options.prettify) {
      const prettierConfig = resolveConfig.sync(this.tsFileName, {
        editorconfig: true,
        useCache: true,
      });

      tsCode = format(tsCode, {
        ...prettierConfig,
        filepath: this.tsFileName,
        parser: 'typescript',
      });
    }

    this.tsCode = tsCode;

    return tsCode;
  }

  getTranspileOutput(): TranspileOutput {
    if (this.transpileOutput) return this.transpileOutput;

    const tsCode = this.getTsCode();

    const transpileOutput = transpileModule(tsCode, {
      compilerOptions: this.options.compilerOptions,
      fileName: this.name,
      moduleName: this.getModuleName(),
    });

    const { diagnostics } = transpileOutput;
    if (diagnostics && diagnostics.length) {
      console.warn(`Typescript messages in ${this.getModuleName()}`);
      diagnostics.forEach((diag) => {
        console.warn(`${diag.messageText}`);
      });
    }

    this.transpileOutput = transpileOutput;
    return transpileOutput;
  }

  getJsCode(): string {
    return this.getTranspileOutput().outputText;
  }

  getDeclaration(): string | null {
    return this.getTranspileOutput().declarationText || null;
  }
}
