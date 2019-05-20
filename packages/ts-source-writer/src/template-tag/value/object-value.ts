import { SourceFragment, RawSource } from '../ts-source';
import { SourceWriter } from '../source-writer';

export class ObjectValue extends SourceFragment {
  constructor(public ref: object) {
    super();
  }

  resolve(writer: SourceWriter) {
    writer.addRef(this.ref);
  }

  write(writer: SourceWriter) {
    writer.writeRef(this.ref);
  }

  static readonly null = new RawSource('null');
}
