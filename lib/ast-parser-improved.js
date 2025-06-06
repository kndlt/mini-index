const fs = require('fs');
const path = require('path');
const espree = require('espree');
const { parse } = require('@typescript-eslint/typescript-estree');

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

    let ast;
    const exports = new Set();

    // Use TypeScript parser for .ts and .tsx files, or files with JSX
    if (ext === '.ts' || ext === '.tsx' || (content.includes('<') && content.includes('>'))) {
      try {
        ast = parse(content, {
          sourceType: 'module',
          ecmaVersion: 'latest',
          jsx: true,
          allowInvalidAST: true,
          errorOnUnknownASTType: false,
          range: false,
          loc: false
        });
        
        // Use custom traversal for TypeScript AST
        traverseTypeScriptAST(ast, exports, filePath);
        return Array.from(exports);
      } catch (tsError) {
        console.warn(`TypeScript parsing failed for ${filePath}: ${tsError.message}`);
        return tryEspreeParser(content, ext, filePath);
      }
    } else {
      // Use espree for plain JS files
      return tryEspreeParser(content, ext, filePath);
    }
  } catch (error) {
    console.warn(`Failed to parse ${filePath}: ${error.message}`);
    return [];
  }
}

/**
 * Try parsing with espree (for JS files)
 */
function tryEspreeParser(content, ext, filePath) {
  const estraverse = require('estraverse');
  
  const parseOptions = {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: ext.includes('x'),
      globalReturn: true
    }
  };

  let ast;
  const exports = new Set();

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
      console.warn(`Failed to parse ${filePath}: ${scriptError.message}`);
      return [];
    }
  }

  estraverse.traverse(ast, {
    enter: function(node) {
      extractExportsFromNode(node, exports, filePath);
    }
  });
  
  return Array.from(exports);
}

/**
 * Custom traversal for TypeScript AST (handles TypeScript and JSX nodes)
 */
function traverseTypeScriptAST(node, exports, filePath, visited = new Set()) {
  if (!node || typeof node !== 'object' || visited.has(node)) {
    return;
  }
  visited.add(node);

  // Extract exports from current node
  extractExportsFromNode(node, exports, filePath);

  // Recursively traverse child nodes
  for (const key in node) {
    if (key === 'parent' || key === 'range' || key === 'loc') continue;
    
    const child = node[key];
    if (Array.isArray(child)) {
      child.forEach(item => traverseTypeScriptAST(item, exports, filePath, visited));
    } else if (child && typeof child === 'object') {
      traverseTypeScriptAST(child, exports, filePath, visited);
    }
  }
}

/**
 * Extract exports from a single AST node
 */
function extractExportsFromNode(node, exports, filePath) {
  if (!node || !node.type) return;

  // Named exports: export function foo() {}, export const bar = ...
  if (node.type === 'ExportNamedDeclaration') {
    if (node.declaration) {
      if (node.declaration.type === 'FunctionDeclaration' || 
          node.declaration.type === 'ClassDeclaration' ||
          node.declaration.type === 'TSInterfaceDeclaration' ||
          node.declaration.type === 'TSTypeAliasDeclaration') {
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
      node.left && node.left.type === 'MemberExpression' &&
      node.left.object && node.left.object.name === 'module' &&
      node.left.property && node.left.property.name === 'exports') {
    
    if (node.right && node.right.type === 'ObjectExpression') {
      node.right.properties.forEach(prop => {
        if (prop.type === 'Property' && prop.key && prop.key.name) {
          exports.add(prop.key.name);
        }
      });
    }
  }

  // exports.foo = ... for CommonJS
  if (node.type === 'AssignmentExpression' && 
      node.left && node.left.type === 'MemberExpression' &&
      node.left.object && node.left.object.name === 'exports' &&
      node.left.property && node.left.property.name) {
    exports.add(node.left.property.name);
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
