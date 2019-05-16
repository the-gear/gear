import { SourceAtom } from './source-atom';
import { SourceModule } from './source-module';

type ConstDataConfig = {
  /**
   * Name of const binding
   */
  name?: string;
  /**
   * If value should be exported
   */
  isExport?: boolean;
  /**
   * JSON data
   */
  data: any;
};

export class ConstData extends SourceAtom implements ConstDataConfig {
  name?: string;
  isExport?: boolean;
  data: any;

  constructor(config: ConstDataConfig) {
    super();
    this.name = config.name;
    this.isExport = config.isExport;
    this.data = config.data;
  }

  collect(modul: SourceModule) {
    modul.collectData(this, this.data);
  }

  resolveData(current: ConstData): ConstData {
    return this;
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
