import { SourceResolver } from './source-resolver';

export const __Source = Symbol();

export function isSource(value: any): value is Source {
  return value && value[__Source];
}

export function assertSource(value: Source): void;
export function assertSource(value: any): never;
export function assertSource(value: any) {
  if (!isSource(value)) throw new Error('Assertion failed');
}

export interface Source {
  readonly [__Source]: true;
  readonly dependencies?: ReadonlyArray<Source>;
  resolve?: (resolver: SourceResolver) => void;
  write?: (resolver: SourceResolver) => void;
}

export class SourceFragment implements Source {
  readonly [__Source] = true;

  toString(): string {
    return new SourceResolver()
      .resolve(this)
      .write(this)
      .getTsCode();
  }
}

export class SourceFragments extends SourceFragment {
  readonly dependencies: ReadonlyArray<Source>;

  constructor(fragments: ReadonlyArray<Source>) {
    super();
    this.dependencies = fragments;
  }

  resolve(resolver: SourceResolver) {
    this.dependencies.forEach((dep) => dep.resolve && dep.resolve(resolver));
    return this;
  }

  write(resolver: SourceResolver) {
    this.dependencies.forEach((dep) => dep.write && dep.write(resolver));
  }
}

export class RawSource extends SourceFragment {
  constructor(private source: string) {
    super();
  }

  write(resolver: SourceResolver) {
    resolver.writeCode(this.source);
  }

  toString(): string {
    return this.source;
  }
}
