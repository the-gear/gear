import { Identifiers, Ref } from './identifiers';
import { RefVisitor } from './ref-visitor';
import { JsDataWriter } from './js-data-writer';

export class DataCodeBlock {
  identifiers = new Identifiers<unknown>();
  refVisitor = new RefVisitor();

  addConst(name: string, value: unknown): Ref<unknown> {
    this.refVisitor.add(value);
    return this.identifiers.getFor(value).setName(name);
  }

  toString(): string {
    const dataWriter = new JsDataWriter();
    const idents = [];
    for (const value of this.refVisitor.getDuplicates()) {
      idents.push(this.identifiers.getFor(value));
    }
    for (const ident of idents) {
      dataWriter.writeAssignment(ident.getName(), ident.value);
    }
    return dataWriter.toString();
  }
}
