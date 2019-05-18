import { RawSource } from './raw-source';
import { TsSource } from './source-atom';
import { SourceCollection } from './source-collection';
import { ConstData } from './const-data';

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
  private importedModules: Map<string, Map<string | null, string>> = new Map();

  /**
   * Set of all used identifiers
   */
  private usedIdentifiers: Set<string> = new Set();

  private codeBlocks: SourceCollection;

  private sources: Set<TsSource> = new Set();

  constructor(moduleName?: string, codeBlocks: SourceCollection = new SourceCollection([])) {
    this.moduleName = moduleName;
    this.codeBlocks = codeBlocks;
  }

  invalidate() {}

  /**
   * get this module qualified file pathname
   *
   * for example: '@the-gear/samples/standalone/src/schema.graphql'
   */
  getModuleName(): string | undefined {
    return this.moduleName;
  }

  add(code: TsSource): this {
    this.invalidate();
    this.codeBlocks.push(code);
    this.collect(code);
    return this;
  }

  collect(atom: TsSource): void {
    if (this.sources.has(atom)) return;
    this.sources.add(atom);
    if (atom.collect) atom.collect(this);
  }

  private dataMap: Map<unknown, ConstData> = new Map();
  collectData(data: unknown, ref: ConstData) {
    if (this.dataMap.has(data)) {
      const haveVal = this.dataMap.get(data) as ConstData;
      const newVal = ref.resolveData(haveVal);
      if (haveVal !== newVal) {
        this.dataMap.set(data, newVal);
      }
    } else {
      this.dataMap.set(data, ref);
    }
  }

  getIdForData(data: unknown): string | null {
    const constData = this.dataMap.get(data);
    return (constData && constData.name) || null;
  }

  resolve() {
    for (const atom of this.sources) {
      if (atom.resolve) atom.resolve(this);
    }
  }

  private getDataTsSource(): string {
    const results: string[] = [];
    for (const [data, constData] of this.dataMap) {
      if (constData.data === data) {
        const id = this.getFreeIdentifier(constData.name);
        if (!constData.name) {
          constData.name = id;
        }
        results.push(`const ${id} = ${constData.serialize(data, this)};`);
      }
    }
    return results.join('\n');
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
    const data = this.getDataTsSource();
    const imports = this.getImportTsSource();
    if (imports) result.push(imports);
    if (data) result.push(data);
    result.push(srcBody);
    return result.join('\n');
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

  getImport(moduleName: string, identifier: string | null = null, alias?: string | null): string {
    const importedModule = this.importedModules.get(moduleName);
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
      this.importedModules.set(moduleName, identMap);
      if (identifier === null && alias === null) {
        return '';
      }
      const newName = this.getFreeIdentifier(prefferedIdentifier);
      identMap.set(identifier, newName);
      return newName;
    }
  }

  getTypeImport(moduleName: string, qualifiedTypeName: string): RawSource {
    // return this.getImport(moduleName, identifier, alias);
    return new RawSource(`import(${JSON.stringify(moduleName)}).${qualifiedTypeName}`);
  }
}
