import { SourceAtom } from './source-atom';
import { SourceModule } from './source-module';
import { getPropertyName } from './utils';

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
    modul.collectData(this.data, this);
  }

  resolveData(current: ConstData): ConstData {
    // from parents to children
    return current;
  }

  resolve(_modul: SourceModule) {
    // from children to parents
  }

  getSource(modul: SourceModule) {
    return this.serialize(this.data, modul);
  }

  serialize(data: unknown, modul: SourceModule, indent: string = '\n  '): string {
    const id = modul.getIdForData(this.data);
    if (id) {
      return id;
    }

    if (data === null) return 'null';
    if (data === true) return 'true';
    if (data === false) return 'false';
    switch (typeof data) {
      case 'undefined': {
        return 'undefined';
      }

      case 'string':
      case 'number':
      case 'boolean': {
        return JSON.stringify(data);
      }

      case 'bigint': {
        return `${data.toString()}n`;
      }

      case 'symbol': {
        // Well, I can register symbols on module and emit reference here, but...
        return `undefined /* ${data.toString().replace(/\*\//g, '* /')} */`;
      }

      case 'function': {
        return `undefined /* ${data.toString().replace(/\*\//g, '* /')} */`;
      }

      case 'object': {
        if (data === null) return 'null';

        const indent2 = indent + '  ';

        if (Array.isArray(data)) {
          return `[${indent}${data
            .map((value) => this.serialize(value, modul, indent2))
            .join(',' + indent)}]`;
        }

        const keyVals = [];
        for (const [key, value] of Object.entries(data)) {
          keyVals.push(`${getPropertyName(key)}: ${this.serialize(value, modul, indent2)}`);
        }

        return `{${indent}${keyVals.join(',' + indent)}}`;
      }

      default: {
        throw new Error(`[ts-source-builder] Unhandled case of type ${typeof data}`);
      }
    }
  }
}
