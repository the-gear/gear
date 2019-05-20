import { SourceFragment } from '../ts-source';
import { SourceResolver } from '../source-resolver';

export class BooleanValue extends SourceFragment {
  constructor(public ref: boolean) {
    super();
  }

  write(writer: SourceResolver) {
    writer.writeBoolean(this.ref);
  }
}
