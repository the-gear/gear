/**
 * Represents any class that can serialize any value
 */
export interface ISerializer<T = string> {
  /**
   * Serialize any value
   */
  serialize(value: unknown): T;
}

/**
 * Abstract class that can serialize any value
 * and define methods for serializing values of:
 * - common primitive values
 * - objects
 * - arrays
 */
export abstract class AbstractSerializer<T> implements ISerializer<T> {
  /**
   * Serialize any value.
   * Delegate
   */
  serialize(value: unknown): T {
    switch (typeof value) {
      case 'string':
        return this.serializeString(value);
      case 'number':
        return this.serializeNumber(value);
      case 'bigint':
        return this.serializeBigInt(value);
      case 'boolean':
        return this.serializeBoolean(value);
      case 'symbol':
        return this.serializeSymbol(value);
      case 'undefined':
        return this.serializeUndefined();
      case 'object':
        if (value === null) return this.serializeNull();
        return this.serializeObjectReference(value);
      case 'function':
        return this.serializeFunction(value);
    }
    /* istanbul ignore next */
    throw new TypeError(`${this.constructor.name}.serialize cannot handle typeof ${typeof value}`);
  }

  protected serializeObjectReference(value: object): T {
    if (Array.isArray(value)) return this.serializeArray(value);
    return this.serializeObject(value);
  }

  protected serializeFunction(_function: Function): T {
    throw new TypeError(`${this.constructor.name}.serializeFunction is not defined`);
  }

  protected serializeSymbol(_symbol: symbol): T {
    throw new TypeError(`${this.constructor.name}.serializeSymbol is not defined`);
  }

  protected abstract serializeArray(value: unknown[]): T;
  protected abstract serializeBigInt(value: bigint): T;
  protected abstract serializeBoolean(value: boolean): T;
  protected abstract serializeNull(): T;
  protected abstract serializeNumber(value: number): T;
  protected abstract serializeObject(value: object): T;
  protected abstract serializeString(value: string): T;
  protected abstract serializeUndefined(): T;
}
