import 'source-map-support/register';
import { print } from 'graphql/language/printer';
import { schema, documentAst } from './schema.graphql';

console.log(print(documentAst));

export default schema;
