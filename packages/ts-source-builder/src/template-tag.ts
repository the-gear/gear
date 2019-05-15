import { RawSource } from './raw-source';
import { SourceCollection } from './source-collection';
import { TsSource, isTsSource } from './source-atom';
import { Identifier } from './identifier';
import { ImportedIdentifier } from './identifier-import';

function getDedentStr(str: string): string | null {
  const match = str.match(/(?:\r\n|\r|\n)(\s*)$/);
  return (match && match[1]) || '';
}

function dedent(str: string, dedentStr: string | null): string {
  if (!dedentStr) return str;
  return str
    .split(/\r\n|\r|\n/)
    .map((line) => (line.startsWith(dedentStr) ? line.slice(dedentStr.length) : line))
    .join('\n');
}

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

  let lastLiteral = literals[placeholdersLength];
  const dedentStr = getDedentStr(lastLiteral);
  lastLiteral = dedent(lastLiteral, dedentStr);

  const fragments: TsSource[] = [];
  for (let i = 0; i < placeholdersLength; i++) {
    const literal = dedent(literals[i], dedentStr);
    fragments.push(new RawSource(literal));
    const source = placeholders[i];
    if (isTsSource(source)) {
      fragments.push(source);
    } else if (source === null) {
      fragments.push(new RawSource('null'));
    } else {
      const typeofSource = typeof source;
      switch (typeofSource) {
        case 'string':
        case 'number':
        case 'boolean': {
          fragments.push(new RawSource(JSON.stringify(source)));
          break;
        }
        default: {
          throw new Error(
            `[ts-source-builder] Invalid value of type ${typeofSource}, placeholder ${i +
              1}: ${JSON.stringify(source)}, after code block ${literal}`,
          );
        }
      }
    }
  }

  // placeholdersLength is equal to literalsLength - 1
  fragments.push(new RawSource(lastLiteral));

  return new SourceCollection(fragments);
}

export function value(val: any): RawSource {
  return new RawSource(JSON.stringify(val));
}

export function identifier(name?: string, noRename?: boolean): Identifier {
  return new Identifier({ name, noRename });
}

export function importId(
  from: string,
  name?: string | null,
  alias?: string,
  noRename?: boolean,
): ImportedIdentifier {
  return new ImportedIdentifier({
    from,
    name,
    alias,
    noRename,
  });
}

// expose for easy of use
ts.val = value;
ts.id = identifier;
ts.import = importId;
