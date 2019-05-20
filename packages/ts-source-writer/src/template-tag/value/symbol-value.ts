import { NotSerializableValue } from './not-serializable-value';
import { SourceWriter } from '../source-writer';

export class SymbolValue extends NotSerializableValue {
  constructor(public ref: symbol) {
    super();
  }

  write(writer: SourceWriter) {
    writer.writeSymbol(this.ref);
  }
}
