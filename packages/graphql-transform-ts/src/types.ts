import { ParseOptions } from 'graphql/language/parser';
import { Location } from 'graphql/language/source';

export interface GraphqlTsConfig {
  locationOffset?: Location;
  parseOptions: ParseOptions;
  /**
   * Use prettier on output
   */
  prettify: boolean;
}

export type GraphqlTsOptions = Partial<GraphqlTsConfig>;
