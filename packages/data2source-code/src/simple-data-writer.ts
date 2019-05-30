import { getPropertyName } from './utils';
import { AbstractDataVisitor } from './abstract-data-visitor';

export class SimpleDataWriter extends AbstractDataVisitor {
  private code: string[] = [];

  public static stringify(value: unknown): string {
    return new this().stringify(value);
  }

  public stringify(value: unknown): string {
    this.visit(value);

    return this.toString();
  }

  protected write(s: string): void {
    this.code.push(s);
  }

  protected deleteLast(reTest: RegExp): void {
    const str = this.code[this.code.length - 1];
    if (reTest.test(str)) {
      this.code.pop();
    }
  }

  protected ['string'](value: string): void {
    return this.write(JSON.stringify(value));
  }

  protected ['number'](value: number): void {
    if (Number.isNaN(value)) return this.write('NaN');
    if (value === Number.POSITIVE_INFINITY) return this.write('Infinity');
    if (value === Number.NEGATIVE_INFINITY) return this.write('-Infinity');
    return this.write(value.toString());
  }

  protected ['bigint'](value: bigint): void {
    return this.write(`BigInt('${value.toString()}')`);
  }

  protected ['boolean'](value: boolean): void {
    return this.write(value ? 'true' : 'false');
  }

  protected ['symbol'](_value: symbol): void {
    throw new Error(`Not implemented: symbol`);
  }

  protected ['undefined'](_value: undefined): void {
    return this.write('void 0');
  }

  protected ['function'](_value: Function): void {
    throw new Error(`Not implemented: function`);
  }

  protected visitNull() {
    this.write('null');
  }

  protected visitArray(value: unknown[]): void {
    this.write('[');
    this.visitArrayValues(value);
    if (value.length) {
      this.deleteLast(/,\s*$/m);
    }
    this.write(']');
  }

  protected visitObject(value: object): void {
    this.write('{');
    this.visitObjectProperties(value, false);
    this.deleteLast(/,\s*$/m);
    this.write('}');
  }

  protected visitPropertyKey(key: PropertyKey): void {
    this.write(getPropertyName(key));
    this.write(':');
  }

  protected visitProperty(
    value: unknown,
    key: PropertyKey,
    parent: object,
    isArray: boolean,
  ): void {
    if (isArray && !Object.prototype.hasOwnProperty.call(parent, key)) {
      this.write('');
    } else {
      this.visit(value);
    }
    this.write(',');
  }

  toString() {
    return this.code.join('');
  }
}
