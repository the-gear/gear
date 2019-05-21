import { Source, isSource } from './source';
import { isPrimitiveValue, isWithKeys, getPropertyName, isSafeName } from './utils';

enum RefStage {
  WILL_WRITE,
  WILL_WRITE_DEP,
  WRITTING,
  WRITTEN,
}

class Ref {
  seen: number = 1;
  parents = new Set<Ref>();
  suggestedNames = new Map<string, number>();
  isRecursive: boolean = false;
  identifier: string | null = null;
  isExport: boolean = false;
  stage: RefStage = RefStage.WILL_WRITE;

  constructor(public data: unknown) {}

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

  shouldWriteDep(): boolean {
    return this.parents.size > 1;
  }
}

export class SourceResolver {
  private source: string[] = [];
  private sourceDefs: string[] = [];
  private refs = new Map<unknown, Ref>();
  private suggestedRefNames = new Map<string, Set<Ref>>();
  private identifiers = new Set<string>();
  private resolvedSources = new Set<Source>();

  resolve(source: Source): this {
    if (source.resolve && !this.resolvedSources.has(source)) {
      this.resolvedSources.add(source);
      source.resolve(this);
    }
    return this;
  }

  write(anything: unknown): this {
    this.writeRefDeps();

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
    if (ref) {
      ref.seen++;
      if (seen.has(data)) {
        ref.isRecursive = true;
        return;
      }
    }
    if (!ref) {
      if (isPrimitiveValue(data)) return;
      ref = new Ref(data);
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

  getFreeIdentifier(prefix: string = '$'): string {
    let i: number = 0;
    let id: string;
    do {
      id = `${prefix}$${(++i).toString(36)}`;
    } while (!this.tryIdentifier(id));
    return id;
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

    return this.getFreeIdentifier('$' + typeof ref.data);
  }

  private captureWrite(cb: () => void): string {
    const backup = this.source;
    this.source = [];
    cb();
    const result = this.source.join('');
    this.source = backup;
    return result;
  }

  private writeRefDeps(refs = this.refs.values()) {
    for (const ref of refs) {
      if (ref && ref.shouldWriteDep() && !ref.identifier) {
        this.writeRefDep(ref);
      }
    }
  }

  private writeRefDep(ref: Ref) {
    if (ref.stage !== RefStage.WILL_WRITE) return;
    const id = this.getIdentifierFor(ref);
    this.sourceDefs.push(
      this.captureWrite(() => {
        this.writeCode(`${ref.isExport ? 'export ' : ''}const ${id} = `);
        ref.stage = RefStage.WILL_WRITE_DEP;
        this.writeValue(ref.data);
        this.writeCode(';\n');
      }),
    );
  }

  writeObject(obj: {}): this {
    const ref = this.refs.get(obj);
    if (!ref) {
      throw new Error('[writeObject] Ref not found');
    }

    if (ref.stage === RefStage.WILL_WRITE && ref.shouldWriteDep()) {
      this.writeRefDep(ref);
    }

    if (ref.stage === RefStage.WRITTEN) {
      if (!ref.identifier) {
        throw new Error('Object is written but have no identifier: ' + JSON.stringify(obj));
      }
      this.writeCode(ref.identifier);
      return this;
    }

    if (ref.stage === RefStage.WRITTING) {
      throw new Error('Unhandled recursion');
    }

    if (ref.stage === RefStage.WILL_WRITE || ref.stage === RefStage.WILL_WRITE_DEP) {
      ref.stage = RefStage.WRITTING;
      this.writeCode('({');
      let sep = '';
      for (const [key, value] of Object.entries(obj)) {
        this.writeCode(sep);
        const propName = getPropertyName(key);
        this.writeCode(propName);
        const valueCode = this.captureWrite(() => {
          this.writeValue(value);
        });
        if (valueCode !== propName || !isSafeName(propName)) {
          this.writeCode(': ');
          this.writeCode(valueCode);
        }
        sep = ', ';
      }
      this.writeCode('})');
      ref.stage = RefStage.WRITTEN;
      return this;
    }

    throw new Error(`[writeObject] Unhandled case '${ref.identifier}' ${RefStage[ref.stage]}`);
  }

  writeArray(array: unknown[]): this {
    const ref = this.refs.get(array);
    if (!ref) {
      throw new Error('[writeArray] Ref not found');
    }

    if (ref.stage === RefStage.WILL_WRITE && ref.shouldWriteDep()) {
      this.writeRefDep(ref);
    }

    if (ref.stage === RefStage.WRITTEN) {
      if (!ref.identifier) {
        throw new Error('Array is written but have no identifier');
      }
      this.writeCode(ref.identifier);
      return this;
    }

    if (ref.stage === RefStage.WRITTING) {
      throw new Error('Unhandled recursion');
    }

    if (ref.stage === RefStage.WILL_WRITE || ref.stage === RefStage.WILL_WRITE_DEP) {
      ref.stage = RefStage.WRITTING;
      this.writeCode('[');
      let sep = '';
      for (let i = 0; i < array.length; i++) {
        const value = array[i];
        this.writeCode(sep);
        this.writeValue(value);
        sep = ', ';
      }
      this.writeCode(']');
      ref.stage = RefStage.WRITTEN;
      return this;
    }

    throw new Error(`[writeObject] Unhandled case '${ref.identifier}' ${RefStage[ref.stage]}`);
  }

  writeFunction(fn: Function): this {
    // TODO
    return this.writeCode(fn.toString());
  }

  writeValue(val: unknown): this {
    switch (typeof val) {
      case 'string':
        return this.writeString(val);
      case 'number':
        return this.writeNumber(val);
      case 'boolean':
        return this.writeBoolean(val);
      case 'bigint':
        return this.writeBigInt(val);
      case 'undefined':
        return this.writeUndefined();
      case 'object': {
        if (val === null) return this.writeNull();
        if (Array.isArray(val)) return this.writeArray(val);
        return this.writeObject(val);
      }
      case 'symbol':
        return this.writeSymbol(val);
      case 'function':
        return this.writeFunction(val);
    }
    throw new Error(`[writeValue]: does not know how to write`);
  }

  getTsCode(): string {
    const result: string[] = [];
    if (this.sourceDefs.length) {
      result.push('// #region data definitions');
      result.push(this.sourceDefs.join('\n').trim());
      result.push('// #endregion data definitions\n');
    }
    result.push(this.source.join(''));
    return result.join('\n');
  }

  writeCode(code: string): this {
    this.source.push(code);
    return this;
  }

  writeBigInt(bigint: bigint): this {
    return this.writeCode(`BigInt('${bigint.toString()}')`);
  }

  writeBoolean(bool: boolean): this {
    return this.writeCode(bool ? 'true' : 'false');
  }

  writeNumber(n: number): this {
    if (Number.isNaN(n)) return this.writeCode('Number.NaN');
    if (n === Number.POSITIVE_INFINITY) return this.writeCode('Number.POSITIVE_INFINITY');
    if (n === Number.NEGATIVE_INFINITY) return this.writeCode('Number.NEGATIVE_INFINITY');
    return this.writeCode(n.toString());
  }

  writeString(str: string): this {
    return this.writeCode(JSON.stringify(str));
  }

  writeSymbol(_sym: symbol): this {
    // Well, I can register symbols on module and emit reference here, but...
    // return this.writeCode(`undefined /* ${sym.toString().replace(/\*\//g, '* /')} */`);
    throw new Error(`TODO: Symbol`);
  }

  writeUndefined() {
    return this.writeCode('undefined');
  }

  writeNull(): this {
    return this.writeCode('null');
  }
}
