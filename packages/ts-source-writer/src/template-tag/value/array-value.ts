import { SourceFragment } from '../ts-source';

export class ArrayValue extends SourceFragment {
  constructor(public ref: unknown[]) {
    super();
  }
}
