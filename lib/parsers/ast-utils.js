/**
 * Shared utilities for AST traversal and manipulation
 */

/**
 * Traverse an AST node recursively with a visitor function
 * @param {Object} node - The AST node to traverse
 * @param {Function} visitor - Function called for each node
 * @param {Set} processedNodes - Set to track already processed nodes (optional)
 */
function traverse(node, visitor, processedNodes = new Set()) {
  if (!node || typeof node !== 'object' || processedNodes.has(node)) {
    return;
  }
  
  processedNodes.add(node);
  visitor(node);
  
  // Traverse all properties except 'parent' to avoid circular references
  for (const key in node) {
    if (key !== 'parent') {
      const child = node[key];
      if (Array.isArray(child)) {
        child.forEach(item => traverse(item, visitor, processedNodes));
      } else if (child && typeof child === 'object') {
        traverse(child, visitor, processedNodes);
      }
    }
  }
}

/**
 * Extract name from various node types
 * @param {Object} node - The AST node
 * @returns {string|null} The extracted name or null
 */
function extractNodeName(node) {
  if (!node) return null;
  
  // Direct name property
  if (node.name) return node.name;
  
  // Identifier node
  if (node.type === 'Identifier') return node.name;
  
  // Member expression (e.g., exports.foo)
  if (node.type === 'MemberExpression' && node.property) {
    return extractNodeName(node.property);
  }
  
  // Variable declarator
  if (node.type === 'VariableDeclarator' && node.id) {
    return extractNodeName(node.id);
  }
  
  return null;
}

/**
 * Check if a node represents an export
 * @param {Object} node - The AST node
 * @returns {boolean}
 */
function isExportNode(node) {
  return node && (
    node.type === 'ExportNamedDeclaration' ||
    node.type === 'ExportDefaultDeclaration' ||
    node.type === 'ExportAllDeclaration'
  );
}

/**
 * Get the export type from an export node
 * @param {Object} node - The AST node
 * @returns {string} 'named', 'default', or 'all'
 */
function getExportType(node) {
  if (node.type === 'ExportDefaultDeclaration') return 'default';
  if (node.type === 'ExportAllDeclaration') return 'all';
  return 'named';
}

/**
 * Create a standardized symbol object
 * @param {Object} options - Symbol properties
 * @returns {Object} Standardized symbol
 */
function createSymbol(options) {
  const {
    name,
    type = 'unknown',
    exported = false,
    exportType = null,
    metadata = {}
  } = options;
  
  return {
    name,
    type,
    exported,
    exportType,
    ...metadata
  };
}

/**
 * Convert parser-specific results to simple name array for compatibility
 * @param {Array} symbols - Array of symbol objects
 * @returns {Array} Array of symbol names
 */
function extractNames(symbols) {
  return [...new Set(symbols.map(s => s.name).filter(Boolean))];
}

module.exports = {
  traverse,
  extractNodeName,
  isExportNode,
  getExportType,
  createSymbol,
  extractNames
};