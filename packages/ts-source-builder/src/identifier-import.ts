import { SourceAtom } from './source-atom';
import { SourceModule } from './source-module';

type ImportedIdentifierConfig = {
  /**
   * Name of exported bindig. Use `null` for default export.
   */
  from: string;
  name?: string | null;
  alias?: string;
  noRename?: boolean;
};

export class ImportedIdentifier extends SourceAtom {
  from: string;
  name?: string | null;
  alias?: string;
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
    if (this.noRename) {
      this.resolvedAlias = modul.getImport(this.from, this.name, this.alias);
    }
  }

  resolve(modul: SourceModule) {
    if (!this.resolvedAlias) {
      this.alias = modul.getImport(this.from, this.name, this.alias);
    }
  }

  getSource(modul: SourceModule) {
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
