import { SimpleDataWriter } from './simple-data-writer';
import { getPropertyPath } from './utils';

export class JsDataWriter extends SimpleDataWriter {
  private name: string | null = null;
  private circulars: string[] = [];
  private refs = new Map<object, string>();

  constructor(public valueSubstitutions: Map<unknown, string> = new Map<unknown, string>()) {
    super();
  }

  public static writeDefinition(name: string, value: unknown): string {
    return new this().writeDefinition(name, value).toString();
  }

  public addSubstitution(value: unknown, subst: string): this {
    this.valueSubstitutions.set(value, subst);
    return this;
  }

  public writeDefinition(name: string, value: unknown, binding: string = 'const'): this {
    this.name = name;
    this.ensureNewline();
    this.writeRaw(`${binding} ${name} = `);
    this.visit(value);
    this.writeRaw(`;`);
    this.name = null;

    if (this.circulars.length) {
      this.ensureNewline();
      this.writeRaw(this.circulars.join('\n'));
      this.circulars = [];
    }

    this.valueSubstitutions.set(value, name);
    for (const [val, path] of this.refs) {
      if (!this.valueSubstitutions.has(val)) {
        this.addSubstitution(val, path);
      }
    }

    this.refs = new Map();
    return this;
  }

  visit(value: unknown): void {
    const replace = this.valueSubstitutions.get(value);
    if (replace) {
      this.writeRaw(replace);
    } else {
      super.visit(value);
    }
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
        this.writeRaw(`[/* ref ${writtenPath} */]`);
      } else {
        this.writeRaw(`{/* ref ${writtenPath} */}`);
      }
      this.circulars.push(`${path} = ${writtenPath}; /*ref*/`);
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
      this.writeRaw(`[/* circular ${shortPath} */]`);
    } else {
      this.writeRaw(`{/* circular ${shortPath} */}`);
    }
    this.writeRaw(',');
    this.circulars.push(`${longPath} = ${shortPath}; /*circ*/`);
  }
}
