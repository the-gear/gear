import { Source, isSource } from './source';
import { isPrimitiveValue, isWithKeys } from './utils';
import { SourceWriter } from './source-writer';

// enum RefStage {
//   WillWrite,
//   Writing,
//   Written,
// }

class Ref {
  parents = new Set<Ref>();
  suggestedNames = new Map<string, number>();
  isRecursive: boolean = false;
  identifier: string | null = null;
  isExport: boolean = false;
  // stage: RefStage = RefStage.WillWrite;

  addParent(parent: Ref) {
    this.parents.add(parent);
    return this;
  }

  suggestNames(suggestedNames: string[]) {
    if (suggestedNames) {
      suggestedNames.forEach((name) => this.suggestName(name));
    }
  }

  suggestName(name: string) {
    this.suggestedNames.set(name, (this.suggestedNames.get(name) || 0) + 1);
  }

  refCount(): number {
    return this.parents.size;
  }
}

export class SourceResolver extends SourceWriter {
  private refs = new Map<unknown, Ref>();
  private suggestedRefNames = new Map<string, Set<Ref>>();
  private identifiers = new Set<string>();

  resolve(source: Source): this {
    source.resolve && source.resolve(this);
    return this;
  }

  write(anything: unknown): this {
    if (isSource(anything)) {
      anything.write && anything.write(this);
    } else {
      this.writeValue(anything);
    }
    return this;
  }

  addRef(data: unknown, suggestedNames?: string[]): this {
    this.addRefRecursive(data, suggestedNames || [], null, new Set());
    return this;
  }

  /**
   * Try reserve identifier. Return true if identifier can be used
   */
  tryIdentifier(name: string): boolean {
    if (this.identifiers.has(name)) return false;
    this.identifiers.add(name);
    return true;
  }

  reserveIdentifier(name: string): void {
    if (!this.tryIdentifier(name)) throw new Error(`Identifier ${name} is already taken`);
  }

  private suggestRefName(name: string, ref: Ref) {
    let refSet = this.suggestedRefNames.get(name);
    if (!refSet) {
      refSet = new Set();
      this.suggestedRefNames.set(name, refSet);
    }
    refSet.add(ref);
  }

  private addRefRecursive(
    data: unknown,
    suggestedNames: string[],
    parent: Ref | null,
    seen: Set<unknown>,
  ) {
    let ref = this.refs.get(data);
    if (ref && seen.has(data)) {
      ref.isRecursive = true;
      return;
    }
    if (!ref) {
      if (isPrimitiveValue(data)) return;
      ref = new Ref();
      this.refs.set(data, ref);
    }
    seen.add(data);
    if (parent) ref.addParent(parent);
    ref.suggestNames(suggestedNames);
    suggestedNames.forEach((name) => this.suggestRefName(name, ref as Ref));

    if (isWithKeys(data)) {
      for (const [key, value] of Object.entries(data)) {
        const safeKeyId = key;
        const newSuggestedNames = [
          safeKeyId,
          ...suggestedNames.map((name) => `${name}$${safeKeyId}`),
        ];
        this.addRefRecursive(value, newSuggestedNames, ref, seen);
      }
    }
    seen.delete(data);
  }

  getIdentifierFor(ref: Ref) {
    if (ref.identifier) {
      return ref.identifier;
    }
    const names = [...ref.suggestedNames.entries()];
    // sort by suggestion count
    names.sort((a, b) => b[1] - a[1]);
    let name: string;
    for (let i = 0; i < names.length; i++) {
      name = names[i][0];
      const refSet = this.suggestedRefNames.get(name);
      if (!refSet) {
        throw new Error(`RefSet not contain entry for '${name}'`);
      }
      if (refSet.size === 1 && refSet.has(ref)) {
        if (this.tryIdentifier(name)) {
          ref.identifier = name;
          return name;
        }
      }
    }

    throw new Error('TODO: [getIdentifierFor] Candidates');
  }
}
