import { PrimitiveConverters } from './data-converter';
import { getPropertyName } from './utils';

export abstract class Value {
  refCount: number = 1;
  name: string | null = null;

  ref(): this {
    this.refCount++;
    return this;
  }

  setName(name: string): this {
    if (this.name) {
      throw new Error(`Name already set as '${this.name}'. New name '${name}' requested`);
    }
    this.name = name;
    return this;
  }

  toString() {
    return this.toExpression();
  }

  abstract toExpression(): string;
}

export class ConstValue extends Value {
  constructor(public readonly value: unknown) {
    super();
  }

  toExpression() {
    return JSON.stringify(this.value);
  }
}

export interface ConstValueConstructor<T extends ConstValue> {
  new (value: T['value']): T;
}

export class SpecialConstValue extends ConstValue {
  /**
   * @internal
   */
  constructor(public readonly value: unknown, private readonly expression: string) {
    super(value);
  }

  toExpression() {
    return this.expression;
  }
}

export class UndefinedValue extends SpecialConstValue {
  constructor() {
    super(void 0, 'void 0');
  }
}

export class NullValue extends SpecialConstValue {
  constructor() {
    super(null, 'null');
  }
}

export class KeyValue extends ConstValue {
  protected constructor(public readonly value: PropertyKey) {
    super(value);
  }

  toKey(): string {
    return getPropertyName(this.value);
  }
}

export class StringValue extends KeyValue {
  constructor(public readonly value: string) {
    super(value);
  }
}

export class NumberValue extends KeyValue {
  constructor(public readonly value: number) {
    super(value);
  }

  toExpression() {
    const value = this.value;
    if (Number.isNaN(value)) return 'NaN';
    if (value === Number.POSITIVE_INFINITY) return 'Infinity';
    if (value === Number.NEGATIVE_INFINITY) return '-Infinity';
    return value.toString();
  }
}

export class SymbolValue extends KeyValue {
  constructor(public readonly value: symbol) {
    super(value);
  }
}

export class BigIntValue extends ConstValue {
  constructor(public readonly value: bigint) {
    super(value);
  }

  toExpression() {
    return `BigInt('${this.value.toString()}')`;
  }
}

export class ObjectValue extends ConstValue {
  public children = new Map<KeyValue, Value>();

  constructor(public readonly value: object) {
    super(value);
  }

  addProperty(name: KeyValue, value: Value): void {
    this.children.set(name, value);
  }

  toExpression() {
    const keyVals = [];
    for (const [keyValue, valValue] of this.children) {
      const key = keyValue.toKey();
      const val = valValue.toExpression();
      // object shorthand
      keyVals.push(key === val ? key : key + ':' + val);
    }
    return '{' + keyVals.join(',') + '}';
  }
}

export class ArrayValue extends ObjectValue {
  constructor(public readonly value: unknown[]) {
    super(value);
  }

  toExpression() {
    const vals = [];
    let i = 0;
    for (const [keyValue, valValue] of this.children) {
      if (i++ !== keyValue.value) throw new Error('Whoops#!');
      const val = valValue.toExpression();
      vals.push(val);
    }
    return '[' + vals.join(',') + ']';
  }
}

export class FunctionValue extends ObjectValue {
  constructor(public readonly value: Function) {
    super(value);
  }
}

export class ValuePool<T extends ConstValue> {
  private refs = new Map<T['value'], T>();
  constructor(private ValueConstructor: ConstValueConstructor<T>) {}

  ref(value: T['value'], create?: (ref: T) => T | void): T {
    const existingValue = this.refs.get(value);
    if (existingValue) return existingValue.ref();

    const newValue = new this.ValueConstructor(value);
    const resolvedValue = (create && create(newValue)) || newValue;
    this.refs.set(value, resolvedValue);
    return resolvedValue;
  }
}

export class ValueConverter extends PrimitiveConverters<Value, unknown[]> {
  private stringPool = new ValuePool(StringValue);
  private objectPool = new ValuePool(ObjectValue);
  private allValues = new Set<Value>();

  addConst(name: string, value: unknown): Value {
    const ref = this.convert(value).setName(name);
    return ref;
  }

  convert(value: unknown, ctx: unknown[] = []): Value {
    if (ctx.includes(value)) {
      throw new Error('Circular value detected');
    }
    const ref = super.convert(value, ctx);
    this.allValues.add(ref);
    return ref;
  }

  ['string'](value: string, _ctx: unknown[]): StringValue {
    return this.stringPool.ref(value);
  }

  ['number'](value: number, _ctx: unknown[]): Value {
    return new NumberValue(value);
  }

  ['bigint'](value: bigint, _ctx: unknown[]): Value {
    return new BigIntValue(value);
  }

  ['boolean'](value: boolean, _ctx: unknown[]): Value {
    return new ConstValue(value);
  }

  ['symbol'](value: symbol, _ctx: unknown[]): Value {
    return new SymbolValue(value);
  }

  ['undefined'](_value: undefined, _ctx: unknown[]): Value {
    return new UndefinedValue();
  }

  ['object'](value: object, ctx: unknown[]): Value {
    if (value === null) return new NullValue();

    return this.objectPool.ref(value, (ref) => {
      if (Array.isArray(value)) ref = new ArrayValue(value);

      for (const [key, val] of Object.entries(value)) {
        ref.addProperty(this.convert(key) as KeyValue, this.convert(val, [value, ...ctx]));
      }

      return ref;
    });
  }

  ['function'](value: Function, _ctx: unknown[]): Value {
    return this.objectPool.ref(value, () => {
      return new FunctionValue(value);
    });
  }

  toString() {
    let uniqId = 0;
    const statements: string[] = [];
    for (const ref of this.allValues) {
      if (ref.name || ref.refCount > 1) {
        statements.push(
          `const ${ref.name || `$$${++uniqId}`} = ${ref.toExpression()}; // ${ref.refCount}`,
        );
      }
    }
    return statements.join('\n');
  }
}
