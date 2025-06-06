const fs = require('fs');
const path = require('path');
const espree = require('espree');
const estraverse = require('estraverse');

/**
 * Parse a JavaScript/TypeScript file and extract exported symbols
 * @param {string} filePath - Path to the file to parse
 * @returns {Array<string>} Array of exported symbol names
 */
function extractExports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const ext = path.extname(filePath);
    
    // Skip non-JS/TS files
    if (!['.js', '.jsx', '.ts', '.tsx', '.mjs'].includes(ext)) {
      return [];
    }

    // Configure parser options based on file extension
    const parseOptions = {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: {
        jsx: ext.includes('x'), // Enable JSX for .jsx and .tsx files
        globalReturn: true
      }
    };

    // Try to parse with espree first, fall back for different source types
    let ast;
    try {
      ast = espree.parse(content, parseOptions);
    } catch (error) {
      // Try parsing as script (CommonJS) if module parsing fails
      try {
        ast = espree.parse(content, {
          ...parseOptions,
          sourceType: 'script'
        });
      } catch (scriptError) {
        // For TypeScript files, try to strip types and parse as JS
        if (ext === '.ts' || ext === '.tsx') {
          // Simple type stripping - remove type annotations
          const strippedContent = content
            .replace(/:\s*[A-Za-z_$][A-Za-z0-9_$]*(\[\])?(\s*\|\s*[A-Za-z_$][A-Za-z0-9_$]*(\[\])?)*\s*=/g, ' =')
            .replace(/:\s*[A-Za-z_$][A-Za-z0-9_$]*(\[\])?(\s*\|\s*[A-Za-z_$][A-Za-z0-9_$]*(\[\])?)*\s*;/g, ';')
            .replace(/:\s*[A-Za-z_$][A-Za-z0-9_$]*(\[\])?(\s*\|\s*[A-Za-z_$][A-Za-z0-9_$]*(\[\])?)*\s*\)/g, ')')
            .replace(/interface\s+[A-Za-z_$][A-Za-z0-9_$]*\s*{[^}]*}/g, '')
            .replace(/type\s+[A-Za-z_$][A-Za-z0-9_$]*\s*=[^;]+;/g, '');
          
          try {
            ast = espree.parse(strippedContent, { ...parseOptions, sourceType: 'script' });
          } catch (stripError) {
            console.warn(`Failed to parse ${filePath}: ${stripError.message}`);
            return [];
          }
        } else {
          console.warn(`Failed to parse ${filePath}: ${scriptError.message}`);
          return [];
        }
      }
    }

    const exports = new Set();

    // Traverse the AST to find exports
    estraverse.traverse(ast, {
      enter: function(node) {
        // Named exports: export function foo() {}, export const bar = ...
        if (node.type === 'ExportNamedDeclaration') {
          if (node.declaration) {
            if (node.declaration.type === 'FunctionDeclaration' || 
                node.declaration.type === 'ClassDeclaration') {
              if (node.declaration.id && node.declaration.id.name) {
                exports.add(node.declaration.id.name);
              }
            } else if (node.declaration.type === 'VariableDeclaration') {
              node.declaration.declarations.forEach(decl => {
                if (decl.id && decl.id.name) {
                  exports.add(decl.id.name);
                }
              });
            }
          }
          
          // export { foo, bar }
          if (node.specifiers) {
            node.specifiers.forEach(spec => {
              if (spec.exported && spec.exported.name) {
                exports.add(spec.exported.name);
              }
            });
          }
        }
        
        // Default export: export default function() {} or export default class {}
        if (node.type === 'ExportDefaultDeclaration') {
          if (node.declaration) {
            if (node.declaration.type === 'FunctionDeclaration' || 
                node.declaration.type === 'ClassDeclaration') {
              if (node.declaration.id && node.declaration.id.name) {
                exports.add(node.declaration.id.name);
              } else {
                // Anonymous default export, use filename
                const basename = path.basename(filePath, path.extname(filePath));
                exports.add(basename.charAt(0).toUpperCase() + basename.slice(1));
              }
            } else {
              // Default export of expression, use filename
              const basename = path.basename(filePath, path.extname(filePath));
              exports.add(basename.charAt(0).toUpperCase() + basename.slice(1));
            }
          }
        }

        // module.exports for CommonJS
        if (node.type === 'AssignmentExpression' && 
            node.left.type === 'MemberExpression' &&
            node.left.object.name === 'module' &&
            node.left.property.name === 'exports') {
          
          if (node.right.type === 'ObjectExpression') {
            node.right.properties.forEach(prop => {
              if (prop.type === 'Property' && prop.key.name) {
                exports.add(prop.key.name);
              }
            });
          }
        }

        // exports.foo = ... for CommonJS
        if (node.type === 'AssignmentExpression' && 
            node.left.type === 'MemberExpression' &&
            node.left.object.name === 'exports' &&
            node.left.property.name) {
          exports.add(node.left.property.name);
        }
      }
    });

    return Array.from(exports);
  } catch (error) {
    // If parsing fails, return empty array
    console.warn(`Failed to parse ${filePath}: ${error.message}`);
    return [];
  }
}

/**
 * Recursively scan a directory and build file structure with exports
 * @param {string} dirPath - Directory to scan
 * @param {string} basePath - Base path for relative calculations
 * @param {Array<string>} skipDirs - Directories to skip
 * @returns {Object} File structure with exports
 */
function scanDirectory(dirPath, basePath = dirPath, skipDirs = ['node_modules', '.git', '.next', 'dist', 'build']) {
  const result = {};
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const relativePath = path.relative(basePath, fullPath);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!skipDirs.includes(item) && !item.startsWith('.')) {
          result[item + '/'] = scanDirectory(fullPath, basePath, skipDirs);
        }
      } else {
        const exports = extractExports(fullPath);
        result[item] = exports;
      }
    }
  } catch (error) {
    console.warn(`Failed to scan directory ${dirPath}: ${error.message}`);
  }
  
  return result;
}

/**
 * Format the file structure as a tree string
 * @param {Object} structure - File structure object
 * @param {number} indent - Current indentation level
 * @returns {string} Formatted tree string
 */
function formatStructure(structure, indent = 0) {
  let output = '';
  const spaces = '  '.repeat(indent);
  
  for (const [name, value] of Object.entries(structure)) {
    if (name.endsWith('/')) {
      // Directory
      output += `${spaces}- ${name}\n`;
      output += formatStructure(value, indent + 1);
    } else {
      // File
      if (Array.isArray(value) && value.length > 0) {
        output += `${spaces}- ${name}: ${value.join(', ')}\n`;
      } else {
        output += `${spaces}- ${name}\n`;
      }
    }
  }
  
  return output;
}

/**
 * Main function to analyze a project directory
 * @param {string} projectPath - Path to the project directory
 * @returns {string} Formatted file structure with exports
 */
function analyzeProject(projectPath) {
  const structure = scanDirectory(projectPath);
  return formatStructure(structure);
}

module.exports = {
  extractExports,
  scanDirectory,
  formatStructure,
  analyzeProject
};
