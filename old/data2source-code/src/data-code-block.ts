import { Identifiers, Ref } from './identifiers';
import { RefVisitor } from './ref-visitor';
import { JsDataWriter } from './js-data-writer';

export class DataCodeBlock {
  identifiers = new Identifiers();
  refVisitor = new RefVisitor(this.identifiers);

  /** Add data which may be used only inside module */
  addConst(name: string, value: unknown): Ref {
    this.refVisitor.add(value);
    return this.identifiers.getFor(value).setName(name, false);
  }

  /** Exported data */
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
      ident.getAliases().forEach((alias) => {
        dataWriter.writeDefinition(
          alias,
          ident.value,
          this.identifiers.isExportName(alias) ? 'export const' : 'const',
        );
      });
    }
    return dataWriter.toString();
  }
}
