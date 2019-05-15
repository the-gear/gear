import { SourceAtom } from './source-atom';

export class RawSource extends SourceAtom {
  private source: string;
  constructor(source: string) {
    super();
    this.source = source;
  }
  getSource(): string {
    return this.source;
  }
  toString(): string {
    return this.getSource();
  }
}
