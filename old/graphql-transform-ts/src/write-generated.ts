import { promisify } from 'util';
import { writeFile as writeFileCb } from 'fs';
import { GqlFile } from './gql-file';
import { fileLink } from './file-link';

const writeFile = promisify(writeFileCb);

export async function writeTsFile(gqlFile: GqlFile): Promise<string> {
  let source = gqlFile.getTsCode();
  const fileName = `${gqlFile.name}.ts`;

  console.log(`[graphql-ts] writing ${fileLink(gqlFile.getModuleName() + '.ts', fileName)}`);

  await writeFile(fileName, source, { encoding: 'utf8' });

  return fileName;
}

export async function writeJsFile(gqlFile: GqlFile): Promise<string> {
  const source = gqlFile.getJsCode();
  const fileName = `${gqlFile.name}.js`;

  console.log(`[graphql-ts] writing ${fileLink(gqlFile.getModuleName() + '.js', fileName)}`);

  await writeFile(fileName, source, { encoding: 'utf8' });

  return fileName;
}

export async function writeDTsFile(gqlFile: GqlFile): Promise<string | null> {
  const source = gqlFile.getTranspileOutput().declarationText;
  const fileName = `${gqlFile.name}.d.ts`;
  if (!source) {
    console.log(`[graphql-ts] SKIPED ${gqlFile.getModuleName()}.d.ts`);
    return null;
  }

  console.log(`[graphql-ts] writing ${fileLink(gqlFile.getModuleName() + '.d.ts', fileName)}`);

  await writeFile(fileName, source, { encoding: 'utf8' });

  return fileName;
}
