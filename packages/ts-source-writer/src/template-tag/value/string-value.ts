import { SourceFragment } from '../source';
import { SourceResolver } from '../source-resolver';

export class StringValue extends SourceFragment {
  constructor(public ref: string) {
    super();
  }

  // resolve(resolver: SourceResolver) {
  //   resolver.addRef(this.ref);
  // }

  write(resolver: SourceResolver) {
    resolver.writeString(this.ref);
  }
}
