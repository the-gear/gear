import { Identifier } from './identifier';

export abstract class ValueIdentifier extends Identifier {
  constructor(public value: unknown) {
    super(null);
  }
}
