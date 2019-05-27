import { PrimitiveSerializer } from './primitive-serializer';

/**
 * Serialize data, replace defined values with reference,
 */
export class ReferentialSerializer extends PrimitiveSerializer {
  protected replaces = new Map<unknown, string>();

  setReplace(value: unknown, name: string): void {
    this.replaces.set(value, name);
  }

  protected serializeObjectReference(value: object): string {
    const replace = this.replaces.get(value);
    if (replace) return replace;
    return super.serializeObjectReference(value);
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
