import { DefinitionNode } from 'graphql';

export function transformDefinitionNode(def: DefinitionNode) {
  switch (def.kind) {
    case 'ObjectTypeDefinition': {
      // this.processObjectTypeDefinition(def);
      console.log(`[graphql-ts] ObjectTypeDefinition ${def.name.value}`);
      break;
    }
    case 'SchemaDefinition': {
      // this.processSchemaDefinition(def);
      break;
    }
    // definitions:
    case 'OperationDefinition':
    case 'FragmentDefinition':
    case 'ScalarTypeDefinition':
    case 'ObjectTypeDefinition':
    case 'InterfaceTypeDefinition':
    case 'UnionTypeDefinition':
    case 'EnumTypeDefinition':
    case 'InputObjectTypeDefinition':
    case 'DirectiveDefinition':
    // extensions:
    case 'SchemaExtension':
    case 'ScalarTypeExtension':
    case 'ObjectTypeExtension':
    case 'InterfaceTypeExtension':
    case 'UnionTypeExtension':
    case 'EnumTypeExtension':
    case 'InputObjectTypeExtension':
    default: {
      console.log(`[graphql-ts] ${def.kind}`);
    }
  }
}
