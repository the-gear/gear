// https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#221-reserved-words

/**
 * The following keywords are reserved and cannot be used as an Identifier
 * Keywords can be used as property name
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
 */
const forbiddenTypeNames = ['any', 'boolean', 'number', 'string', 'symbol'];

/**
 * The following keywords have special meaning in certain contexts, but are valid identifiers:
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

export const allKeywordsSet = new Set([
  ...keywords,
  ...keywordsStrictMode,
  ...forbiddenTypeNames,
  ...otherKeywords,
]);

export const forbiddenIdentifierNameSet = new Set([...keywords, ...keywordsStrictMode]);

export const forbiddenTypeNameSet = new Set([
  ...keywords,
  ...keywordsStrictMode,
  ...forbiddenTypeNames,
]);

export const forbiddenPropertyNameSet = new Set();

// https://tc39.github.io/ecma262/#prod-IdentifierName
// https://github.com/tc39/proposal-regexp-unicode-property-escapes
const reIdentifier = /^[$_\p{ID_Start}][$\p{ID_Continue}]*$/u;

/**
 * test if name is perfectly safe identifier
 */
export function isSafeName(name: string): boolean {
  if (allKeywordsSet.has(name)) return false;
  return reIdentifier.test(name);
}

export function suggestSafeName(name: string): string {
  let safeName = name.replace(/[\P{ID_Continue}]/gu, '_');
  if (isSafeName(safeName)) return safeName;
  safeName = '$' + safeName;
  if (isSafeName(safeName)) return safeName;
  return '$$$';
}

/**
 * test if name can be used as identifier
 */
export function isValidIdentifierName(name: string): boolean {
  if (forbiddenIdentifierNameSet.has(name)) return false;
  return reIdentifier.test(name);
}

/**
 * test if name can be used as custom type identifier
 */
export function isValidTypeName(name: string): boolean {
  if (forbiddenTypeNameSet.has(name)) return false;
  return reIdentifier.test(name);
}

/**
 * test if name can be used as property name
 */
export function isValidPropertyName(name: string): boolean {
  if (forbiddenPropertyNameSet.has(name)) return false;
  return reIdentifier.test(name);
}

/**
 * return valid property name
 */
export function getPropertyName(name: string | number): string {
  return typeof name === 'string' && isValidPropertyName(name) ? name : JSON.stringify(name);
}

/**
 * return accessor to object property, including leading dot or brackets
 */
export function getPropertyAccess(name: string | number): string {
  return typeof name === 'string' && isValidPropertyName(name)
    ? `.${name}`
    : `[${JSON.stringify(name)}]`;
}

export function isPrimitiveValue(
  data: unknown,
): data is number | boolean | bigint | undefined | null {
  switch (typeof data) {
    case 'number':
    case 'boolean':
    case 'bigint':
    case 'undefined': {
      return true;
    }
    case 'object': {
      return data === null;
    }

    // case 'string':
    // case 'symbol':
    // case 'function':
    default: {
      return false;
    }
  }
}

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
