import { SourceModule } from './source-module';

export const sourceSymbol = Symbol();

export interface TsSource {
  readonly __tsSource: typeof sourceSymbol;
  collect?(modul: SourceModule): void;
  resolve?(modul: SourceModule): void;
  getSource(modul: SourceModule): string;
  toString(modul?: SourceModule): string;
}

export class SourceAtom implements TsSource {
  readonly __tsSource: typeof sourceSymbol = sourceSymbol;
  getSource(_modul: SourceModule): string {
    return '';
  }
}

export function isTsSource(value: any): value is TsSource {
  return value && value.__tsSource === sourceSymbol;
}
