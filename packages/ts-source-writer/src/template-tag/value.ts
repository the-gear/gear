import { SourceFragment, isSource, Source } from './source';
import { SourceResolver } from './source-resolver';

export class SourceValue extends SourceFragment {
  constructor(public data: any) {
    super();
  }

  resolve(resolver: SourceResolver) {
    resolver.addRef(this.data);
  }

  write(resolver: SourceResolver) {
    resolver.writeRef(this.data);
  }
}

export function value(data: unknown): Source {
  if (isSource(data)) return data;
  return new SourceValue(data);
}
