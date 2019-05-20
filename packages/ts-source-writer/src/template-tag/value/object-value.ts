import { SourceFragment, RawSource } from '../source';
import { SourceResolver } from '../source-resolver';

export class ObjectValue extends SourceFragment {
  constructor(public ref: {}) {
    super();
  }

  resolve(resolver: SourceResolver) {
    resolver.addRef(this.ref);
  }

  write(resolver: SourceResolver) {
    resolver.writeObject(this.ref);
  }

  static readonly null = new RawSource('null');
}
