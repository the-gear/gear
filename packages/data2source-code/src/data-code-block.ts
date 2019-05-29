import { RefConverter, Ref } from './ref-converter';

export class DataCodeBlock {
  constants = new Map<string, Ref>();
  refConverter = new RefConverter();

  addConst(name: string, value: unknown): Ref {
    const ref = this.refConverter.addConst(name, value);
    return ref;
  }

  toString(): string {
    return this.refConverter.toString();
  }
}
