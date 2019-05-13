// #sha384: bRZnrVnmqswIC3umx2V2xhQJzwCFtTNy07B8r2cOYidhS2MZtvV+LNuZDw8HVUWx
// #body: @the-gear/sample-rollup-server-simple/src/schema.graphql

/******************************==~~^^^^^^ W A R N I N G !! ^^^^^^~~==******************************/
/*                                   THIS IS AUTOGENERATED FILE                                   */
/*                                                                                                */
/* Do not edit this file. If you need to do any changes, edit GraphQL source instead:             */
/* @the-gear/sample-rollup-server-simple/src/schema.graphql                                       */
/*                                                                                                */
/*********************************=______________________________=*********************************/

import { parse } from 'graphql/language/parser';
import { Source } from 'graphql/language/source';
import { GraphQLObjectTypeConfig } from 'graphql/type';
import { buildASTSchema } from 'graphql/utilities/buildASTSchema';
export const sha384Hash = 'bRZnrVnmqswIC3umx2V2xhQJzwCFtTNy07B8r2cOYidhS2MZtvV+LNuZDw8HVUWx';
// GENERATED FILE. DO NOT EDIT!
export const src = `"""
Root query type
"""
type Query {
  """
  Say hello!
  """
  hello: String!
}

schema {
  query: Query
}
`;
// GENERATED FILE. DO NOT EDIT!
export const source = /*@__PURE__*/ new Source(
  src,
  '@the-gear/sample-rollup-server-simple/src/schema.graphql',
);
// GENERATED FILE. DO NOT EDIT!
export const documentNode = /*@__PURE__*/ parse(source, {
  experimentalFragmentVariables: true,
  experimentalVariableDefinitionDirectives: true,
});
// GENERATED FILE. DO NOT EDIT!
export const documentAst: import('graphql').DocumentNode = {
  kind: 'Document',
  definitions: [
    {
      kind: 'ObjectTypeDefinition',
      description: { kind: 'StringValue', value: 'Root query type', block: true },
      name: { kind: 'Name', value: 'Query' },
      interfaces: [],
      directives: [],
      fields: [
        {
          kind: 'FieldDefinition',
          description: { kind: 'StringValue', value: 'Say hello!', block: true },
          name: { kind: 'Name', value: 'hello' },
          arguments: [],
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
          directives: [],
        },
      ],
    },
    {
      kind: 'SchemaDefinition',
      directives: [],
      operationTypes: [
        {
          kind: 'OperationTypeDefinition',
          operation: 'query',
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Query' } },
        },
      ],
    },
  ],
};
// GENERATED FILE. DO NOT EDIT!

/**
 * Type config for object Query
 *
 * Root query type
 */
export const QueryTypeConfig: GraphQLObjectTypeConfig = {
  name: 'Query',
  description: 'Root query type',
  // interfaces?: GraphQLInterfacesThunk | Array<GraphQLInterfaceType>;
};

export const schema = /*@__PURE__*/ buildASTSchema(documentAst);
export default schema;
