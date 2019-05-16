import { SourceAtom } from './source-atom';
import { SourceModule } from './source-module';

type ImportedIdentifierConfig = {
  /**
   * Name of exported bindig. Use `null` for default export.
   */
  from: string;
  /**
   * Name of exported bindig.
   * Use `null` for default export.
   * Use `null` together with alias `null` to import only for side effect
   */
  name?: string | null;
  /**
   * null — only import but do not create identifier for (usefull for modules with side effect)
   */
  alias?: string | null;
  noRename?: boolean;
};

export class ImportedIdentifier extends SourceAtom implements ImportedIdentifierConfig {
  from: string;
  name?: string | null;
  alias?: string | null;
  noRename?: boolean;
  resolvedAlias?: string;

  constructor(config: ImportedIdentifierConfig) {
    super();
    this.name = config.name;
    this.alias = config.alias;
    this.from = config.from;
    this.noRename = config.noRename;
  }

  collect(modul: SourceModule) {
    if (this.noRename || (this.alias === null && this.name === null)) {
      this.resolvedAlias = modul.getImport(this.from, this.name, this.alias);
    }
  }

  resolve(modul: SourceModule) {
    if (this.alias === null && this.name === null) return;

    if (!this.resolvedAlias) {
      this.alias = modul.getImport(this.from, this.name, this.alias);
    }
  }

  getSource(modul: SourceModule) {
    if (this.alias === null && this.name === null) return '';
    if (this.noRename) {
      const requestedName = this.alias || this.name;
      if (this.resolvedAlias !== requestedName) {
        throw new Error(
          `Import need to be renamed: requested '${requestedName}' but got ${this.resolvedAlias}`,
        );
      }
    }
    return this.resolvedAlias || modul.getImport(this.from, this.name);
  }
}
