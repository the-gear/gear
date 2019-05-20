import { TsSource, isTsSource } from './ts-source';
import { isPrimitiveValue, isWithKeys } from './utils';

class Ref {
  parents = new Set<Ref>();
  suggestedNames = new Map<string, number>();
  isRecursive: boolean = false;

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

export class SourceWriter {
  private source: string[] = [];
  private refs = new Map<unknown, Ref>();
  private suggestedRefNames = new Map<string, Set<Ref>>();
  private identifiers = new Set<string>();

  resolve(source: TsSource): this {
    source.resolve && source.resolve(this);
    return this;
  }

  addRef(data: unknown, suggestedNames?: string[]): this {
    this.addRefRecursive(data, suggestedNames || [], null, new Set());
    return this;
  }

  write(strOrTsSource: string | TsSource): this {
    this.writeRefs(this.source);
    if (typeof strOrTsSource === 'string') {
      this.source.push(strOrTsSource);
    } else if (isTsSource(strOrTsSource) && strOrTsSource.write) {
      strOrTsSource.write(this);
    } else {
      throw new Error('Invalid value');
    }
    return this;
  }

  getTsCode() {
    return this.source.join('');
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
    suggestedNames.forEach((name) => this.suggestRefName(name, ref));

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

  writeRef(
    data: unknown,
    source: string[] = this.source,
    ref: Ref | undefined = this.refs.get(data),
  ): this {
    if (!ref) {
      source.push(`/* ??? ${typeof data} */`);
      return this;
    }
    source.push(
      `/* ${ref.refCount()}× [${[...ref.suggestedNames.entries()]
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ')}] */`,
    );
    return this;
  }

  private writeRefs(source: string[] = this.source) {
    for (const [data, ref] of this.refs.entries()) {
      if (ref.refCount() > 0 || ref.isRecursive) {
        this.writeRef(data, source, ref);
      }
    }
  }
}
