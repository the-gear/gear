import { NotSerializableValue } from './not-serializable-value';

export class FunctionValue extends NotSerializableValue {
  constructor(public ref: Function) {
    super();
  }

  toString() {
    // Well, I can register symbols on module and emit reference here, but...
    return `undefined /* ${this.ref.toString().replace(/\*\//g, '* /')} */`;
  }
}
