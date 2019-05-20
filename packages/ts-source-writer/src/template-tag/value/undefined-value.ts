import { SourceFragment } from '../ts-source';
import { SourceResolver } from '../source-resolver';

export class UndefinedValue extends SourceFragment {
  constructor() {
    super();
  }

  write(resolver: SourceResolver) {
    resolver.writeUndefined();
  }
}
