import { SourceAtom } from './source-atom';
import { SourceModule } from './source-module';

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

  constructor(config: ConstDataConfig) {
    super();
    this.name = config.name;
    this.isExport = config.isExport;
    this.data = config.data;
  }

  collect(modul: SourceModule) {
    const name = this.name;
    modul.data.add(this.data, name);
  }

  resolve(modul: SourceModule) {
    if (!this.name) {
      this.name = modul.data.getQualifiedId(this.data);
    }
  }

  getSource(_modul: SourceModule) {
    /* istanbul ignore next */
    if (!this.name) {
      throw new Error('data have no name');
    }
    return this.name;
  }
}
