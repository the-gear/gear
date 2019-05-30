import { SimpleDataWriter } from './simple-data-writer';
import { getPropertyPath } from './utils';

export class JsDataWriter extends SimpleDataWriter {
  private name: string | null = null;
  private circulars: string[] = [];
  private refs = new Map<object, string>();

  public static writeAssignment(name: string, value: unknown): string {
    return new this().writeAssignment(name, value);
  }

  public writeAssignment(name: string, value: unknown): string {
    this.name = name;
    this.write(`const ${name} = `);
    this.visit(value);
    this.write(`;`);
    this.name = null;

    if (this.circulars.length) {
      this.write('\n');
      this.write(this.circulars.join('\n'));
      this.circulars = [];
    }

    return this.toString();
  }

  protected ['object'](value: object): void {
    /* istanbul ignore next */
    if (!this.name) throw new Error('Name is not defined!');

    if (value === null) return this.visitNull();
    const isArray = Array.isArray(value);
    const writtenPath = this.refs.get(value);
    const path = getPropertyPath(this.name, this.parentKeys);
    if (writtenPath) {
      if (isArray) {
        this.write(`[/* ref ${writtenPath} */]`);
      } else {
        this.write(`{/* ref ${writtenPath} */}`);
      }
      this.circulars.push(`${path} = ${writtenPath}; // ref`);
    } else {
      super['object'](value);
      this.refs.set(value, path);
    }
  }

  protected visitRecursiveProperty(
    value: object,
    _key: PropertyKey,
    _parent: object,
    _isArray: boolean,
  ): void {
    /* istanbul ignore next */
    if (!this.name) throw new Error('Name is not defined!');

    const index = this.parents.indexOf(value);
    const shortPath = getPropertyPath(this.name, this.parentKeys.slice(0, index));
    const longPath = getPropertyPath(this.name, this.parentKeys);
    if (Array.isArray(value)) {
      this.write(`[/* circular ${shortPath} */]`);
    } else {
      this.write(`{/* circular ${shortPath} */}`);
    }
    this.write(',');
    this.circulars.push(`${longPath} = ${shortPath}; // circular`);
  }
}
