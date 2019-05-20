import { SourceFragment } from '../ts-source';

export class BigIntValue extends SourceFragment {
  constructor(public ref: bigint) {
    super();
  }

  toString() {
    return `BigInt('${this.ref.toString()}')`;
  }
}
