const { parse } = require('@typescript-eslint/typescript-estree');

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
    const processedNodes = new Set();
    
    const traverse = (node) => {
      if (!node || typeof node !== 'object' || processedNodes.has(node)) return;
      processedNodes.add(node);
      
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
      
      // Recursively traverse child nodes
      for (const key in node) {
        if (key !== 'parent') {
          const child = node[key];
          if (Array.isArray(child)) {
            child.forEach(traverse);
          } else if (child && typeof child === 'object') {
            traverse(child);
          }
        }
      }
    };
    
    traverse(ast);
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
    
    const typeNode = typeAnnotation.typeAnnotation;
    switch (typeNode.type) {
      case 'TSStringKeyword': return 'string';
      case 'TSNumberKeyword': return 'number';
      case 'TSBooleanKeyword': return 'boolean';
      case 'TSArrayType': return `${this.getTypeAnnotation(typeNode.elementType)}[]`;
      case 'TSTypeReference': return typeNode.typeName.name;
      default: return 'unknown';
    }
  }

  getTypeDefinition(typeNode) {
    if (!typeNode) return 'unknown';
    
    switch (typeNode.type) {
      case 'TSUnionType':
        return typeNode.types.map(t => this.getTypeDefinition(t)).join(' | ');
      case 'TSStringKeyword': return 'string';
      case 'TSNumberKeyword': return 'number';
      case 'TSBooleanKeyword': return 'boolean';
      default: return 'complex';
    }
  }
}

module.exports = TypeScriptParser;
