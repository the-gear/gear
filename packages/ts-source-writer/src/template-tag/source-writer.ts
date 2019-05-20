export class SourceWriter {
  private source: string[] = [];

  getTsCode(): string {
    return this.source.join('');
  }

  writeCode(code: string): this {
    this.source.push(code);
    return this;
  }

  writeBigInt(bigint: bigint): this {
    return this.writeCode(`BigInt('${bigint.toString()}')`);
  }

  writeBoolean(bool: boolean): this {
    return this.writeCode(bool ? 'true' : 'false');
  }

  writeNumber(n: number): this {
    if (Number.isNaN(n)) return this.writeCode('Number.NaN');
    if (n === Number.POSITIVE_INFINITY) return this.writeCode('Number.POSITIVE_INFINITY');
    if (n === Number.NEGATIVE_INFINITY) return this.writeCode('Number.NEGATIVE_INFINITY');
    return this.writeCode(n.toString());
  }

  writeString(str: string): this {
    return this.writeCode(JSON.stringify(str));
  }

  writeSymbol(_sym: symbol): this {
    // Well, I can register symbols on module and emit reference here, but...
    // return this.writeCode(`undefined /* ${sym.toString().replace(/\*\//g, '* /')} */`);
    throw new Error(`TODO: Symbol`);
  }

  writeUndefined() {
    return this.writeCode('undefined');
  }

  writeNull(): this {
    return this.writeCode('null');
  }

  writeObject(obj: {}): this {
    return this.writeCode(JSON.stringify(obj));
  }

  writeArray(array: {}): this {
    return this.writeCode(JSON.stringify(array));
  }

  writeFunction(fn: Function): this {
    // TODO
    return this.writeCode(fn.toString());
  }

  writeValue(val: unknown): this {
    switch (typeof val) {
      case 'string':
        return this.writeString(val);
      case 'number':
        return this.writeNumber(val);
      case 'boolean':
        return this.writeBoolean(val);
      case 'bigint':
        return this.writeBigInt(val);
      case 'undefined':
        return this.writeUndefined();
      case 'object': {
        if (val === null) return this.writeNull();
        if (Array.isArray(val)) this.writeArray(val);
        return this.writeObject(val);
      }
      case 'symbol':
        return this.writeSymbol(val);
      case 'function':
        return this.writeFunction(val);
    }
    throw new Error(`[writeValue]: does not know how to write`);
  }
}
