// Basic entry point for mini-index package
const { extractExports, scanDirectory, formatStructure, analyzeProject } = require('./lib/ast-parser.js');

module.exports = {
  version: '0.1.0',
  extractExports,
  scanDirectory,
  formatStructure,
  analyzeProject
};
