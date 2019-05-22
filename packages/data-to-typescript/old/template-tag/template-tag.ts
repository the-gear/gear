import { isSource, RawSource, SourceFragments, Source } from './source';
import { IdentifierOptions, Identifier } from './identifier';
import { value } from './value';

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
  ...placeholders: Array<Source | null>
): SourceFragments {
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

  const fragments: Source[] = [];
  for (let i = 0; i < placeholdersLength; i++) {
    const literal = dedent(literals[i], dedentStr);
    fragments.push(new RawSource(literal));
    const source = placeholders[i];
    if (isSource(source)) {
      fragments.push(source);
    } else if (source === null || source === undefined) {
      // ignore, this allow conditionals
    } else {
      throw new Error(
        `[ts-source-writer] Invalid (unescaped) value, placeholder ${i + 1}: ${JSON.stringify(
          source,
        )}, after code block ${literal}`,
      );
    }
  }

  // placeholdersLength is equal to literalsLength - 1
  fragments.push(new RawSource(lastLiteral));

  return new SourceFragments(fragments);
}

// create two objects:
// - one as dependency with definition
// - second as reference.
// when serializing, if module count only one reference, include it raw.
// when multiple references are encoutered, it will emit `const` declaration

export function identifier(options?: IdentifierOptions): Identifier {
  return new Identifier(options);
}

// export function importId(
//   from: string,
//   name?: string | null,
//   alias?: string | null,
//   noRename?: boolean,
// ): ImportedIdentifier {
//   return new ImportedIdentifier({
//     from,
//     name,
//     alias,
//     noRename,
//   });
// }

/**
 * Emit `const` _name_ `=` _value_ `;`
 *
 * reserve _name_ as identifier
 */
export function constVal(name: string, value: unknown): SourceFragments {
  const id = ts.id(name);
  return ts`const ${id} = ${ts.value(value)};`;
}

/**
 * Emit `export const` _name_ `=` _value_ `;`
 * reserve _name_ as identifier
 */
export function exportVal(name: string, value: unknown): SourceFragments {
  const id = ts.id({ name });
  return ts`export const ${id} = ${ts.value(value)};`;
}

// expose for easy of use
ts.value = value;
ts.id = identifier;
// ts.import = importId;
ts.export = exportVal;
ts.const = constVal;
