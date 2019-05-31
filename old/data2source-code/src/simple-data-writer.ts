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

  public ensureNewline(): this {
    const length = this.code.length;
    if (!length) return this;
    if (!this.code[length - 1].endsWith('\n')) {
      this.code.push('\n');
    }
    return this;
  }

  public writeRaw(...str: string[]): this {
    str.forEach((s) => this.code.push(s));
    return this;
  }

  protected deleteLast(reTest: RegExp): void {
    const str = this.code[this.code.length - 1];
    if (reTest.test(str)) {
      this.code.pop();
    }
  }

  protected ['string'](value: string): void {
    this.writeRaw(JSON.stringify(value));
  }

  protected ['number'](value: number): void {
    if (Number.isNaN(value)) {
      this.writeRaw('NaN');
    } else if (value === Number.POSITIVE_INFINITY) {
      this.writeRaw('Infinity');
    } else if (value === Number.NEGATIVE_INFINITY) {
      this.writeRaw('-Infinity');
    } else {
      this.writeRaw(value.toString());
    }
  }

  protected ['bigint'](value: bigint): void {
    this.writeRaw(`BigInt('${value.toString()}')`);
  }

  protected ['boolean'](value: boolean): void {
    this.writeRaw(value ? 'true' : 'false');
  }

  protected ['symbol'](_value: symbol): void {
    throw new Error(`Not implemented: symbol`);
  }

  protected ['undefined'](_value: undefined): void {
    this.writeRaw('void 0');
  }

  protected ['function'](_value: Function): void {
    throw new Error(`Not implemented: function`);
  }

  protected visitNull() {
    this.writeRaw('null');
  }

  protected visitArray(value: unknown[]): void {
    this.writeRaw('[');
    this.visitArrayValues(value);
    if (value.length) {
      this.deleteLast(/,\s*$/m);
    }
    this.writeRaw(']');
  }

  protected visitObject(value: object): void {
    this.writeRaw('{');
    this.visitObjectProperties(value, false);
    this.deleteLast(/,\s*$/m);
    this.writeRaw('}');
  }

  protected visitPropertyKey(key: PropertyKey): void {
    this.writeRaw(getPropertyName(key));
    this.writeRaw(':');
  }

  protected visitProperty(
    value: unknown,
    key: PropertyKey,
    parent: object,
    isArray: boolean,
  ): void {
    if (isArray && !Object.prototype.hasOwnProperty.call(parent, key)) {
      this.writeRaw('');
    } else {
      this.visit(value);
    }
    this.writeRaw(',');
  }

  toString() {
    return this.code.join('');
  }
}
