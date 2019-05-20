import { SourceFragment } from '../ts-source';
import { SourceResolver } from '../source-resolver';

export class NumberValue extends SourceFragment {
  constructor(public ref: number) {
    super();
  }

  write(writer: SourceResolver) {
    writer.writeNumber(this.ref);
  }
}
