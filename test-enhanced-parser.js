#!/usr/bin/env node

// Test the improved parser directly
const fs = require('fs');
const path = require('path');

console.log('🔬 Testing Enhanced TypeScript/JSX Parser\n');

// Load the improved parser manually to avoid any module loading issues
const content = fs.readFileSync('./lib/ast-parser-improved.js', 'utf-8');
const moduleObj = { exports: {} };
const func = new Function('module', 'exports', 'require', content);
func(moduleObj, moduleObj.exports, require);

const parser = moduleObj.exports;

console.log('=== Enhanced Parser Test ===');

const testFiles = [
  {
    file: './test-samples/types.ts',
    expected: ['User', 'Message', 'DEFAULT_CONFIG', 'ChatState'],
    description: 'TypeScript interfaces and types'
  },
  {
    file: './test-samples/components.jsx',
    expected: ['ChatInterface', 'ErrorBoundary', 'Footer'],
    description: 'React JSX components'
  },
  {
    file: './test-samples/user.js',
    expected: ['generateUserId', 'getCurrentUser', 'createUser', 'updateUserActivity'],
    description: 'CommonJS exports (control test)'
  }
];

let enhancedResults = [];

testFiles.forEach(({ file, expected, description }) => {
  console.log(`\n📁 Testing ${file} (${description})`);
  try {
    const exports = parser.extractExports(file);
    const sortedExports = exports.sort();
    const sortedExpected = expected.sort();
    
    console.log(`  Found: [${sortedExports.join(', ')}]`);
    console.log(`  Expected: [${sortedExpected.join(', ')}]`);
    
    const matches = JSON.stringify(sortedExports) === JSON.stringify(sortedExpected);
    const partial = sortedExports.length > 0 && sortedExports.some(e => sortedExpected.includes(e));
    
    if (matches) {
      console.log(`  ✅ Result: PERFECT MATCH`);
      enhancedResults.push({ file, status: 'perfect' });
    } else if (partial) {
      console.log(`  🟡 Result: PARTIAL MATCH`);
      enhancedResults.push({ file, status: 'partial' });
    } else {
      console.log(`  ❌ Result: NO MATCH`);
      enhancedResults.push({ file, status: 'none' });
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    enhancedResults.push({ file, status: 'error', error: error.message });
  }
});

console.log('\n=== Enhanced Parser vs Original Parser ===');
console.log('\n📊 Comparison Results:');

enhancedResults.forEach(result => {
  const filename = path.basename(result.file);
  console.log(`  ${filename}: ${result.status}`);
  if (result.error) {
    console.log(`    Error: ${result.error}`);
  }
});

// Test directory scanning with enhanced parser
console.log('\n=== Enhanced Directory Scanning ===');
try {
  const structure = parser.scanDirectory('./test-samples');
  const formatted = parser.formatStructure(structure);
  console.log('\n📂 Enhanced parser output:');
  console.log(formatted);
} catch (error) {
  console.log(`❌ Directory scanning failed: ${error.message}`);
}

console.log('\n' + '='.repeat(50));
console.log('🎯 ENHANCED PARSER EVALUATION');
console.log('='.repeat(50));

const perfectMatches = enhancedResults.filter(r => r.status === 'perfect').length;
const partialMatches = enhancedResults.filter(r => r.status === 'partial').length;
const totalFiles = enhancedResults.length;

console.log(`Perfect matches: ${perfectMatches}/${totalFiles}`);
console.log(`Partial matches: ${partialMatches}/${totalFiles}`);
console.log(`Total improved files: ${perfectMatches + partialMatches}/${totalFiles}`);

if (perfectMatches === totalFiles) {
  console.log('🎉 Enhanced parser is working perfectly!');
} else if (perfectMatches + partialMatches >= totalFiles * 0.8) {
  console.log('✨ Enhanced parser shows significant improvement!');
} else {
  console.log('🔧 Enhanced parser needs more work');
}
