import { resolve, dirname } from 'path';
import { Plugin, TransformSourceDescription, ResolveIdResult } from 'rollup';
import { createFilter } from 'rollup-pluginutils';
import { GqlFile, writeTsFile } from '@the-gear/graphql-transform-ts';

import reexportTemplate from './template-reexport';
import { RollupGraphqlTsConfig, RollupGraphqlTsOptions } from './types';
import { fileMap } from './file-map';

export * from './types';

export default function graphqlTs(options?: RollupGraphqlTsOptions): Plugin {
  const config: RollupGraphqlTsConfig = {
    prettify: true,
    ...options,
    parseOptions: {
      experimentalFragmentVariables: true,
      experimentalVariableDefinitionDirectives: true,
      ...((options && options.parseOptions) || {}),
    },
  };

  const filter = createFilter(config.include, config.exclude);
  const filterExt = /\.(graphql|gql)$/i;
  const filterExtTs = /\.(graphql|gql)\.ts$/i;

  return {
    name: 'graphql-ts',

    buildStart() {
      console.log(`[graphql-ts] start`);
    },

    resolveId(id: string, parent: string): ResolveIdResult {
      if (!filter(id)) return;
      if (!filterExt.test(id)) return;
      // console.log(`[graphql-ts] rslv ${parent} -> ${id}`);
      const resolved = resolve(dirname(parent), id);
      // console.log(`[graphql-ts] rslv ${resolved}`);
      return resolved;
    },

    load(id) {
      if (!filter(id)) return null;
      if (!filterExtTs.test(id)) return null;
      console.log('[graphql-ts] load', id);
      const file = fileMap.get(id);
      return file ? file.getTsCode() : null;
    },

    // watchChange(id) {
    //   console.log('[graphql-ts] wtch', id);
    // },

    // writeBundle() {
    //   console.log('[graphql-ts] writebundle');
    // },

    async transform(src: string, id: string): Promise<TransformSourceDescription | void> {
      if (!filter(id)) return;
      if (!filterExt.test(id)) return;

      const gqlFile = new GqlFile(src, id, config);
      const genFileName = await writeTsFile(gqlFile);

      return {
        code: reexportTemplate(genFileName, true),
        map: { mappings: '' },
      };
    },
  };
}
