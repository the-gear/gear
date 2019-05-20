import { NotSerializableValue } from './not-serializable-value';

export class SymbolValue extends NotSerializableValue {
  constructor(public ref: symbol) {
    super();
  }

  toString() {
    // Well, I can register symbols on module and emit reference here, but...
    return `undefined /* ${this.ref.toString().replace(/\*\//g, '* /')} */`;
  }
}
