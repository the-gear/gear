import { SourceFragment } from '../ts-source';
import { SourceWriter } from '../source-writer';

export class NumberValue extends SourceFragment {
  constructor(public ref: number) {
    super();
  }

  write(writer: SourceWriter) {
    writer.writeNumber(this.ref);
  }
}
