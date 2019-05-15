import { TsFileBuilder } from '../ts-file-builder';
import { GqlFile } from '../gql-file';

/**
 * Transformer stages:
 * 1. preprocess — read hash directives (#import… etc)
 * 2. parse — read source, create AST
 * 3. transformAST — get
 * 4. getSchema — load schema for queries, or create schema
 * 5. process
 * 6. ready for getTsCode, getJsCode, getTsDeclarations
 */

export default class Transformer {
  protected gqlFile: GqlFile;
  protected tsFile: TsFileBuilder;

  constructor(gqlFile: GqlFile) {
    this.gqlFile = gqlFile;
    this.tsFile = new TsFileBuilder(gqlFile.getModuleName());
  }
}
