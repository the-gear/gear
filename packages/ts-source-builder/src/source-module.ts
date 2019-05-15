import { RawSource } from './raw-source';
import { TsSource } from './source-atom';
import { SourceCollection } from './source-collection';

export class SourceModule {
  /**
   * Module qualified file pathname
   */
  public moduleName?: string;

  /**
   * Map o map of imports:
   *
   * Examples:
   * - `import { ident as alias } from 'modul'`:
   *   'module' → 'ident' → 'alias'
   * - `import defaulExport from 'modul'`:
   *   'modul' → null → 'defaulExport'
   *
   * @internal
   */
  importedModules: Map<string, Map<string | null, string>> = new Map();

  /**
   * Set of all used identifiers
   */
  usedIdentifiers: Set<string> = new Set();

  codeBlocks: SourceCollection;

  constructor(moduleName?: string, codeBlocks: SourceCollection = new SourceCollection([])) {
    this.moduleName = moduleName;
    this.codeBlocks = codeBlocks;
  }

  private sourceAtoms: Set<TsSource> = new Set();
  collect(atom: TsSource): void {
    if (this.sourceAtoms.has(atom)) return;
    this.sourceAtoms.add(atom);
    if (atom.collect) atom.collect(this);
  }

  resolve() {
    for (const atom of this.sourceAtoms) {
      if (atom.resolve) atom.resolve(this);
    }
  }

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

  getSource(): string {
    const srcBody: string = this.codeBlocks.getSource(this);
    const result: string[] = [];
    const imports = this.getImportTsSource();
    if (imports) result.push(imports);
    result.push(srcBody);
    return result.join('\n');
  }

  /**
   * get this module qualified file pathname
   *
   * for example: '@the-gear/samples/standalone/src/schema.graphql'
   */
  getModuleName(): string | undefined {
    return this.moduleName;
  }

  useIdentifier(name: string): string {
    if (this.usedIdentifiers.has(name)) {
      throw new Error(`Identifier '${name}' is already registered`);
    }
    this.usedIdentifiers.add(name);
    return name;
  }

  getFreeIdentifier(ident: string = 'gen$'): string {
    let nameBase = ident;
    let freeIdent = nameBase;
    let i = 0;
    while (this.usedIdentifiers.has(freeIdent)) {
      freeIdent = `${nameBase}\$${++i}`;
    }
    this.usedIdentifiers.add(freeIdent);
    return freeIdent;
  }

  getImport(module: string, identifier: string | null = null, alias?: string): string {
    const importedModule = this.importedModules.get(module);
    const prefferedIdentifier: string = alias || identifier || 'import$';
    if (importedModule) {
      const mappedIdent = importedModule.get(identifier);
      if (mappedIdent) {
        return mappedIdent;
      } else {
        const newIdent = this.getFreeIdentifier(prefferedIdentifier);
        importedModule.set(identifier, newIdent);
        return newIdent;
      }
    } else {
      const identMap = new Map();
      const newName = this.getFreeIdentifier(prefferedIdentifier);
      identMap.set(identifier, newName);
      this.importedModules.set(module, identMap);
      return newName;
    }
  }

  getTypeImport(module: string, qualifiedTypeName: string): RawSource {
    // return this.getImport(module, identifier, alias);
    return new RawSource(`import(${JSON.stringify(module)}).${qualifiedTypeName}`);
  }
}
