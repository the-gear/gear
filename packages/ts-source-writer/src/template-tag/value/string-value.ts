import { SourceFragment } from '../ts-source';
import { SourceResolver } from '../source-resolver';

export class StringValue extends SourceFragment {
  constructor(public ref: string) {
    super();
  }

  write(writer: SourceResolver) {
    writer.writeString(this.ref);
  }
}
