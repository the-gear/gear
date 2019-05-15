import { RawSource } from './raw-source';
import { SourceAtom, TsSource } from './source-atom';

export class SourceCollection extends SourceAtom {
  constructor(protected sources: TsSource[] = []) {
    super();
  }
  collect(modul: SourceModule): void {
    this.sources.forEach((src) => modul.collect(src));
  }
  resolve(modul: SourceModule): void {
    this.sources.forEach((src) => src.resolve(modul));
  }
  getSource(modul: SourceModule): string {
    return this.sources.map((src) => src.getSource(modul)).join('');
  }
  toString(sourceModule?: SourceModule): string {
    const modul = sourceModule || (this instanceof SourceModule ? this : new SourceModule());
    modul.collect(this);
    this.resolve(modul);
    return this.getSource(modul);
  }
}

export class SourceModule extends SourceCollection {
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

  constructor(moduleName?: string) {
    super();
    this.moduleName = moduleName;
  }

  private seen: Set<TsSource> = new Set();

  collect(atom: TsSource): void {
    if (this.seen.has(atom)) return;
    this.seen.add(atom);
    atom.collect(this);
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
    const prefferedIdentifier: string = identifier || alias || 'gqlid';
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
