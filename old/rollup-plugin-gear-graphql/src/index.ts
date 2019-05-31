// import { resolve, dirname } from 'path';
import { Plugin, TransformSourceDescription } from 'rollup';
import { createFilter } from 'rollup-pluginutils';
import { ModuleKind } from 'typescript';
import {
  GraphqlTsOptions,
  GqlFile,
  writeJsFile,
  writeTsFile,
  writeDTsFile,
} from '@the-gear/graphql-transform-ts';

export interface RollupGraphqlTsOptions extends GraphqlTsOptions {
  include?: Array<string | RegExp> | string | RegExp | null;
  exclude?: Array<string | RegExp> | string | RegExp | null;

  /**
   * Write `….graphql.js` file alongside `….graphql` source
   * @default false
   */
  writeJs?: boolean;

  /**
   * Write `….graphql.ts` file alongside `….graphql` source
   * @default false
   */
  writeTs?: boolean;

  /**
   * Write `….graphql.d.ts` file alongside `….graphql` source
   * @default `!options.writeTs`
   */
  writeDTs?: boolean;
}

export default function graphqlTs(opts: RollupGraphqlTsOptions = {}): Plugin {
  const options: RollupGraphqlTsOptions = {
    prettify: true,
    writeDTs: !opts.writeTs,
    ...opts,
    parseOptions: {
      experimentalFragmentVariables: true,
      experimentalVariableDefinitionDirectives: true,
      ...((opts && opts.parseOptions) || {}),
    },
  };
  options.compilerOptions = {
    module: ModuleKind.ES2015,
    ...((opts && opts.compilerOptions) || {}),
    declaration: options.writeDTs,
  };

  const filter = createFilter(options.include, options.exclude);
  const filterExt = /\.(graphql|gql)s?$/i;

  return {
    name: 'graphql-ts',

    // buildStart() {
    //   console.log(`[graphql-ts] start`);
    // },

    // resolveId(id: string, parent: string): ResolveIdResult {
    //   if (!filter(id)) return;
    //   if (!filterExt.test(id)) return;
    //   // console.log(`[graphql-ts] rslv ${parent} -> ${id}`);
    //   const resolved = resolve(dirname(parent), id);
    //   // console.log(`[graphql-ts] rslv ${resolved}`);
    //   return resolved;
    // },

    // load(id) {
    //   if (!filter(id)) return null;
    //   if (!filterExtTs.test(id)) return null;
    //   console.log('[graphql-ts] load', id);
    //   const file = fileMap.get(id);
    //   return file ? file.getJsCode() : null;
    // },

    // watchChange(id) {
    //   console.log('[graphql-ts] wtch', id);
    // },

    // writeBundle() {
    //   console.log('[graphql-ts] writebundle');
    // },

    async transform(src: string, id: string): Promise<TransformSourceDescription | void> {
      if (!filter(id)) return;
      if (!filterExt.test(id)) return;

      const gqlFile = new GqlFile(src, id, options);
      const transpiled = gqlFile.getTranspileOutput();

      const { writeJs, writeTs, writeDTs } = options;

      const writes = [];

      if (writeTs) writes.push(writeTsFile(gqlFile));
      if (writeJs) writes.push(writeJsFile(gqlFile));
      if (writeDTs) writes.push(writeDTsFile(gqlFile));

      const { diagnostics } = transpiled;
      if (diagnostics && diagnostics.length) {
        for (const diag of diagnostics) {
          this.warn(`${diag.messageText}`);
        }
      }

      await Promise.all(writes);

      return {
        code: transpiled.outputText,
        map: { mappings: '' },
      };
    },
  };
}
