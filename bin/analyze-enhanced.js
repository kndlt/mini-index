#!/usr/bin/env node

const path = require('path');

try {
  const EnhancedAnalyzer = require('../lib/enhanced-analyzer');

  // Get the target directory from command line arguments or use current directory
  const targetDir = process.argv[2] || process.cwd();
  const absolutePath = path.resolve(targetDir);

  console.log(`🔍 Enhanced Analysis of: ${absolutePath}\n`);

  const analyzer = new EnhancedAnalyzer();
  const result = analyzer.analyzeProject(absolutePath);
  console.log(result);
  
  console.log('\n' + '='.repeat(50));
  analyzer.displayCompatibilityScore();
} catch (error) {
  console.error('Error analyzing project:', error.message);
  process.exit(1);
}
