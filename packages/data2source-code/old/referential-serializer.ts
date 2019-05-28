import { PrimitiveSerializer } from './primitive-serializer';

/**
 * Serialize data, replace defined values with reference,
 */
export class ReferentialSerializer extends PrimitiveSerializer {
  protected replaces = new Map<unknown, string>();
  private writting = new Set<unknown>();
  private written = new Set<unknown>();

  setReplace(value: unknown, name: string): void {
    this.replaces.set(value, name);
  }

  protected serializeObjectReference(value: object): string {
    const replace = this.replaces.get(value);
    if (replace) return replace;
    if (this.writting.has(value)) {
      // throw new TypeError('Value is writting. Recursion?');
    }
    if (this.written.has(value)) {
      // throw new TypeError(
      //   'Value should be written second time. This will break referential integrity',
      // );
    }
    this.writting.add(value);
    const result = super.serializeObjectReference(value);
    this.writting.delete(value);
    this.written.add(value);
    return result;
  }

  protected serializeString(string: string): string {
    return this.replaces.get(string) || JSON.stringify(string);
  }

  protected serializeFunction(fn: Function): string {
    const replace = this.replaces.get(fn);
    if (replace) return replace;
    throw new TypeError(`${this.constructor.name}.serializeFunction: unknown value`);
  }

  protected serializeSymbol(symbol: symbol): string {
    const replace = this.replaces.get(symbol);
    if (replace) return replace;
    throw new TypeError(`${this.constructor.name}.serializeSymbol: unknown value`);
  }
}
