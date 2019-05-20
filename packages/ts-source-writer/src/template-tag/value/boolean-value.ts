import { SourceFragment } from '../ts-source';
import { SourceWriter } from '../source-writer';

export class BooleanValue extends SourceFragment {
  constructor(public ref: boolean) {
    super();
  }

  write(writer: SourceWriter) {
    writer.writeBoolean(this.ref);
  }
}
