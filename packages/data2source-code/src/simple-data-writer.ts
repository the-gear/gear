import { getPropertyName } from './utils';
import { DataVisitor } from './data-visitor';
import { parentPort } from 'worker_threads';

export class SimpleDataWriter extends DataVisitor {
  private code: string[] = [];

  write(s: string): void {
    this.code.push(s);
  }
  replaceLast(s: string): void {
    this.code[this.code.length - 1] = s;
  }

  ['string'](value: string): void {
    return this.write(JSON.stringify(value));
  }

  ['number'](value: number): void {
    if (Number.isNaN(value)) return this.write('NaN');
    if (value === Number.POSITIVE_INFINITY) return this.write('Infinity');
    if (value === Number.NEGATIVE_INFINITY) return this.write('-Infinity');
    return this.write(value.toString());
  }

  ['bigint'](value: bigint): void {
    return this.write(`BigInt('${value.toString()}')`);
  }

  ['boolean'](value: boolean): void {
    return this.write(value ? 'true' : 'false');
  }

  ['symbol'](_value: symbol): void {
    throw new Error(`Not implemented: symbol`);
  }

  ['undefined'](_value: undefined): void {
    return this.write('void 0');
  }

  ['function'](_value: Function): void {
    throw new Error(`Not implemented: function`);
  }

  visitNull() {
    this.write('null');
  }

  visitArray(value: unknown[]): void {
    this.write('[');
    this.visitArrayValues(value);
    this.replaceLast(']');
  }

  visitObject(value: object): void {
    this.write('{');
    this.visitObjectProperties(value, false);
    this.replaceLast('}');
  }

  visitPropertyKey(key: PropertyKey): void {
    this.write(getPropertyName(key));
    this.write(':');
  }

  visitProperty(value: unknown, key: PropertyKey, parent: object, isArray: boolean): void {
    if (!isArray || Object.prototype.hasOwnProperty.call(parent, key)) this.visit(value);
    this.write(',');
  }

  toString() {
    return this.code.join('');
  }

  stringify(value: unknown): string {
    this.visit(value);

    return this.toString();
  }

  static stringify(value: unknown): string {
    return new this().stringify(value);
  }
}
