import { SourceModule } from './source-module';

export const tsSourceSymbol = Symbol();

export interface TsSource {
  readonly __tsSource: typeof tsSourceSymbol;
  collect(modul: SourceModule): void;
  resolve(modul: SourceModule): void;
  getSource(modul: SourceModule): string;
  toString(modul?: SourceModule): string;
}

export class SourceAtom implements TsSource {
  readonly __tsSource: typeof tsSourceSymbol = tsSourceSymbol;
  collect(_modul: SourceModule) {}
  resolve(_modul: SourceModule) {}
  getSource(_modul: SourceModule): string {
    return '';
  }
}

export function isTsSource(value: any): value is TsSource {
  return value && value.__tsSource === tsSourceSymbol;
}
