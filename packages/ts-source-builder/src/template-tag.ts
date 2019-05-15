import { RawSource } from './raw-source';
import { SourceCollection } from './source-module';
import { TsSource, isTsSource } from './source-atom';
import { Identifier } from './identifier';

export function ts(
  literals: TemplateStringsArray,
  ...placeholders: Array<TsSource | string | number | boolean | null>
): SourceCollection {
  const placeholdersLength = placeholders.length;
  const literalsLength = literals.length;
  if (literalsLength - 1 !== placeholdersLength) {
    throw new Error(
      `Length mismatch: (${literalsLength}) literalsLength - 1 !== placeholdersLength (${placeholdersLength})`,
    );
  }

  const fragments: TsSource[] = [];
  for (let i = 0; i < placeholdersLength; i++) {
    const literal = literals[i];
    fragments.push(new RawSource(literal));
    const source = placeholders[i];
    if (isTsSource(source)) {
      fragments.push(source);
    } else if (source === null) {
      fragments.push(new RawSource('null'));
    } else {
      switch (typeof source) {
        case 'string':
        case 'number':
        case 'boolean': {
          fragments.push(new RawSource(JSON.stringify(source)));
          break;
        }
        default: {
          throw new Error(
            `[ts-source-builder] Invalid value ${JSON.stringify(source)}, ${i +
              1}. placeholder, after code block ${literal}`,
          );
        }
      }
    }
  }

  // placeholdersLength is equal to literalsLength - 1
  fragments.push(new RawSource(literals[placeholdersLength]));

  return new SourceCollection(fragments);
}

export function value(val: any): RawSource {
  return new RawSource(JSON.stringify(val));
}

export function identifier(name?: string, noRename?: boolean): Identifier {
  return new Identifier({ name, noRename });
}

// expose for easy of use
ts.val = value;
ts.id = identifier;
