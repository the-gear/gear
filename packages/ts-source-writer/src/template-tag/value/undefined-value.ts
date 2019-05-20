import { SourceFragment } from '../ts-source';

export class UndefinedValue extends SourceFragment {
  constructor() {
    super();
  }

  toString() {
    return 'undefined';
  }
}
