import { SourceFragment } from '../ts-source';

export class BooleanValue extends SourceFragment {
  constructor(public ref: boolean) {
    super();
  }

  toString() {
    return this.ref ? 'true' : 'false';
  }
}
