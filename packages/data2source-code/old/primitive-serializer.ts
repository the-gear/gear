import { AbstractSerializer } from './serializer';
import { getPropertyPath, getPropertyName } from './utils';

export type WithProperties = object | Function | unknown[];

export class PrimitiveSerializer extends AbstractSerializer<string> {
  /**
   * Track for current object being written
   */
  protected parents: WithProperties[] = [];

  /**
   * Track for current object _key_ being written
   */
  protected parentKeys: PropertyKey[] = [];

  protected serializeBigInt(bigint: bigint): string {
    return `BigInt('${bigint.toString()}')`;
  }

  protected serializeBoolean(bool: boolean): string {
    return bool ? 'true' : 'false';
  }

  protected serializeString(string: string): string {
    return JSON.stringify(string);
  }

  protected serializeUndefined(): string {
    return 'undefined';
  }

  protected serializeNull(): string {
    return 'null';
  }

  protected serializeNumber(n: number): string {
    if (Number.isNaN(n)) return 'NaN';
    if (n === Number.POSITIVE_INFINITY) return 'Infinity';
    if (n === Number.NEGATIVE_INFINITY) return '-Infinity';
    return n.toString();
  }

  protected serializeRecursion(
    _value: unknown,
    longPath: PropertyKey[],
    shortPath: PropertyKey[],
  ): string | undefined {
    throw new TypeError(
      `Recursion detected: ${getPropertyPath('$', ...longPath)} = ${getPropertyPath(
        '$',
        ...shortPath,
      )}`,
    );
  }

  /**
   * This will be called for Object and Array values
   *
   * @param {unknown} value property value
   * @param {string | number} key property name or index
   * @param {object | object[]} parent object
   */
  serializePropertyValue(
    value: unknown,
    key: PropertyKey,
    parent: WithProperties,
  ): string | undefined {
    const recursiveIndex = this.parents.indexOf(value as any);
    if (recursiveIndex >= 0) {
      return this.serializeRecursion(
        value,
        [...this.parentKeys, key],
        this.parentKeys.slice(0, recursiveIndex),
      );
    }

    this.parents.push(parent);
    this.parentKeys.push(key);
    try {
      return this.serialize(value);
    } finally {
      this.parents.pop();
      this.parentKeys.pop();
    }
  }

  protected serializeArray(array: unknown[]): string {
    // array map have signature (value: T, index: number, array: T[])
    // which is same as type of `serializePropertyValue`
    // second `this` is instead of `serializePropertyValue.bind(this)`
    return '[' + array.map(this.serializePropertyValue, this).join(',') + ']';
  }

  protected serializeObject(obj: object): string {
    const keyVals = [];
    for (const [key, val] of Object.entries(obj)) {
      const serializedValue = this.serializePropertyValue(val, key, obj);
      if (typeof serializedValue !== 'undefined') {
        keyVals.push(getPropertyName(key) + ':' + serializedValue);
      }
    }
    return '{' + keyVals.join(',') + '}';
  }
}
