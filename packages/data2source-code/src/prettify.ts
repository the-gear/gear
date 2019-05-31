import { resolveConfig, format, Options } from 'prettier';

type PrettifyOptions = Options;

export function prettify(
  source: string,
  filepath: string = process.cwd(),
  options?: PrettifyOptions,
) {
  const prettierConfig = resolveConfig.sync(filepath, {
    editorconfig: true,
    useCache: true,
  });

  return format(source, {
    ...prettierConfig,
    parser: 'typescript',
    ...options,
    filepath,
  });
}
