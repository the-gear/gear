import { Identifiers, Ref } from './identifiers';
import { RefVisitor } from './ref-visitor';
import { JsDataWriter } from './js-data-writer';

export class DataCodeBlock {
  identifiers = new Identifiers();
  refVisitor = new RefVisitor(this.identifiers);

  addExport(name: string, value: unknown): Ref {
    this.refVisitor.add(value);
    return this.identifiers.getFor(value).setName(name, true);
  }

  toString(): string {
    const dataWriter = new JsDataWriter();
    for (const ident of this.refVisitor.getIdentifiers()) {
      const name = ident.getName();

      dataWriter.writeDefinition(
        name,
        ident.value,
        this.identifiers.isExportName(name) ? 'export const' : 'const',
      );
      dataWriter.writeRaw('\n');
    }
    return dataWriter.toString();
  }
}
