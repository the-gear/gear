import { SourceAtom } from './source-atom';
import { SourceModule } from './source-module';
import { DataRef } from './data-collection';

export type ConstDataConfigWithoutData = {
  /**
   * Name of const binding
   */
  name?: string;
  /**
   * If value should be exported
   */
  isExport?: boolean;
};

export type ConstDataConfig = ConstDataConfigWithoutData & {
  /**
   * JSON data
   */
  data: any;
};

export class ConstData extends SourceAtom implements ConstDataConfig {
  name?: string;
  isExport?: boolean;
  data: any;
  ref?: DataRef;

  constructor(config: ConstDataConfig) {
    super();
    this.name = config.name;
    this.isExport = config.isExport;
    this.data = config.data;
  }

  collect(modul: SourceModule) {
    this.ref = modul.data.add(this.data, this.name);
  }

  resolve(_modul: SourceModule) {}

  getSource(_modul: SourceModule) {
    return (this.ref as DataRef).writtenName || this.name || '';
  }
}
