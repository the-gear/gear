import { SourceAtom } from './source-atom';
import { SourceModule } from './source-module';

export type IdentifierConfig = {
  name?: string;
  possibleNames?: string[];
  noRename?: boolean;
  isExported?: boolean;
};

export type IdentifierOptions = IdentifierConfig | string | string[];

export class Identifier extends SourceAtom implements IdentifierConfig {
  name?: string;
  possibleNames?: string[];
  noRename?: boolean;
  isExported?: boolean;
  resolvedName?: string;

  constructor(config?: IdentifierOptions) {
    super();
    if (typeof config === 'string') {
      this.name = config;
      this.noRename = true;
    } else if (typeof config !== 'undefined') {
      if (Array.isArray(config)) {
        this.possibleNames = config;
      } else {
        this.name = config.name;
        this.noRename = config.noRename;
      }
    }
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
