import { SourceWriter } from './source-writer';

export const __tsSource = Symbol();

export function isTsSource(value: any): value is TsSource {
  return value && value.__tsSource === __tsSource;
}

export interface TsSource {
  readonly __tsSource: typeof __tsSource;
  readonly dependencies?: ReadonlyArray<TsSource>;
}

export class SourceFragment implements TsSource {
  readonly __tsSource: typeof __tsSource = __tsSource;

  toString(): string {
    return new SourceWriter(this).toString();
  }
}

export class SourceFragments extends SourceFragment {
  readonly dependencies: ReadonlyArray<TsSource>;

  constructor(fragments: ReadonlyArray<TsSource>) {
    super();
    this.dependencies = fragments;
  }
}

export class RawSource extends SourceFragment {
  constructor(private source: string) {
    super();
  }
  toString(): string {
    return this.source;
  }
}
