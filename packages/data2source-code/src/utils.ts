/**
 * The following keywords are reserved and cannot be used as an Identifier.
 * Keywords can be used as property name
 *
 * https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#221-reserved-words
 */
const keywords = [
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'function',
  'if',
  'import',
  'in',
  'instanceof',
  'new',
  'null',
  'return',
  'super',
  'switch',
  'this',
  'throw',
  'true',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',
];

/**
 * The following keywords cannot be used as identifiers in strict mode code, but are otherwise not restricted:
 *
 * https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#221-reserved-words
 */
const keywordsStrictMode = [
  'implements',
  'interface',
  'let',
  'package',
  'private',
  'protected',
  'public',
  'static',
  'yield',
];

/**
 * The following keywords cannot be used as user defined type names, but are otherwise not restricted:
 *
 * https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#221-reserved-words
 */
const forbiddenTypeNames = ['any', 'boolean', 'number', 'string', 'symbol'];

/**
 * The following keywords have special meaning in certain contexts, but are valid identifiers:
 *
 * https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#221-reserved-words
 */
const otherKeywords = [
  'abstract',
  'as',
  'async',
  'await',
  'constructor',
  'declare',
  'from',
  'get',
  'is',
  'module',
  'namespace',
  'of',
  'require',
  'set',
  'type',
];

/**
 * Set of all **keywords**.
 *
 * https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#221-reserved-words
 */
export const allKeywordsSet = new Set([
  ...keywords,
  ...keywordsStrictMode,
  ...forbiddenTypeNames,
  ...otherKeywords,
]);

/**
 * Set of **keywords** that **cannot** be used as _Identifier_ name.
 *
 * https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#221-reserved-words
 */
export const forbiddenIdentifierNameSet = new Set([...keywords, ...keywordsStrictMode]);

/**
 * Set of **keywords** that **cannot** be used as _Type_ name.
 *
 * https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#221-reserved-words
 */
export const forbiddenTypeNameSet = new Set([
  ...keywords,
  ...keywordsStrictMode,
  ...forbiddenTypeNames,
]);

/**
 * _**Currently empty**_ set of **keywords** that **cannot** be used as _Property_ name.
 *
 * https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#221-reserved-words
 */
export const forbiddenPropertyNameSet = new Set();

// https://tc39.github.io/ecma262/#prod-IdentifierName
// https://github.com/tc39/proposal-regexp-unicode-property-escapes
const reIdentifier = /^[$_\p{ID_Start}][$\p{ID_Continue}]*$/u;

/**
 * Test if name is perfectly safe identifier
 */
export function isSafeName(name: string): boolean {
  if (allKeywordsSet.has(name)) return false;
  return reIdentifier.test(name);
}

/**
 * Create safe _Identifier_ name from arbitrary string
 *
 * @param name
 */
export function suggestSafeName(name: string): string {
  let safeName = name.replace(/[\P{ID_Continue}]/gu, '_');
  if (isSafeName(safeName)) return safeName;
  safeName = '$' + safeName;
  if (isSafeName(safeName)) return safeName;
  return '$$$';
}

/**
 * Test if name can be used as identifier
 */
export function isValidIdentifierName(name: string): boolean {
  if (forbiddenIdentifierNameSet.has(name)) return false;
  return reIdentifier.test(name);
}

/**
 * Test if name can be used as custom type identifier
 */
export function isValidTypeName(name: string): boolean {
  if (forbiddenTypeNameSet.has(name)) return false;
  return reIdentifier.test(name);
}

/**
 * Test if name can be used as property name
 */
export function isValidPropertyName(name: string): boolean {
  if (forbiddenPropertyNameSet.has(name)) return false;
  return reIdentifier.test(name);
}

/**
 * Get valid property name which can be used as **property key in object literal**.
 *
 * If name is invalid, return "quoted" value
 */
export function getPropertyName(name: PropertyKey): string {
  return typeof name === 'string' && isValidPropertyName(name) ? name : JSON.stringify(name);
}

/**
 * return accessor to object property, including leading dot or brackets
 */
export function getPropertyAccess(name: PropertyKey): string {
  return typeof name === 'string' && isValidPropertyName(name)
    ? `.${name}`
    : `[${JSON.stringify(name)}]`;
}

export function getPropertyPath(identifier: string, path: PropertyKey[]) {
  return identifier + path.map(getPropertyAccess).join('');
}

// export function isPrimitiveValue(
//   data: unknown,
// ): data is number | boolean | bigint | undefined | null {
//   switch (typeof data) {
//     case 'number':
//     case 'boolean':
//     case 'bigint':
//     case 'undefined': {
//       return true;
//     }
//     case 'object': {
//       return data === null;
//     }

//     // case 'string':
//     // case 'symbol':
//     // case 'function':
//     default: {
//       return false;
//     }
//   }
// }

export function isWithKeys(data: unknown): data is {} | Function {
  switch (typeof data) {
    case 'function': {
      return true;
    }
    case 'object': {
      return data !== null;
    }

    // case 'symbol':
    // case 'string':
    // case 'number':
    // case 'boolean':
    // case 'bigint':
    // case 'undefined':
    default: {
      return false;
    }
  }
}

type ComparatorSelector<T> = (value: T, other: T) => number | string | null;

export function createComparator<T>(...selectors: ComparatorSelector<T>[]) {
  return (a: T, b: T) => {
    for (const selector of selectors) {
      const valA = selector(a, b);
      if (valA === null) continue;
      const valB = selector(b, a);
      if (valB === null || valA == valB) continue;
      if (valA > valB) return 1;
      if (valA < valB) return -1;
    }
    return 0;
  };
}
