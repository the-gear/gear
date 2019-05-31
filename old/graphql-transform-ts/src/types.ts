import { ParseOptions } from 'graphql/language/parser';
import { Location } from 'graphql/language/source';

export interface GraphqlTsOptions {
  locationOffset?: Location;
  parseOptions?: ParseOptions;
  /**
   * Use prettier on output
   */
  prettify?: boolean;
  compilerOptions?: import('typescript').CompilerOptions;
}
