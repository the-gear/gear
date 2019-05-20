import { UndefinedValue } from './undefined-value';

export class NotSerializableValue extends UndefinedValue {
  constructor() {
    super();
  }

  toString() {
    return 'undefined';
  }
}
