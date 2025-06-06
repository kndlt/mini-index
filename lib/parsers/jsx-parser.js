const { parse } = require('@babel/parser');

class JSXParser {
  constructor() {
    this.supportedExtensions = ['.jsx', '.tsx'];
  }

  parse(content, filePath) {
    try {
      const ast = parse(content, {
        sourceType: 'module',
        plugins: [
          'jsx',
          'typescript',
          'decorators-legacy',
          'classProperties',
          'functionBind'
        ]
      });
      
      return this.extractComponents(ast);
    } catch (error) {
      console.warn(`JSX parsing failed for ${filePath}:`, error.message);
      return [];
    }
  }

  extractComponents(ast) {
    const components = [];
    const processedNodes = new Set();
    
    const traverse = (node) => {
      if (!node || typeof node !== 'object' || processedNodes.has(node)) return;
      processedNodes.add(node);
      
      // Export detection for components - prioritize exported components
      if (node.type === 'ExportNamedDeclaration') {
        if (node.declaration) {
          if (node.declaration.type === 'FunctionDeclaration' && this.returnsJSX(node.declaration.body)) {
            components.push({
              type: 'component',
              name: node.declaration.id.name,
              componentType: 'function',
              exported: true,
              exportType: 'named',
              props: this.extractProps(node.declaration.params)
            });
          } else if (node.declaration.type === 'VariableDeclaration') {
            node.declaration.declarations.forEach(decl => {
              if (decl.init && 
                  (decl.init.type === 'ArrowFunctionExpression' || decl.init.type === 'FunctionExpression') &&
                  this.returnsJSX(decl.init.body)) {
                components.push({
                  type: 'component',
                  name: decl.id.name,
                  componentType: 'function',
                  exported: true,
                  exportType: 'named',
                  props: this.extractProps(decl.init.params)
                });
              }
            });
          }
        }
        
        // export { Component }
        if (node.specifiers) {
          node.specifiers.forEach(spec => {
            const existingComponent = components.find(c => c.name === spec.local.name);
            if (existingComponent) {
              existingComponent.exported = true;
              existingComponent.exportType = 'named';
            }
          });
        }
      }
      
      // Default exports
      else if (node.type === 'ExportDefaultDeclaration') {
        if (node.declaration.type === 'FunctionDeclaration' && this.returnsJSX(node.declaration.body)) {
          components.push({
            type: 'component',
            name: node.declaration.id ? node.declaration.id.name : 'default',
            componentType: 'function',
            exported: true,
            exportType: 'default',
            props: this.extractProps(node.declaration.params)
          });
        }
      }
      
      // Recursively traverse
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
    return components;
  }

  returnsJSX(body) {
    if (!body) return false;
    
    const checkNode = (node) => {
      if (!node) return false;
      if (node.type === 'JSXElement' || node.type === 'JSXFragment') return true;
      if (node.type === 'ReturnStatement') return checkNode(node.argument);
      if (node.type === 'BlockStatement') {
        return node.body.some(stmt => checkNode(stmt));
      }
      if (node.type === 'ConditionalExpression') {
        return checkNode(node.consequent) || checkNode(node.alternate);
      }
      if (node.type === 'LogicalExpression') {
        return checkNode(node.left) || checkNode(node.right);
      }
      return false;
    };
    
    return checkNode(body);
  }

  getComponentName(node) {
    if (node.type === 'FunctionDeclaration') {
      return node.id ? node.id.name : 'Anonymous';
    }
    return 'Anonymous';
  }

  extractProps(params) {
    if (!params || params.length === 0) return [];
    
    const firstParam = params[0];
    if (firstParam.type === 'ObjectPattern') {
      return firstParam.properties.map(prop => ({
        name: prop.key.name,
        type: prop.typeAnnotation ? this.getTypeFromAnnotation(prop.typeAnnotation) : 'unknown'
      }));
    }
    
    return [];
  }

  extendsReactComponent(node) {
    if (!node.superClass) return false;
    
    if (node.superClass.type === 'Identifier') {
      return node.superClass.name === 'Component' || node.superClass.name === 'PureComponent';
    }
    
    if (node.superClass.type === 'MemberExpression') {
      return node.superClass.object.name === 'React' && 
             (node.superClass.property.name === 'Component' || 
              node.superClass.property.name === 'PureComponent');
    }
    
    return false;
  }

  extractClassMethods(classBody) {
    if (!classBody.body) return [];
    
    return classBody.body
      .filter(member => member.type === 'MethodDefinition')
      .map(method => ({
        name: method.key.name,
        kind: method.kind
      }));
  }

  getTypeFromAnnotation(annotation) {
    // Simplified type extraction
    return 'unknown';
  }
}

module.exports = JSXParser;
