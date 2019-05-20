import { TsSource, isTsSource } from './ts-source';
import { isPrimitiveValue, isWithKeys } from './utils';

class Ref {
  parent: Ref | null;
  count = 0;
  isRecursive: boolean = false;
  suggestedNames = new Map<string, number>();

  constructor(parent: Ref | null) {
    this.parent = parent;
  }

  inc(suggestedNames?: string[]) {
    this.count++;
    if (suggestedNames) {
      suggestedNames.forEach((name) => this.suggestName(name));
    }
  }

  suggestName(name: string) {
    this.suggestedNames.set(name, (this.suggestedNames.get(name) || 0) + 1);
  }
}

export class SourceWriter {
  private source: string[] = [];
  private refs = new Map<unknown, Ref>();

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
      ref = new Ref(parent);
      this.refs.set(data, ref);
    }
    seen.add(data);
    ref.inc(suggestedNames);

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
      `/* c:${ref.count} [${[...ref.suggestedNames.entries()]
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ')}] */`,
    );
    return this;
  }

  private writeRefs(source: string[] = this.source) {
    for (const [data, ref] of this.refs.entries()) {
      if (ref.count > 0 || ref.isRecursive) {
        this.writeRef(data, source, ref);
      }
    }
  }
}
