import { SourceFragment, RawSource } from '../ts-source';
import { SourceResolver } from '../source-resolver';

export class ObjectValue extends SourceFragment {
  constructor(public ref: object) {
    super();
  }

  resolve(writer: SourceResolver) {
    writer.addRef(this.ref);
  }

  write(writer: SourceResolver) {
    writer.writeRef(this.ref);
  }

  static readonly null = new RawSource('null');
}
