// #sha384: xuioPOEDyVAS0btIobF6Mf5AxknFdxFnAM9mjl9h9mKQpoqlmcVn6qHmHDl855ve
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
import { GraphQLObjectType } from 'graphql';
import { buildASTSchema } from 'graphql/utilities/buildASTSchema';
export var sha384Hash = 'xuioPOEDyVAS0btIobF6Mf5AxknFdxFnAM9mjl9h9mKQpoqlmcVn6qHmHDl855ve';
/*********************************** THIS IS AUTOGENERATED FILE ***********************************/
export var src = "\"\"\"\nRoot query type 3\n\"\"\"\ntype Query {\n  \"\"\"\n  Say hello! 2\n  \"\"\"\n  hello: String!\n}\n\nschema {\n  query: Query\n}\n";
/*********************************** THIS IS AUTOGENERATED FILE ***********************************/
export var source = new Source(src, '@the-gear/sample-rollup-server-simple/src/schema.graphql');
/*********************************** THIS IS AUTOGENERATED FILE ***********************************/
export var documentNode = /*@__PURE__*/ parse(source, {
    experimentalFragmentVariables: true,
    experimentalVariableDefinitionDirectives: true
});
/*********************************** THIS IS AUTOGENERATED FILE ***********************************/
export var documentAst = {
    kind: 'Document',
    definitions: [
        {
            kind: 'ObjectTypeDefinition',
            description: { kind: 'StringValue', value: 'Root query type 3', block: true },
            name: { kind: 'Name', value: 'Query' },
            interfaces: [],
            directives: [],
            fields: [
                {
                    kind: 'FieldDefinition',
                    description: { kind: 'StringValue', value: 'Say hello! 2', block: true },
                    name: { kind: 'Name', value: 'hello' },
                    arguments: [],
                    type: {
                        kind: 'NonNullType',
                        type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } }
                    },
                    directives: []
                },
            ]
        },
        {
            kind: 'SchemaDefinition',
            directives: [],
            operationTypes: [
                {
                    kind: 'OperationTypeDefinition',
                    operation: 'query',
                    type: { kind: 'NamedType', name: { kind: 'Name', value: 'Query' } }
                },
            ]
        },
    ]
};
/**
 * Type config for object Query
 *
 * Root query type 3
 */
export function createQueryType() {
    return new GraphQLObjectType({
        name: 'Query',
        description: 'Root query type 3'
    });
}
export var schema = /*@__PURE__*/ buildASTSchema(documentAst);
export default schema;
