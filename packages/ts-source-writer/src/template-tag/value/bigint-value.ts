import { SourceFragment } from '../ts-source';
import { SourceResolver } from '../source-resolver';

export class BigIntValue extends SourceFragment {
  constructor(public ref: bigint) {
    super();
  }

  write(resolver: SourceResolver) {
    resolver.writeBigInt(this.ref);
  }
}
