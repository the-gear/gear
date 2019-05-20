import { Source, isSource } from './source';
import { isPrimitiveValue, isWithKeys } from './utils';

enum RefStage {
  WillWrite,
  Writing,
  Written,
}

class Ref {
  parents = new Set<Ref>();
  suggestedNames = new Map<string, number>();
  isRecursive: boolean = false;
  identifier: string | null = null;
  isExport: boolean = false;
  stage: RefStage = RefStage.WillWrite;

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

export class SourceResolver {
  private defSource: string[] = [];
  private source: string[] = [];
  private refs = new Map<unknown, Ref>();
  private suggestedRefNames = new Map<string, Set<Ref>>();
  private identifiers = new Set<string>();

  resolve(source: Source): this {
    source.resolve && source.resolve(this);
    return this;
  }

  write(strOrSource: string | Source): this {
    this.writeDefs();
    if (typeof strOrSource === 'string') {
      this.source.push(strOrSource);
    } else if (isSource(strOrSource) && strOrSource.write) {
      strOrSource.write(this);
    } else {
      throw new Error('Invalid value');
    }
    return this;
  }

  addRef(data: unknown, suggestedNames?: string[]): this {
    this.addRefRecursive(data, suggestedNames || [], null, new Set());
    return this;
  }

  writeCode(code: string): this {
    this.source.push(code);
    return this;
  }

  getTsCode() {
    const result = [];
    if (this.defSource.length) {
      result.push('/* #region hoisted definitions */');
      result.push(this.defSource.join(''));
      result.push('/* #endregion hoisted definitions */');
    }
    result.push(this.source.join(''));
    return result.join('\n');
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

  writeRef(
    data: unknown,
    source: string[] = this.source,
    ref: Ref | undefined = this.refs.get(data),
  ): this {
    if (!ref) {
      source.push(`/* ??? ${typeof data} */`);
      return this;
    }
    if (ref.identifier) {
      source.push(ref.identifier);
      return this;
    }
    if (ref.stage)
      source.push(
        `/* ${ref.refCount()}× [${[...ref.suggestedNames.entries()]
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ')}] */`,
      );
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

  writeObject(obj: {}): this {
    return this.writeCode(JSON.stringify(obj));
  }

  writeArray(array: {}): this {
    return this.writeCode(JSON.stringify(array));
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
        if (Array.isArray(val)) this.writeArray(val);
        return this.writeObject(val);
      }
      case 'symbol':
        return this.writeSymbol(val);
      case 'function':
        return this.writeFunction(val);
    }
    throw new Error(`[writeValue]: does not know how to write`);
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

  writeDef(
    data: unknown,
    defSource: string[] = this.defSource,
    ref: Ref | undefined = this.refs.get(data),
  ): this {
    if (!ref) {
      throw new Error(`Reference not acquired`);
    }

    const id = this.getIdentifierFor(ref);

    this.writeValue;

    defSource.push(
      `\n// ${ref.refCount()}× [${[...ref.suggestedNames.entries()]
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ')}]`,
    );
    defSource.push(`\n${ref.isExport ? 'export ' : ''}const ${id} = null; // TODO`);

    return this;
  }

  private writeDefs(source: string[] = this.defSource) {
    for (const [data, ref] of this.refs.entries()) {
      if (ref.refCount() > 0 || ref.isRecursive) {
        this.writeDef(data, source, ref);
      }
    }
  }
}
