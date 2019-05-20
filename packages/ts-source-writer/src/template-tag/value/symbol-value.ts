import { NotSerializableValue } from './not-serializable-value';
import { SourceResolver } from '../source-resolver';

export class SymbolValue extends NotSerializableValue {
  constructor(public ref: symbol) {
    super();
  }

  write(writer: SourceResolver) {
    writer.writeSymbol(this.ref);
  }
}
