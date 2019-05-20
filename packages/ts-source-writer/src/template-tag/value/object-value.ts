import { SourceFragment, RawSource } from '../ts-source';
import { SourceResolver } from '../source-resolver';

export class ObjectValue extends SourceFragment {
  constructor(public ref: object) {
    super();
  }

  resolve(resolver: SourceResolver) {
    resolver.addRef(this.ref);
  }

  write(resolver: SourceResolver) {
    resolver.writeRef(this.ref);
  }

  static readonly null = new RawSource('null');
}
