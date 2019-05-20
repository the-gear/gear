import { ArrayValue } from './array-value';
import { BigIntValue } from './bigint-value';
import { BooleanValue } from './boolean-value';
import { FunctionValue } from './function-value';
import { NumberValue } from './number-value';
import { ObjectValue } from './object-value';
import { StringValue } from './string-value';
import { SymbolValue } from './symbol-value';
import { UndefinedValue } from './undefined-value';
import { isTsSource, RawSource } from '../ts-source';

export type Value =
  | UndefinedValue
  | NumberValue
  | BooleanValue
  | StringValue
  | BigIntValue
  | ArrayValue
  | ObjectValue
  | SymbolValue
  | FunctionValue;

export function value(data: null | undefined): RawSource;
export function value(data: number): NumberValue;
export function value(data: boolean): BooleanValue;
export function value(data: string): StringValue;
export function value(data: bigint): BigIntValue;
export function value(data: Array<unknown>): ArrayValue;
export function value(data: symbol): SymbolValue;
export function value(data: Function): FunctionValue;
export function value(data: object): ObjectValue;
export function value(data: unknown): Value;
export function value(data: unknown): Value {
  switch (typeof data) {
    case 'undefined': {
      return new UndefinedValue();
    }

    case 'number': {
      return new NumberValue(data);
    }

    case 'boolean': {
      return new BooleanValue(data);
    }

    case 'string': {
      return new StringValue(data);
    }

    case 'bigint': {
      return new BigIntValue(data);
    }

    case 'object': {
      if (data === null) return ObjectValue.null;

      if (isTsSource(data)) {
        return data;
      }

      if (Array.isArray(data)) return new ArrayValue(data);

      return new ObjectValue(data);
    }

    case 'symbol': {
      return new SymbolValue(data);
    }

    case 'function': {
      return new FunctionValue(data);
    }

    default: {
      /* istanbul ignore next */
      throw new Error(`[ts-source-builder] Unhandled case of type ${typeof data}`);
    }
  }
}
