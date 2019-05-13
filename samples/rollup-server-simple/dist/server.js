'use strict';

require('source-map-support/register');
var printer = require('graphql/language/printer');
require('graphql/language/parser');
require('graphql/language/source');
var buildASTSchema = require('graphql/utilities/buildASTSchema');

// #sha384: bRZnrVnmqswIC3umx2V2xhQJzwCFtTNy07B8r2cOYidhS2MZtvV+LNuZDw8HVUWx
// GENERATED FILE. DO NOT EDIT!
var documentAst = {
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
var schema = /*@__PURE__*/ buildASTSchema.buildASTSchema(documentAst);

console.log(printer.print(documentAst));

module.exports = schema;
//# sourceMappingURL=server.js.map
