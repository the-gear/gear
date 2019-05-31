import { AbstractDataVisitor } from './abstract-data-visitor';
import { createComparator, isValidIdentifierName } from './utils';
import { Identifiers, Ref } from './identifiers';

type SeenEntry = [Ref, object[]];

// TODO: this does not work well in many situations.
const dependencyComparator = createComparator<SeenEntry>(
  (a, b) => (b[1].indexOf(a[0].value as object) >= 0 ? 1 : 0),
  (_, b) => b[0].count,
  (_, b) => b[1].length,
);

/**
 * Looking for object references in deep data structure,
 * Returning sorted list of refs
 */
export class RefVisitor extends AbstractDataVisitor {
  public collectStrings: boolean = false;

  constructor(public identifiers: Identifiers) {
    super();
  }

  private seen1 = new Set<unknown>();
  private seen2 = new Map<Ref, object[]>();

  public add(value: unknown) {
    this.visit(value);
    this.ref(value) && this.ref(value);
  }

  private ref(value: unknown): boolean {
    const ident = this.identifiers
      .getFor(value)
      .ref()
      .suggestNames([...this.parentKeys].reverse().filter(isValidIdentifierName));
    if (this.seen1.has(value)) {
      this.seen2.set(ident, [...this.parents]);
      return false;
    } else {
      this.seen1.add(value);
      return true;
    }
  }

  // protected ['number'](_value: number): void {}
  // protected ['bigint'](_value: bigint): void {}
  // protected ['boolean'](_value: boolean): void {}
  // protected ['undefined'](_value: undefined): void {}

  protected ['string'](value: string): void {
    if (this.collectStrings) this.ref(value);
  }
  protected ['symbol'](value: symbol): void {
    this.ref(value);
  }
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

  getIdentifiers(): Ref[] {
    const deps: SeenEntry[] = [...this.seen2.entries()];
    deps.sort(dependencyComparator);
    return deps.map((entry) => entry[0]);
  }
}
