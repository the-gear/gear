import { AbstractDataVisitor } from './abstract-data-visitor';
import { createComparator } from './utils';

type SeenEntry = [unknown, object[]];

const dependencyComparator = createComparator<SeenEntry>(
  (a, b) => b[1].indexOf(a[0] as object),
  (a) => a[1].length,
);

/**
 * Looking for duplicate object references in deep data structure,
 * Returning ordered duplicate list
 */
export class RefVisitor extends AbstractDataVisitor {
  public collectStrings: boolean = false;

  private seen1 = new Set<unknown>();
  private seen2 = new Map<unknown, object[]>();

  public add(value: unknown) {
    this.visit(value);
    this.ref(value) && this.ref(value);
  }

  private ref(value: unknown): boolean {
    if (this.seen1.has(value)) {
      this.seen2.set(value, [...this.parents]);
      return false;
    } else {
      this.seen1.add(value);
      return true;
    }
  }

  protected ['string'](value: string): void {
    if (this.collectStrings) this.ref(value);
  }
  protected ['number'](_value: number): void {}
  protected ['bigint'](_value: bigint): void {}
  protected ['boolean'](_value: boolean): void {}
  protected ['symbol'](value: symbol): void {
    this.ref(value);
  }
  protected ['undefined'](_value: undefined): void {}
  protected ['object'](value: object): void {
    if (value === null) return this.visitNull();
    if (this.ref(value)) {
      this.visitObject(value);
    }
  }
  protected ['function'](value: Function): void {
    this.ref(value);
  }

  protected visitRecursiveProperty(
    value: unknown,
    _key: PropertyKey,
    _parent: object,
    _isArray: boolean,
  ): void {
    this.ref(value);
  }

  getDuplicates(): unknown[] {
    const dups: SeenEntry[] = [...this.seen2.entries()].reverse();
    dups.sort(dependencyComparator);
    return dups.map((entry) => entry[0]);
  }
}
