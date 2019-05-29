import { getPropertyName } from './utils';

export type ReturnOfTypeof =
  | 'string'
  | 'number'
  | 'bigint'
  | 'boolean'
  | 'symbol'
  | 'undefined'
  | 'object'
  | 'function';

export interface Converter<T, Context = void> {
  convert(value: unknown, ctx: Context): T;
}

export interface TypeofConverters<T, Context = unknown[]> extends Converter<T, Context> {
  ['string'](value: string, ctx: Context): T;
  ['number'](value: number, ctx: Context): T;
  ['bigint'](value: bigint, ctx: Context): T;
  ['boolean'](value: boolean, ctx: Context): T;
  ['symbol'](value: symbol, ctx: Context): T;
  ['undefined'](value: undefined, ctx: Context): T;
  ['object'](value: object, ctx: Context): T;
  ['function'](value: Function, ctx: Context): T;
}

export abstract class PrimitiveConverters<T, Context = unknown[]>
  implements TypeofConverters<T, Context> {
  convert(value: unknown, ctx: Context): T {
    const type = typeof value;
    return (this[type] as this['convert'])(value, ctx);
  }

  abstract ['string'](value: string, ctx: Context): T;
  abstract ['number'](value: number, ctx: Context): T;
  abstract ['bigint'](value: bigint, ctx: Context): T;
  abstract ['boolean'](value: boolean, ctx: Context): T;
  abstract ['symbol'](value: symbol, ctx: Context): T;
  abstract ['undefined'](value: undefined, ctx: Context): T;
  abstract ['object'](value: object, ctx: Context): T;
  abstract ['function'](value: Function, ctx: Context): T;
}

export class PrimitiveSerializer extends PrimitiveConverters<string, unknown[]> {
  convert(value: unknown, ctx: unknown[] = []): string {
    if (ctx.includes(value)) {
      throw new Error('Circular value detected');
    }
    return super.convert(value, ctx);
  }

  ['string'](value: string, _ctx: unknown[]): string {
    return JSON.stringify(value);
  }

  ['number'](value: number, _ctx: unknown[]): string {
    if (Number.isNaN(value)) return 'NaN';
    if (value === Number.POSITIVE_INFINITY) return 'Infinity';
    if (value === Number.NEGATIVE_INFINITY) return '-Infinity';
    return value.toString();
  }

  ['bigint'](value: bigint, _ctx: unknown[]): string {
    return `BigInt('${value.toString()}')`;
  }

  ['boolean'](value: boolean, _ctx: unknown[]): string {
    return value ? 'true' : 'false';
  }

  ['symbol'](_value: symbol, _ctx: unknown[]): string {
    throw new Error(`Not implemented: symbol`);
  }

  ['undefined'](_value: undefined, _ctx: unknown[]): string {
    return 'void 0';
  }

  ['object'](value: object, ctx: unknown[]): string {
    if (value === null) return 'null';
    if (Array.isArray(value)) return this.serializeArray(value, ctx);
    return this.serializeObject(value, ctx);
  }

  ['function'](_value: Function, _ctx: unknown[]): string {
    throw new Error(`Not implemented: function`);
  }

  protected serializeArray(array: unknown[], ctx: unknown[]): string {
    return '[' + array.map((val) => this.convert(val, [array, ...ctx])).join(',') + ']';
  }

  protected serializeObject(obj: object, ctx: unknown[]): string {
    const keyVals = [];
    for (const [key, val] of Object.entries(obj)) {
      const serializedValue = this.convert(val, [obj, ...ctx]);
      keyVals.push(getPropertyName(key) + ':' + serializedValue);
    }
    return '{' + keyVals.join(',') + '}';
  }
}
