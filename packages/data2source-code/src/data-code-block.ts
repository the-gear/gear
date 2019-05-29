import { ValueConverter, Value } from './ref-converter';

export class DataCodeBlock {
  constants = new Map<string, Value>();
  refConverter = new ValueConverter();

  addConst(name: string, value: unknown): Value {
    const ref = this.refConverter.addConst(name, value);
    return ref;
  }

  toString(): string {
    return this.refConverter.toString();
  }
}
