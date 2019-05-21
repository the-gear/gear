import { SourceFragment } from './source';
import { SourceResolver } from './source-resolver';

export type IdentifierConfig = {
  name?: string;
  possibleNames?: string[];
  noRename?: boolean;
  isExported?: boolean;
};

export type IdentifierOptions = IdentifierConfig | string | string[];

export class Identifier extends SourceFragment implements IdentifierConfig {
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

  resolve(resolver: SourceResolver) {
    if (this.name) {
      resolver.reserveIdentifier(this.name);
      this.resolvedName = this.name;
    }
  }

  write(resolver: SourceResolver) {
    resolver.writeCode(this.resolvedName as string);
  }
}
