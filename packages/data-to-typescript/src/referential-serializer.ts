import { getPropertyPath } from './utils';
import { PrimitiveSerializer, WithProperties } from './primitive-serializer';

export class ReferentialSerializer extends PrimitiveSerializer {
  serializeString(string: string): string {
    return JSON.stringify(string);
  }

  serializeRecursion(
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
        this.parentKeys,
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
}
