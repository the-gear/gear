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
 * Represents any class that can serialize any value
 * and define methods for serializing values of:
 * - common primitive values
 * - objects
 * - arrays
 */
export interface IPrimitiveSerializer<T = string> extends ISerializer<T> {
  /**
   * serialize Array
   */
  serializeArray(value: unknown[]): T;

  /**
   * serialize BigInt
   */
  serializeBigInt(value: bigint): T;

  /**
   * serialize Boolean
   */
  serializeBoolean(value: boolean): T;

  /**
   * serialize Function
   */
  serializeFunction(value: Function): T;

  /**
   * serialize Null
   */
  serializeNull(): T;

  /**
   * serialize Number
   */
  serializeNumber(value: number): T;

  /**
   * serialize Object
   */
  serializeObject(value: object): T;

  /**
   * serialize Object or Array
   */
  serializeObjectReference(value: object): T;

  /**
   * serialize String
   */
  serializeString(value: string): T;

  /**
   * serialize Symbol
   */
  serializeSymbol(value: symbol): T;

  /**
   * serialize Undefined
   */
  serializeUndefined(): T;
}

/**
 * Abstract class that can serialize any value
 * and define methods for serializing values of:
 * - common primitive values
 * - objects
 * - arrays
 */
export abstract class AbstractSerializer<T = string> implements IPrimitiveSerializer<T> {
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
      default:
        /* istanbul ignore next */
        throw new TypeError(
          `${this.constructor.name}.serialize cannot handle typeof ${typeof value}`,
        );
    }
  }

  abstract serializeArray(value: unknown[]): T;
  abstract serializeBigInt(value: bigint): T;
  abstract serializeBoolean(value: boolean): T;
  abstract serializeNull(): T;
  abstract serializeNumber(value: number): T;
  abstract serializeObject(value: object): T;
  abstract serializeString(value: string): T;
  abstract serializeUndefined(): T;

  serializeObjectReference(value: object): T {
    if (Array.isArray(value)) return this.serializeArray(value);
    return this.serializeObject(value);
  }

  serializeFunction(_function: Function): T {
    throw new TypeError(`${this.constructor.name}.serializeFunction is not defined`);
  }

  serializeSymbol(_symbol: symbol): T {
    throw new TypeError(`${this.constructor.name}.serializeSymbol is not defined`);
  }
}
