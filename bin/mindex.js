#!/usr/bin/env node

const path = require('path');
const EnhancedAnalyzer = require('../lib/enhanced-analyzer');

/**
 * mindex CLI - Phase 4 implementation
 * Usage: npx mindex .
 * 
 * Exports all files and symbols in the specified directory using enhanced parsing
 */

// Get the target directory from command line arguments or use current directory
const targetDir = process.argv[2] || process.cwd();
const absolutePath = path.resolve(targetDir);

console.log(`🔍 Mini-Index: Analyzing ${absolutePath}\n`);

try {
  const analyzer = new EnhancedAnalyzer();
  const result = analyzer.analyzeProject(absolutePath);
  console.log(result);
} catch (error) {
  console.error('❌ Error analyzing project:', error.message);
  process.exit(1);
}
