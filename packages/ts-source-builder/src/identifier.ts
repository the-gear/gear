import { SourceAtom } from './source-atom';
import { SourceModule } from './source-module';

type IdentifierConfig = {
  name?: string;
  noRename?: boolean;
};

export class Identifier extends SourceAtom {
  name?: string;
  noRename?: boolean;
  resolvedName?: string;

  constructor(config: IdentifierConfig = {}) {
    super();
    this.name = config.name;
    this.noRename = config.noRename;
  }

  collect(modul: SourceModule) {
    if (this.noRename && this.name) {
      this.resolvedName = modul.useIdentifier(this.name);
    }
  }

  resolve(modul: SourceModule) {
    if (!this.resolvedName) {
      this.resolvedName = modul.getFreeIdentifier(this.name);
    }
  }

  getSource(modul: SourceModule) {
    return this.resolvedName || this.name || modul.getFreeIdentifier();
  }
}
