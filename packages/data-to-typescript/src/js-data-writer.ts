import { ReferentialSerializer } from './referential-serializer';
import { isWithKeys, getPropertyPath, getPropertyAccess } from './utils';
// import { WithProperties } from './primitive-serializer';

export type Exports = { [keys: string]: unknown };

class Ref {
  seen = 1;
  exports: string[] = [];
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  export(name: string): this {
    this.exports.push(name);
    return this;
  }

  ref(): this {
    this.seen++;
    return this;
  }
}

class JsSerializer extends ReferentialSerializer {
  constructor(private writer: JsDataWriter) {
    super();
  }

  serializeRecursion(value: unknown, longPath: PropertyKey[], shortPath: PropertyKey[]): string {
    const ref = this.writer.refs.get(value);
    /* istanbul ignore next */
    if (!ref) throw new Error('Unhandled recursion');
    const name = ref.name;
    const long = getPropertyPath(name, ...longPath);
    const short = getPropertyPath(name, ...shortPath);
    this.writer.recursions.push(`${long} = ${short};`);

    return Array.isArray(value) ? `[ /* ${short} */ ]` : `{ /* ${short} */ }`;
  }

  // serializePropertyValue(
  //   value: unknown,
  //   key: PropertyKey,
  //   parent: WithProperties,
  // ): string | undefined {
  //   const result = super.serializePropertyValue(value, key, parent);
  //   const ref = this.writer.refs.get(value);
  //   if (ref) {
  //     this.setReplace(value, getPropertyPath(ref.name, ...this.parentKeys));
  //   }
  //   return result;
  // }
}

/**
 * Serialize data, replace defined values with reference,
 */
export class JsDataWriter {
  serializer = new JsSerializer(this);
  refs = new Map<unknown, Ref>();
  exports = new Map<string, unknown>();
  recursions: string[] = [];

  constructor(public moduleType: 'ESM' | 'CJS' = 'ESM') {}

  addExports(exports: Exports): this {
    for (const [name, value] of Object.entries(exports)) {
      this.add(name, value, true);
    }
    return this;
  }

  addChildren(name: string, parent: unknown) {
    if (isWithKeys(parent)) {
      for (const [key, value] of Object.entries(parent)) {
        if (isWithKeys(value)) {
          this.add(`${name}$${key}`, value, false);
        }
      }
    }
  }

  add(name: string, value: unknown, isExport: boolean = true): Ref {
    if (isExport) {
      if (this.exports.has(name)) {
        const definedExport = this.exports.get(name);
        if (!Object.is(definedExport, value)) {
          throw new TypeError(`Cannot redeclare export ${name}`);
        }
      } else {
        this.exports.set(name, value);
      }
    }

    const ref = this.refs.get(value);
    if (ref) {
      if (isExport) ref.export(name);
      return ref.ref();
    } else {
      const ref = new Ref(name);
      if (isExport) ref.export(name);
      this.refs.set(value, ref);
      this.addChildren(name, value);

      // ensure that any children will be before its parent
      this.refs.delete(value);
      this.refs.set(value, ref);

      return ref;
    }
  }

  private flushRecursion(code: string[]) {
    if (!this.recursions.length) return;
    code.push(this.recursions.join('\n'));
    this.recursions = [];
  }

  protected writeConst(name: string, value: unknown): string {
    return `const ${name} = ${this.serializer.serialize(value)};`;
  }

  protected writeExportConst(name: string, value: unknown): string {
    let exportStr: string;
    switch (this.moduleType) {
      case 'ESM': {
        exportStr = `export const ${name}`;
        break;
      }
      case 'CJS': {
        exportStr = `const ${name} = module.exports${getPropertyAccess(name)}`;
        break;
      }
      default: {
        /* istanbul ignore next */
        throw new TypeError(`Unknown module type: '${this.moduleType}'.`);
      }
    }
    return `${exportStr} = ${this.serializer.serialize(value)};`;
  }

  toString(): string {
    const code = [];
    for (const [value, ref] of this.refs) {
      const exports = ref.exports;
      if (exports.length) {
        const name = exports[0];
        ref.name = name;
        code.push(this.writeExportConst(name, value));
        this.flushRecursion(code);
        this.serializer.setReplace(value, name);
        for (let i = 1; i < exports.length; i++) {
          code.push(this.writeExportConst(exports[i], value));
        }
        code.push();
      } else {
        if (ref.seen > 1) {
          const name = ref.name;
          code.push(this.writeConst(name, value));
          this.serializer.setReplace(value, name);
        }
      }
      this.flushRecursion(code);
    }
    return code.join('\n');
  }
}
