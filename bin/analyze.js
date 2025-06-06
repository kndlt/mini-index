#!/usr/bin/env node

const path = require('path');
const { analyzeProject } = require('../lib/ast-parser.js');

// Get the target directory from command line arguments or use current directory
const targetDir = process.argv[2] || process.cwd();
const absolutePath = path.resolve(targetDir);

console.log(`Analyzing project at: ${absolutePath}\n`);

try {
  const result = analyzeProject(absolutePath);
  console.log(result);
} catch (error) {
  console.error('Error analyzing project:', error.message);
  process.exit(1);
}
