import { ValueConverter, Value } from './ref-converter';
import { Identifiers, Ref } from './identifiers';

export class DataCodeBlock {
  identifiers = new Identifiers<Value>();
  refConverter = new ValueConverter(this.identifiers);

  addConst(name: string, value: unknown): Ref<Value> {
    const ref = this.refConverter.addConst(name, value);
    return ref;
  }

  toString(): string {
    let uniqId = 0;
    const statements: string[] = [];
    for (const ref of this.allValues) {
      if (ref.name || ref.refCount > 1) {
        statements.push(
          `const ${ref.name || `$$${++uniqId}`} = ${ref.toExpression()}; // ${ref.refCount}`,
        );
      }
    }
    return statements.join('\n');
  }
}
