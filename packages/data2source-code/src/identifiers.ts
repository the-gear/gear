import { createComparator } from './utils';

const strLenComparator = createComparator<string>((x) => x.length, (x) => x);

type NameCandidate = {
  ambiguous: number;
  count: number;
  name: string;
};

const candidatesComparator = createComparator<NameCandidate>(
  (x) => x.ambiguous,
  (_, y) => y.count,
  (x) => x.name.length,
  (x) => x.name,
);

export class Ref<T> {
  /** @internal */
  _name: string | null = null;

  /** @internal */
  _exportNames: string[] = [];

  /** @internal */
  _names: string[] = [];

  /** @internal */
  _suggestedNames = new Set<string>();

  /** @internal */
  constructor(private owner: Identifiers<T>, public value: T) {}

  setName(name: string, isExport: boolean = false): this {
    if (isExport) {
      this._exportNames.push(name);
    } else {
      this._names.push(name);
    }
    this.owner._addNameFor(this.value, name, isExport);
    return this;
  }

  suggestNames(names: string[]): this {
    names.forEach((name) => this._suggestedNames.add(name));
    this.owner._addSuggestedNamesFor(this.value, names);
    return this;
  }

  hasName(): boolean {
    return !!this._name;
  }

  getName(): string {
    if (this._name) return this._name;
    let name = this._exportNames.sort(strLenComparator)[0];
    if (!name) name = this._names.sort(strLenComparator)[0];
    if (!name) {
      name = this.owner._resolveSuggestedNameFor(this);
    }
    this._name = name;
    return name;
  }
}

export class Identifiers<T> {
  private valueToIdent = new Map<T, Ref<T>>();
  private nameToIdent = new Map<string, Ref<T>>();
  private suggestedNameCount = new Map<string, Map<T, number>>();
  private exportedNames = new Set<string>();

  getFor(value: T): Ref<T> {
    let ident = this.valueToIdent.get(value);
    if (ident) return ident;
    ident = new Ref(this, value);
    this.valueToIdent.set(value, ident);
    return ident;
  }

  /** @internal */
  _addNameFor(value: T, name: string, isExport: boolean): Ref<T> {
    const used = this.nameToIdent.get(name);
    if (used) {
      if (Object.is(used.value, value)) {
        if (isExport) this.exportedNames.add(name);

        return used;
      }

      throw new Error(`Identifier ${name} is already taken`);
    }
    const ident = this.getFor(value);
    this.nameToIdent.set(name, ident);
    if (isExport) this.exportedNames.add(name);

    return ident;
  }

  /** @internal */
  _addSuggestedNamesFor(value: T, names: string[]) {
    for (const name of names) {
      let suggestions = this.suggestedNameCount.get(name);
      if (!suggestions) {
        suggestions = new Map<T, number>();
        this.suggestedNameCount.set(name, suggestions);
      }
      suggestions.set(value, (suggestions.get(value) || 0) + 1);
    }
  }

  isUsedName(name: string): boolean {
    return this.nameToIdent.has(name);
  }

  isExportName(name: string): boolean {
    return this.exportedNames.has(name);
  }

  _resolveSuggestedNameFor(ref: Ref<T>): string {
    const candidates: NameCandidate[] = [];
    for (const name of ref._suggestedNames) {
      const counts = this.suggestedNameCount.get(name);
      if (!counts) {
        throw new Error(`Name was not suggested: ${name}`);
      }
      const count = counts.get(ref.value) || 0;
      candidates.push({
        name,
        ambiguous: (this.isUsedName(name) ? 1 : 0) + Math.abs(counts.size - 1),
        count,
      });
    }

    candidates.sort(candidatesComparator);
    // use only first
    const candidate = candidates[0];
    let tryNameBase = '$';
    if (candidate) {
      if (!candidate.ambiguous) {
        ref.setName(candidate.name);
        return candidate.name;
      } else {
        tryNameBase = candidate.name;
      }
    }
    let counter = 0;
    while (true) {
      let tryName = `${tryNameBase}$${(++counter).toString(36)}`;
      if (!this.isUsedName(tryName)) {
        ref.setName(tryName);
        return tryName;
      }
    }
  }
}
