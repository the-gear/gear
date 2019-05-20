import { SourceWriter } from './source-writer';

export const __tsSource = Symbol();

export function isTsSource(value: any): value is TsSource {
  return value && value[__tsSource];
}

export interface TsSource {
  readonly [__tsSource]: true;
  readonly dependencies?: ReadonlyArray<TsSource>;
  resolve?: (writer: SourceWriter) => void;
  write?: (writer: SourceWriter) => void;
}

export class SourceFragment implements TsSource {
  readonly [__tsSource] = true;

  toString(): string {
    return new SourceWriter()
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

  resolve(writer: SourceWriter) {
    this.dependencies.forEach((dep) => dep.resolve && dep.resolve(writer));
  }

  write(writer: SourceWriter) {
    this.dependencies.forEach((dep) => dep.write && dep.write(writer));
  }
}

export class RawSource extends SourceFragment {
  constructor(private source: string) {
    super();
  }

  write(writer: SourceWriter) {
    writer.write(this.source);
  }

  toString(): string {
    return this.source;
  }
}
