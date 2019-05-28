import { isWithKeys } from './utils';
import { PrimitiveSerializer } from './data-converter';

function forEachChindren(parent: unknown, cb: (key: PropertyKey, val: unknown) => void): void {
  if (isWithKeys(parent)) {
    for (const [key, val] of Object.entries(parent)) {
      cb(key, val);
    }
  }
}

class Ref {
  seen: number = 1;
  name: string | null = null;
  paths: string[][] = [];

  setName(name: string): this {
    this.name = name;
    return this;
  }

  ref(): this {
    this.seen++;
    return this;
  }

  suggestName(suggestedName: string): this {
    console.log(`suggestedName: ${suggestedName}`);
    return this;
  }

  circular(): this {
    console.log(`Circular dependency detected`);
    return this;
  }
}

export class DataCodeBlock {
  statements: string[] = [];
  private refs = new Map<unknown, Ref>();
  serializer = new PrimitiveSerializer();

  addConst(name: string, value: unknown): Ref {
    return this.addRef(value).setName(name);
  }

  protected addRef(value: unknown, ...parentRefs: Ref[]): Ref {
    const existingRef = this.refs.get(value);
    if (existingRef) {
      if (parentRefs.includes(existingRef)) {
        return existingRef.circular();
      }

      return existingRef.ref();
    } else {
      const ref = new Ref();
      this.refs.set(value, ref);
      forEachChindren(value, (key, val) => {
        this.addRef(val, ref, ...parentRefs).suggestName(key.toString());
      });
      return ref;
    }
  }
}
