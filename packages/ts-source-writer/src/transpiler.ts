import * as ts from 'typescript';

// **********************************************************
// * Extracted from TypeScript source v 3.4.5, BUT MODIFIED *
// **********************************************************

export interface TranspileOutput {
  diagnostics?: ts.Diagnostic[];
  outputText: string;
  sourceMapText?: string;
  declarationText: string;
}

/*
 * This function will compile source text from 'input' argument using specified compiler options.
 * If not options are provided - it will use a set of default compiler options.
 * Extra compiler options that will unconditionally be used by this function are:
 * - isolatedModules = true
 * - allowNonTsExtensions = true
 * - noLib = true
 * - noResolve = true
 */
export function transpileModule(
  input: string,
  transpileOptions: ts.TranspileOptions,
): TranspileOutput {
  const diagnostics: ts.Diagnostic[] = [];

  const options: ts.CompilerOptions =
    transpileOptions.compilerOptions || ts.getDefaultCompilerOptions();

  options.isolatedModules = true;

  // transpileModule does not write anything to disk so there is no need to verify that there are no conflicts between input and output paths.
  options.suppressOutputPathCheck = true;

  // Filename can be non-ts file.
  options.allowNonTsExtensions = true;

  // We are not returning a sourceFile for lib file when asked by the program,
  // so pass --noLib to avoid reporting a file not found error.
  options.noLib = true;

  // Clear out other settings that would not be used in transpiling this module
  options.lib = undefined;
  options.types = undefined;
  options.noEmit = undefined;
  options.noEmitOnError = undefined;
  options.paths = undefined;
  options.rootDirs = undefined;
  options.composite = undefined;
  options.declarationDir = undefined;
  options.out = undefined;
  options.outFile = undefined;

  // We are not doing a full typecheck, we are not resolving the whole context,
  // so pass --noResolve to avoid reporting missing file errors.
  options.noResolve = true;

  // EDIT START
  options.inlineSources = options.sourceMap;
  options.declaration = true;
  // EDIT END

  // if jsx is specified then treat file as .tsx
  const inputFileName = transpileOptions.fileName || (options.jsx ? 'module.tsx' : 'module.ts');
  const sourceFile = ts.createSourceFile(inputFileName, input, options.target!); // TODO: GH#18217
  if (transpileOptions.moduleName) {
    sourceFile.moduleName = transpileOptions.moduleName;
  }

  // Output
  let outputText: string | undefined;
  let sourceMapText: string | undefined;
  let declarationText: string | undefined;

  // Create a compilerHost object to allow the compiler to read and write files
  const compilerHost: ts.CompilerHost = {
    getSourceFile: (fileName) => (fileName === inputFileName ? sourceFile : undefined),
    writeFile: (name, text) => {
      if (fileExtensionIs(name, '.map')) {
        if (sourceMapText !== undefined) {
          throw new Error(`Unexpected multiple source map outputs, file: ${name}`);
        }
        sourceMapText = text;
      } else if (fileExtensionIs(name, '.d.ts')) {
        if (declarationText !== undefined) {
          throw new Error(`Unexpected multiple declarations outputs, file: ${name}`);
        }
        declarationText = text;
      } else {
        if (outputText !== undefined) {
          throw new Error(`Unexpected multiple outputs, file: ${name}`);
        }
        outputText = text;
      }
    },
    getDefaultLibFileName: () => 'lib.d.ts',
    useCaseSensitiveFileNames: () => false,
    getCanonicalFileName: (fileName) => fileName,
    getCurrentDirectory: () => '',
    getNewLine: () => '\n',
    fileExists: (fileName): boolean => fileName === inputFileName,
    readFile: () => '',
    directoryExists: () => true,
    getDirectories: () => [],
  };

  const program = ts.createProgram([inputFileName], options, compilerHost);

  if (transpileOptions.reportDiagnostics) {
    addRange(/*to*/ diagnostics, /*from*/ program.getSyntacticDiagnostics(sourceFile));
    addRange(/*to*/ diagnostics, /*from*/ program.getOptionsDiagnostics());
  }
  // Emit
  program.emit(
    /*targetSourceFile*/ undefined,
    /*writeFile*/ undefined,
    /*cancellationToken*/ undefined,
    /*emitOnlyDtsFiles*/ undefined,
    transpileOptions.transformers,
  );

  if (outputText === undefined) throw new Error('Output generation failed');
  if (declarationText === undefined) throw new Error('Declaration generation failed');

  return {
    diagnostics,
    outputText,
    sourceMapText,
    declarationText,
  };
}

// **********************************************************
// * Extracted from TypeScript source v 3.4.5, not modified *
// **********************************************************

function endsWith(str: string, suffix: string): boolean {
  const expectedPos = str.length - suffix.length;
  return expectedPos >= 0 && str.indexOf(suffix, expectedPos) === expectedPos;
}

function fileExtensionIs(path: string, extension: string): boolean {
  return path.length > extension.length && endsWith(path, extension);
}

/**
 * Gets the actual offset into an array for a relative offset. Negative offsets indicate a
 * position offset from the end of the array.
 */
function toOffset(array: ReadonlyArray<any>, offset: number) {
  return offset < 0 ? array.length + offset : offset;
}

/**
 * Appends a range of value to an array, returning the array.
 *
 * @param to The array to which `value` is to be appended. If `to` is `undefined`, a new array
 * is created if `value` was appended.
 * @param from The values to append to the array. If `from` is `undefined`, nothing is
 * appended. If an element of `from` is `undefined`, that element is not appended.
 * @param start The offset in `from` at which to start copying values.
 * @param end The offset in `from` at which to stop copying values (non-inclusive).
 */
function addRange<T>(
  to: T[],
  from: ReadonlyArray<T> | undefined,
  start?: number,
  end?: number,
): T[];
function addRange<T>(
  to: T[] | undefined,
  from: ReadonlyArray<T> | undefined,
  start?: number,
  end?: number,
): T[] | undefined;
function addRange<T>(
  to: T[] | undefined,
  from: ReadonlyArray<T> | undefined,
  start?: number,
  end?: number,
): T[] | undefined {
  if (from === undefined || from.length === 0) return to;
  if (to === undefined) return from.slice(start, end);
  start = start === undefined ? 0 : toOffset(from, start);
  end = end === undefined ? from.length : toOffset(from, end);
  for (let i = start; i < end && i < from.length; i++) {
    if (from[i] !== undefined) {
      to.push(from[i]);
    }
  }
  return to;
}
