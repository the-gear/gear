import { SourceFragment } from '../ts-source';

export class NumberValue extends SourceFragment {
  constructor(public ref: number) {
    super();
  }

  toString() {
    const n = this.ref;
    if (Number.isNaN(n)) return 'Number.NaN';
    if (n === Number.POSITIVE_INFINITY) return 'Number.POSITIVE_INFINITY';
    if (n === Number.NEGATIVE_INFINITY) return 'Number.NEGATIVE_INFINITY';
    return this.ref.toString();
  }
}
