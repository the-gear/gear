import { PrimitiveConverters } from './data-converter';
import { getPropertyName } from './utils';

export abstract class Ref {
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
    return this;
  }

  toString() {
    return this.toExpression();
  }

  abstract toExpression(): string;
}

export class ConstRef extends Ref {
  constructor(public readonly value: unknown) {
    super();
  }

  toExpression() {
    return JSON.stringify(this.value);
  }
}

export interface ConstRefConstructor<T extends ConstRef> {
  new (value: T['value']): T;
}

export class SpecialConstRef extends ConstRef {
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

export class UndefinedRef extends SpecialConstRef {
  static value = new UndefinedRef();

  private constructor() {
    super(void 0, 'void 0');
  }
}

export class KeyRef extends ConstRef {
  protected constructor(public readonly value: PropertyKey) {
    super(value);
  }

  toKey(): string {
    return getPropertyName(this.value);
  }
}

export class StringRef extends KeyRef {
  constructor(public readonly value: string) {
    super(value);
  }
}

export class NumberRef extends KeyRef {
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

export class SymbolRef extends KeyRef {
  constructor(public readonly value: symbol) {
    super(value);
  }
}

export class BigIntRef extends ConstRef {
  constructor(public readonly value: bigint) {
    super(value);
  }

  toExpression() {
    return `BigInt('${this.value.toString()}')`;
  }
}

export class ObjectRef extends ConstRef {
  public children = new Map<KeyRef, Ref>();

  static null = new SpecialConstRef(null, 'null');

  constructor(public readonly value: object) {
    super(value);
  }

  addProperty(name: KeyRef, value: Ref): void {
    this.children.set(name, value);
  }

  toExpression() {
    const keyVals = [];
    for (const [keyRef, valRef] of this.children) {
      const key = keyRef.toKey();
      const val = valRef.toExpression();
      // object shorthand
      keyVals.push(key === val ? key : key + ':' + val);
    }
    return '{' + keyVals.join(',') + '}';
  }
}

export class ArrayRef extends ObjectRef {
  constructor(public readonly value: unknown[]) {
    super(value);
  }

  toExpression() {
    const vals = [];
    let i = 0;
    for (const [keyRef, valRef] of this.children) {
      if (i++ !== keyRef.value) throw new Error('Whoops#!');
      const val = valRef.toExpression();
      vals.push(val);
    }
    return '[' + vals.join(',') + ']';
  }
}

export class FunctionRef extends ObjectRef {
  constructor(public readonly value: Function) {
    super(value);
  }
}

export class RefPool<T extends ConstRef> {
  private refs = new Map<T['value'], T>();
  constructor(private RefConstructor: ConstRefConstructor<T>) {}

  ref(value: T['value'], create?: (ref: T) => T | void): T {
    const existingRef = this.refs.get(value);
    if (existingRef) return existingRef.ref();

    const newRef = new this.RefConstructor(value);
    const resolvedRef = (create && create(newRef)) || newRef;
    this.refs.set(value, resolvedRef);
    return resolvedRef;
  }
}

export class RefConverter extends PrimitiveConverters<Ref, unknown[]> {
  private stringPool = new RefPool(StringRef);
  private objectPool = new RefPool(ObjectRef);
  private allRefs = new Set<Ref>();

  addConst(name: string, value: unknown): Ref {
    const ref = this.convert(value).setName(name);
    return ref;
  }

  convert(value: unknown, ctx: unknown[] = []): Ref {
    if (ctx.includes(value)) {
      throw new Error('Circular value detected');
    }
    const ref = super.convert(value, ctx);
    this.allRefs.add(ref);
    return ref;
  }

  ['string'](value: string, _ctx: unknown[]): StringRef {
    return this.stringPool.ref(value);
  }

  ['number'](value: number, _ctx: unknown[]): Ref {
    return new NumberRef(value);
  }

  ['bigint'](value: bigint, _ctx: unknown[]): Ref {
    return new BigIntRef(value);
  }

  ['boolean'](value: boolean, _ctx: unknown[]): Ref {
    return new ConstRef(value);
  }

  ['symbol'](value: symbol, _ctx: unknown[]): Ref {
    return new SymbolRef(value);
  }

  ['undefined'](_value: undefined, _ctx: unknown[]): Ref {
    return UndefinedRef.value;
  }

  ['object'](value: object, ctx: unknown[]): Ref {
    if (value === null) return ObjectRef.null;

    return this.objectPool.ref(value, (ref) => {
      if (Array.isArray(value)) ref = new ArrayRef(value);

      for (const [key, val] of Object.entries(value)) {
        ref.addProperty(this.convert(key) as KeyRef, this.convert(val, [value, ...ctx]));
      }

      return ref;
    });
  }

  ['function'](value: Function, _ctx: unknown[]): Ref {
    return this.objectPool.ref(value, () => {
      return new FunctionRef(value);
    });
  }

  toString() {
    let uniqId = 0;
    const statements: string[] = [];
    for (const ref of this.allRefs) {
      if (ref.name || ref.refCount > 1) {
        statements.push(`const ${ref.name || `$$${++uniqId}`} = ${ref.toExpression()};`);
      }
    }
    return statements.join('\n');
  }
}
