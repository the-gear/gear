import { isPrimitiveValue, getPropertyName, getPropertyAccess } from './utils';

type DataRefConfig = {
  data: unknown;
  exportNames: string[];
  seen: number;
};

class DataRef implements DataRefConfig {
  data: unknown;
  exportNames: string[] = [];
  writtenName?: string;
  isWriting: boolean = false;
  seen: number = 1;
  children = new Set<DataRef>();
  constructor(data: unknown, name?: string) {
    this.data = data;
    if (name) {
      this.exportNames.push(name);
    }
  }
}

export class DataCollection {
  private refs = new Map<unknown, DataRef | null>();

  public add(data: unknown, name?: string, children?: Set<DataRef>) {
    let ref = this.refs.get(data);
    if (ref) {
      ref.seen++;
      if (name) {
        ref.exportNames.push(name);
      }
      return;
    } else {
      ref = new DataRef(data, name);
      this.refs.set(data, ref);
    }
    if (children) children.add(ref);

    if (typeof data === 'object' && data !== null) {
      const addRecursive = (val: unknown) => {
        this.add(val, undefined, (ref as DataRef).children);
      };
      if (Array.isArray(data)) {
        data.forEach(addRecursive);
      } else {
        Object.values(data).forEach(addRecursive);
      }
    }
  }

  public getTsCode() {
    const code: string[] = [];
    for (const [value, ref] of this.refs) {
      if (ref && ref.exportNames.length) {
        for (const child of ref.children) {
          if (child.seen > 1) {
            this.getCodeForRef(child, child.data, code);
          }
        }
        this.getCodeForRef(ref, value, code);
      }
    }
    return code.join('\n');
  }

  private id: number = 1;
  public getId() {
    return `$$${(this.id++).toString(36)}`;
  }

  private getCodeForRef(ref: DataRef, value: unknown, code: string[]) {
    if (ref.writtenName) return;
    const firstName = ref.exportNames[0] || this.getId();

    ref.isWriting = true;
    const append: string[] = [];
    const serialized = this.serialize(value, firstName, append);
    const isPrimitive = isPrimitiveValue(value);
    const exportStr = ref.exportNames.length ? 'export ' : '';
    if (isPrimitive) {
      for (let i = 0; i < ref.exportNames.length; i++) {
        const name = ref.exportNames[i];
        code.push(`${exportStr}const ${name} = ${serialized};`);
      }
    } else {
      code.push(`${exportStr}const ${firstName} = ${serialized};`);
      if (append.length) {
        code.push(append.join('\n'));
      }
      for (let i = 1; i < ref.exportNames.length; i++) {
        const name = ref.exportNames[i];
        code.push(`${exportStr}const ${name} = ${firstName};`);
      }
    }
    ref.isWriting = false;
  }

  serialize(data: unknown, path: string, append: string[]): string {
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
        return `BigInt("${data.toString()}")`;
      }

      case 'object': {
        if (data === null) return 'null';

        const ref = this.refs.get(data);
        if (ref) {
          if (ref.writtenName) {
            if (ref.isWriting) {
              append.push(`${path} = ${ref.writtenName}`);
              return `undefined /* recursive ${ref.writtenName} */`;
            } else {
              return ref.writtenName;
            }
          } else {
            ref.writtenName = path;
          }
        }

        if (Array.isArray(data)) {
          return `[${data
            .map((value, idx) => this.serialize(value, path + getPropertyAccess(idx), append))
            .join(', ')}]`;
        }

        const keyVals = [];
        for (const [key, value] of Object.entries(data)) {
          keyVals.push(
            `${getPropertyName(key)}: ${this.serialize(
              value,
              path + getPropertyAccess(key),
              append,
            )}`,
          );
        }

        return `{${keyVals.join(', ')}}`;
      }

      case 'symbol': {
        // Well, I can register symbols on module and emit reference here, but...
        return `undefined /* ${data.toString().replace(/\*\//g, '* /')} */`;
      }

      case 'function': {
        return `undefined /* ${data.toString().replace(/\*\//g, '* /')} */`;
      }

      default: {
        /* istanbul ignore next */
        throw new Error(`[ts-source-builder] Unhandled case of type ${typeof data}`);
      }
    }
  }
}
