import { AbstractDataVisitor } from './abstract-data-visitor';
import { Identifiers, Ref } from './identifiers';

/**
 * Walk data tree and create Identifier for each seen object
 */
export class IdentifierVisitor extends AbstractDataVisitor {
  private refs = new Map<unknown, Ref<unknown> | null>();

  constructor(public identifiers: Identifiers<unknown>) {
    super();
  }

  public createId(name: string, value: unknown) {
    const ref = this.identifiers.getFor(value).setName(name);
    this.visit(value);
    return ref;
  }

  // protected ['string'](_value: string): void {}
  // protected ['number'](_value: number): void {}
  // protected ['bigint'](_value: bigint): void {}
  // protected ['boolean'](_value: boolean): void {}
  // protected ['symbol'](_value: symbol): void {}
  // protected ['undefined'](_value: undefined): void {}
  protected ['object'](value: object): void {
    if (value === null) return this.visitNull();
    if (Array.isArray(value)) return this.visitArray(value);
    return this.visitObject(value);
  }
  protected ['function'](_value: Function): void {}

  protected visitNull(): void {}

  protected visitArray(value: unknown[]): void {
    this.visitArrayValues(value);
  }

  protected visitObject(value: object): void {
    this.visitObjectProperties(value, false);
  }

  protected visitPropertyKey(_key: PropertyKey): void {}

  protected visitProperty(
    value: unknown,
    _key: PropertyKey,
    _parent: object,
    _isArray: boolean,
  ): void {
    this.visit(value);
  }

  protected visitRecursiveProperty(
    _value: unknown,
    _key: PropertyKey,
    _parent: object,
    _isArray: boolean,
  ): void {
    throw new Error(`Circular value detected`);
  }

  protected visitArrayValues(parent: unknown[]): void {
    this.parents.push(parent);
    try {
      const length = parent.length;
      for (let key = 0; key < length; key++) {
        const value = parent[key];
        this.parentKeys.push(key);
        try {
          if (this.parents.includes(value as any)) {
            this.visitRecursiveProperty(value, key, parent, true);
          } else {
            this.visitProperty(value, key, parent, true);
          }
        } finally {
          this.parentKeys.pop();
        }
      }
    } finally {
      this.parents.pop();
    }
  }

  protected visitObjectProperties(parent: object, isArray: boolean): void {
    this.parents.push(parent);
    try {
      for (const [key, value] of Object.entries(parent)) {
        this.parentKeys.push(key);
        try {
          this.visitPropertyKey(key);
          if (this.parents.includes(value)) {
            this.visitRecursiveProperty(value, key, parent, isArray);
          } else {
            this.visitProperty(value, key, parent, isArray);
          }
        } finally {
          this.parentKeys.pop();
        }
      }
    } finally {
      this.parents.pop();
    }
  }
}
