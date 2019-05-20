import { SourceFragment } from '../ts-source';
import { SourceWriter } from '../source-writer';

export class BigIntValue extends SourceFragment {
  constructor(public ref: bigint) {
    super();
  }

  write(writer: SourceWriter) {
    writer.writeBigInt(this.ref);
  }
}
