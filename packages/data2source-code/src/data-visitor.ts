export interface TypeofVisitor {
  ['string'](value: string): void;
  ['number'](value: number): void;
  ['bigint'](value: bigint): void;
  ['boolean'](value: boolean): void;
  ['symbol'](value: symbol): void;
  ['undefined'](value: undefined): void;
  ['object'](value: object): void;
  ['function'](value: Function): void;
}

export abstract class DataVisitor {
  protected parentKeys: PropertyKey[] = [];
  protected parents: object[] = [];

  ['string'](_value: string): void {}
  ['number'](_value: number): void {}
  ['bigint'](_value: bigint): void {}
  ['boolean'](_value: boolean): void {}
  ['symbol'](_value: symbol): void {}
  ['undefined'](_value: undefined): void {}
  ['object'](value: object): void {
    if (value === null) return this.visitNull();
    if (Array.isArray(value)) return this.visitArray(value);
    return this.visitObject(value);
  }
  ['function'](_value: Function): void {}

  visit(value: unknown) {
    (this[typeof value] as this['visit'])(value);
  }
  visitNull(): void {}
  visitArray(value: unknown[]): void {
    this.visitArrayValues(value);
  }
  visitObject(value: object): void {
    this.visitObjectProperties(value, false);
  }
  visitPropertyKey(_key: PropertyKey): void {}
  visitProperty(value: unknown, _key: PropertyKey, _parent: object, _isArray: boolean): void {
    this.visit(value);
  }
  visitRecursiveProperty(
    _value: unknown,
    _key: PropertyKey,
    _parent: object,
    _isArray: boolean,
  ): void {
    throw new Error(`Circular value detected`);
  }
  visitArrayValues(parent: unknown[]): void {
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
  visitObjectProperties(parent: object, isArray: boolean): void {
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
