import { SourceFragment } from '../source';

export class ArrayValue extends SourceFragment {
  constructor(public ref: unknown[]) {
    super();
  }
}
