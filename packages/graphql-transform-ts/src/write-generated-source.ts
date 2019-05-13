import { promisify } from 'util';
import { writeFile as writeFileCb } from 'fs';
import { GqlFile } from './gql-file';

const writeFile = promisify(writeFileCb);

export async function writeTsFile(gqlFile: GqlFile): Promise<string> {
  let source = gqlFile.getTsCode();
  const fileName = gqlFile.genFileName;

  console.log('[graphql-ts] SAVE', fileName);

  await writeFile(fileName, source, { encoding: 'utf8' });

  return fileName;
}
