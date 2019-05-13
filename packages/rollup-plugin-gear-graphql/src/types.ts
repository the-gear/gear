import { GraphqlTsConfig } from '@the-gear/graphql-transform-ts';

export interface RollupGraphqlTsConfig extends GraphqlTsConfig {
  include?: Array<string | RegExp> | string | RegExp | null;
  exclude?: Array<string | RegExp> | string | RegExp | null;
}

export type RollupGraphqlTsOptions = Partial<RollupGraphqlTsConfig>;
