const { parse } = require('@typescript-eslint/typescript-estree');
const { traverse, isExportNode, getExportType } = require('./ast-utils');

class TypeScriptParser {
  constructor() {
    this.supportedExtensions = ['.ts', '.tsx'];
  }

  parse(content, filePath) {
    try {
      const ast = parse(content, {
        loc: true,
        range: true,
        jsx: filePath.endsWith('.tsx'),
        useJSXTextNode: true,
        ecmaFeatures: {
          jsx: true
        }
      });
      
      return this.extractExports(ast);
    } catch (error) {
      console.warn(`TypeScript parsing failed for ${filePath}:`, error.message);
      return [];
    }
  }

  extractExports(ast) {
    const exports = [];
    
    traverse(ast, (node) => {
      // Enhanced export detection - only process exported items
      if (node.type === 'ExportNamedDeclaration') {
        if (node.declaration) {
          if (node.declaration.type === 'TSInterfaceDeclaration') {
            exports.push({
              type: 'interface',
              name: node.declaration.id.name,
              exported: true,
              properties: this.extractInterfaceProperties(node.declaration.body)
            });
          } else if (node.declaration.type === 'TSTypeAliasDeclaration') {
            exports.push({
              type: 'type',
              name: node.declaration.id.name,
              exported: true,
              definition: this.getTypeDefinition(node.declaration.typeAnnotation)
            });
          } else if (node.declaration.type === 'FunctionDeclaration') {
            exports.push({
              type: 'function',
              name: node.declaration.id.name,
              exported: true
            });
          } else if (node.declaration.type === 'ClassDeclaration') {
            exports.push({
              type: 'class',
              name: node.declaration.id.name,
              exported: true
            });
          } else if (node.declaration.type === 'VariableDeclaration') {
            node.declaration.declarations.forEach(decl => {
              if (decl.id && decl.id.name) {
                exports.push({
                  type: 'variable',
                  name: decl.id.name,
                  exported: true
                });
              }
            });
          }
        }
        
        // export { foo, bar }
        if (node.specifiers) {
          node.specifiers.forEach(spec => {
            if (spec.exported && spec.exported.name) {
              exports.push({
                type: 'reexport',
                name: spec.exported.name,
                exported: true
              });
            }
          });
        }
      }
      
      // Default exports
      if (node.type === 'ExportDefaultDeclaration') {
        if (node.declaration) {
          if (node.declaration.type === 'FunctionDeclaration' || 
              node.declaration.type === 'ClassDeclaration') {
            exports.push({
              type: node.declaration.type === 'FunctionDeclaration' ? 'function' : 'class',
              name: node.declaration.id ? node.declaration.id.name : 'default',
              exported: true,
              isDefault: true
            });
          } else {
            exports.push({
              type: 'default',
              name: 'default',
              exported: true,
              isDefault: true
            });
          }
        }
      }
    });
    
    return exports;
  }

  extractInterfaceProperties(body) {
    if (!body || !body.body) return [];
    
    return body.body.map(member => {
      if (member.type === 'TSPropertySignature') {
        return {
          name: member.key.name,
          type: this.getTypeAnnotation(member.typeAnnotation),
          optional: member.optional
        };
      }
      return null;
    }).filter(Boolean);
  }

  getTypeAnnotation(typeAnnotation) {
    if (!typeAnnotation) return 'any';
    
    const typeNode = typeAnnotation.typeAnnotation || typeAnnotation;
    return this.getTypeDefinition(typeNode);
  }

  getTypeDefinition(typeNode) {
    if (!typeNode) return 'unknown';
    
    switch (typeNode.type) {
      case 'TSStringKeyword': 
        return 'string';
      case 'TSNumberKeyword': 
        return 'number';
      case 'TSBooleanKeyword': 
        return 'boolean';
      case 'TSNullKeyword': 
        return 'null';
      case 'TSUndefinedKeyword': 
        return 'undefined';
      case 'TSVoidKeyword': 
        return 'void';
      case 'TSAnyKeyword': 
        return 'any';
      case 'TSUnknownKeyword': 
        return 'unknown';
      case 'TSArrayType':
        return `${this.getTypeDefinition(typeNode.elementType)}[]`;
      case 'TSTypeReference':
        if (typeNode.typeName && typeNode.typeName.name) {
          let typeName = typeNode.typeName.name;
          // Handle generic types
          if (typeNode.typeParameters && typeNode.typeParameters.params) {
            const params = typeNode.typeParameters.params
              .map(param => this.getTypeDefinition(param))
              .join(', ');
            typeName += `<${params}>`;
          }
          return typeName;
        }
        return 'unknown';
      case 'TSUnionType':
        return typeNode.types
          .map(t => this.getTypeDefinition(t))
          .join(' | ');
      case 'TSIntersectionType':
        return typeNode.types
          .map(t => this.getTypeDefinition(t))
          .join(' & ');
      case 'TSLiteralType':
        if (typeNode.literal) {
          if (typeNode.literal.type === 'Literal') {
            return JSON.stringify(typeNode.literal.value);
          }
        }
        return 'literal';
      case 'TSTypeLiteral':
        // Object type { prop: type }
        if (typeNode.members && typeNode.members.length > 0) {
          const props = typeNode.members
            .map(member => {
              if (member.type === 'TSPropertySignature' && member.key) {
                const propName = member.key.name;
                const propType = this.getTypeDefinition(member.typeAnnotation?.typeAnnotation);
                const optional = member.optional ? '?' : '';
                return `${propName}${optional}: ${propType}`;
              }
              return null;
            })
            .filter(Boolean)
            .join('; ');
          return `{ ${props} }`;
        }
        return 'object';
      case 'TSFunctionType':
        // Function type signature
        return 'function';
      case 'TSTupleType':
        // Tuple type [string, number]
        const elements = typeNode.elementTypes
          .map(el => this.getTypeDefinition(el))
          .join(', ');
        return `[${elements}]`;
      case 'TSMappedType':
        return 'mapped';
      case 'TSConditionalType':
        return 'conditional';
      default: 
        return 'complex';
    }
  }
}

module.exports = TypeScriptParser;
