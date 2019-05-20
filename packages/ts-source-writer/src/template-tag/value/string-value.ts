import { SourceFragment } from '../ts-source';

export class StringValue extends SourceFragment {
  constructor(public ref: string) {
    super();
  }

  toString() {
    return JSON.stringify(this.ref);
  }
}
