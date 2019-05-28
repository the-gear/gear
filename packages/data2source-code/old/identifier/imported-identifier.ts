import { Identifier } from './identifier';

export class ImportedIdentifier extends Identifier {
  constructor(public from: string, public importName: string | null = null) {
    super(null);
    if (importName) {
      this.suggestName(importName);
    }
  }
}
