import { SourceFragment } from '../ts-source';
import { SourceWriter } from '../source-writer';

export class StringValue extends SourceFragment {
  constructor(public ref: string) {
    super();
  }

  write(writer: SourceWriter) {
    writer.writeString(this.ref);
  }
}
