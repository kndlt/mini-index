#!/usr/bin/env node

const path = require('path');
const { 
  parseArguments, 
  displayHelp, 
  handleError, 
  formatOutput, 
  validateDirectory,
  getVersion 
} = require('../lib/cli-utils');
const EnhancedAnalyzer = require('../lib/enhanced-analyzer');

// Parse command line arguments
const options = parseArguments(process.argv);

// Handle help flag
if (options.help) {
  displayHelp();
  process.exit(0);
}

// Handle version flag
if (options.version) {
  console.log(`mindex version ${getVersion()}`);
  process.exit(0);
}

// Validate target directory
if (!validateDirectory(options.targetDir)) {
  handleError(new Error(`Directory not found or inaccessible: ${options.targetDir}`));
}

// Main execution
try {
  if (options.verbose) {
    console.log(`🔍 Analyzing: ${options.targetDir}`);
    console.log(`📋 Format: ${options.format}`);
  }

  // Use enhanced analyzer by default
  const analyzer = new EnhancedAnalyzer();
  
  // Get raw data for JSON format
  const rawData = options.format === 'json' 
    ? analyzer.analyzeProject(options.targetDir, { returnObject: true })
    : null;
  
  const result = analyzer.analyzeProject(options.targetDir);
  
  // Format and display output
  formatOutput(result, options, rawData);
  
} catch (error) {
  handleError(error, options.verbose);
}