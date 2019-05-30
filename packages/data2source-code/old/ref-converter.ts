import { PrimitiveConverters } from './data-converter';
import { getPropertyName } from '../src/utils';
import { Identifiers, Ref } from '../src/identifiers';
import { isValidIdentifierName } from './utils';

export abstract class Value {
  refCount: number = 1;

  protected constructor(protected readonly owner: ValueConverter) {}

  ref(): this {
    this.refCount++;
    return this;
  }

  collect(_set: Set<Value>): void {}

  abstract toExpression(): string;
}

export class PrimitiveValue extends Value {
  constructor(owner: ValueConverter, public readonly value: unknown) {
    super(owner);
  }

  toExpression() {
    return JSON.stringify(this.value);
  }
}

export interface ConstValueConstructor<T extends ConstValue> {
  new (owner: ValueConverter, value: T['value']): T;
}

export class SpecialConstValue extends ConstValue {
  /**
   * @internal
   */
  constructor(
    owner: ValueConverter,
    public readonly value: unknown,
    private readonly expression: string,
  ) {
    super(owner, value);
  }

  toExpression() {
    return this.expression;
  }
}

export class UndefinedValue extends SpecialConstValue {
  constructor(owner: ValueConverter) {
    super(owner, void 0, 'void 0');
  }
}

export class NullValue extends SpecialConstValue {
  constructor(owner: ValueConverter) {
    super(owner, null, 'null');
  }
}

export class KeyValue extends ConstValue {
  protected constructor(owner: ValueConverter, public readonly value: PropertyKey) {
    super(owner, value);
  }

  toKey(): string {
    return getPropertyName(this.value);
  }
}

export class StringValue extends KeyValue {
  constructor(owner: ValueConverter, public readonly value: string) {
    super(owner, value);
  }
}

export class NumberValue extends KeyValue {
  constructor(owner: ValueConverter, public readonly value: number) {
    super(owner, value);
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
  constructor(owner: ValueConverter, public readonly value: symbol) {
    super(owner, value);
  }
}

export class BigIntValue extends ConstValue {
  constructor(owner: ValueConverter, public readonly value: bigint) {
    super(owner, value);
  }

  toExpression() {
    return `BigInt('${this.value.toString()}')`;
  }
}

export class ObjectValue extends ConstValue {
  public children = new Map<KeyValue, Value>();

  constructor(owner: ValueConverter, public readonly value: object) {
    super(owner, value);
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
  constructor(owner: ValueConverter, public readonly value: unknown[]) {
    super(owner, value);
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
  constructor(owner: ValueConverter, public readonly value: Function) {
    super(owner, value);
  }
}

class ValuePool<T extends ConstValue> {
  private refs = new Map<T['value'], T>();

  constructor(
    protected owner: ValueConverter,
    private ValueConstructor: ConstValueConstructor<T>,
  ) {}

  ref(value: T['value'], create?: (ref: T) => T | void): T {
    const existingValue = this.refs.get(value);
    if (existingValue) return existingValue.ref();

    const newValue = new this.ValueConstructor(this.owner, value);
    const resolvedValue = (create && create(newValue)) || newValue;
    this.refs.set(value, resolvedValue);
    return resolvedValue;
  }
}

export class ValueConverter extends PrimitiveConverters<Value, unknown[]> {
  private stringPool = new ValuePool(this, StringValue);
  private objectPool = new ValuePool(this, ObjectValue);
  private allValues = new Set<Value>();

  constructor(public identifiers: Identifiers<Value>) {
    super();
  }

  addConst(name: string, value: unknown): Ref<Value> {
    const ref = this.convert(value);
    return this.identifiers.getFor(ref).setName(name, true);
  }

  convert(value: unknown, ctx: unknown[] = []): Value {
    // if (ctx.includes(value)) {
    //   throw new Error('Circular value detected');
    // }
    const ref = super.convert(value, ctx);
    this.allValues.add(ref);
    return ref;
  }

  ['string'](value: string, _ctx: unknown[]): StringValue {
    return this.stringPool.ref(value);
  }

  ['number'](value: number, _ctx: unknown[]): NumberValue {
    return new NumberValue(this, value);
  }

  ['bigint'](value: bigint, _ctx: unknown[]): BigIntValue {
    return new BigIntValue(this, value);
  }

  ['boolean'](value: boolean, _ctx: unknown[]): ConstValue {
    return new ConstValue(this, value);
  }

  ['symbol'](value: symbol, _ctx: unknown[]): SymbolValue {
    return new SymbolValue(this, value);
  }

  ['undefined'](_value: undefined, _ctx: unknown[]): UndefinedValue {
    return new UndefinedValue(this);
  }

  ['object'](value: object, ctx: unknown[]): NullValue | ArrayValue | ObjectValue {
    if (value === null) return new NullValue(this);

    return this.objectPool.ref(value, (ref) => {
      if (Array.isArray(value)) ref = new ArrayValue(this, value);

      for (const [key, val] of Object.entries(value)) {
        const valueRef = this.convert(val, [value, ...ctx]);
        const suggestedNames: string[] = [];
        if (isValidIdentifierName(key)) {
          suggestedNames.push(key);
        }
        suggestedNames.push();
        this.identifiers.getFor(valueRef).suggestNames(suggestedNames);
        ref.addProperty(this.convert(key) as KeyValue, valueRef);
      }

      return ref;
    });
  }

  ['function'](value: Function, _ctx: unknown[]): FunctionValue {
    return this.objectPool.ref(value, () => {
      return new FunctionValue(this, value);
    }) as FunctionValue;
  }
}
