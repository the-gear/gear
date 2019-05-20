import { SourceResolver } from './source-resolver';

export const __tsSource = Symbol();

export function isTsSource(value: any): value is TsSource {
  return value && value[__tsSource];
}

export interface TsSource {
  readonly [__tsSource]: true;
  readonly dependencies?: ReadonlyArray<TsSource>;
  resolve?: (writer: SourceResolver) => void;
  write?: (writer: SourceResolver) => void;
}

export class SourceFragment implements TsSource {
  readonly [__tsSource] = true;

  toString(): string {
    return new SourceResolver()
      .resolve(this)
      .write(this)
      .getTsCode();
  }
}

export class SourceFragments extends SourceFragment {
  readonly dependencies: ReadonlyArray<TsSource>;

  constructor(fragments: ReadonlyArray<TsSource>) {
    super();
    this.dependencies = fragments;
  }

  resolve(writer: SourceResolver) {
    this.dependencies.forEach((dep) => dep.resolve && dep.resolve(writer));
  }

  write(writer: SourceResolver) {
    this.dependencies.forEach((dep) => dep.write && dep.write(writer));
  }
}

export class RawSource extends SourceFragment {
  constructor(private source: string) {
    super();
  }

  write(writer: SourceResolver) {
    writer.write(this.source);
  }

  toString(): string {
    return this.source;
  }
}
