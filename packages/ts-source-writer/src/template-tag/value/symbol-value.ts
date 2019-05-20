import { SourceResolver } from '../source-resolver';
import { SourceFragment } from '../source';

export class SymbolValue extends SourceFragment {
  constructor(public ref: symbol) {
    super();
  }

  resolve(resolver: SourceResolver) {
    resolver.addRef(this.ref);
  }

  write(resolver: SourceResolver) {
    resolver.writeSymbol(this.ref);
  }
}
