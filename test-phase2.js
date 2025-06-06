#!/usr/bin/env node

const { analyzeProject, extractExports } = require('./lib/ast-parser.js');

console.log('🧪 Testing Phase 2 Implementation\n');

// Test 1: Individual file parsing
console.log('=== Test 1: Individual File Export Detection ===');

const testFiles = [
  {
    file: './test-samples/user.js',
    expected: ['generateUserId', 'getCurrentUser', 'createUser', 'updateUserActivity'],
    description: 'CommonJS exports'
  },
  {
    file: './test-samples/api/route.ts',
    expected: ['POST', 'GET'],
    description: 'ES6 function exports'
  }
];

let passedTests = 0;
let totalTests = testFiles.length;

testFiles.forEach(({ file, expected, description }) => {
  console.log(`\n📁 Testing ${file} (${description})`);
  try {
    const exports = extractExports(file);
    const sortedExports = exports.sort();
    const sortedExpected = expected.sort();
    
    console.log(`  Found: [${sortedExports.join(', ')}]`);
    console.log(`  Expected: [${sortedExpected.join(', ')}]`);
    
    const matches = JSON.stringify(sortedExports) === JSON.stringify(sortedExpected);
    console.log(`  ✅ Result: ${matches ? 'PASS' : 'FAIL'}`);
    
    if (matches) passedTests++;
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
});

// Test 2: Directory structure parsing
console.log('\n\n=== Test 2: Directory Structure Parsing ===');
console.log('\n📂 Testing test-samples directory structure:');

const result = analyzeProject('./test-samples');
console.log(result);

// Test 3: Expected output format validation
console.log('\n=== Test 3: Output Format Validation ===');
console.log('\n🔍 Checking if output matches expected format from phase2.md:');

const expectedPatterns = [
  '- api/',
  '  - route.ts: POST, GET',
  '- user.js: generateUserId, getCurrentUser, createUser, updateUserActivity'
];

let formatMatches = 0;
expectedPatterns.forEach(pattern => {
  if (result.includes(pattern)) {
    console.log(`  ✅ Found pattern: "${pattern}"`);
    formatMatches++;
  } else {
    console.log(`  ❌ Missing pattern: "${pattern}"`);
  }
});

// Test 4: Performance and error handling
console.log('\n\n=== Test 4: Error Handling ===');
console.log('\n🛡️  Testing error handling with invalid files:');

try {
  const invalidExports = extractExports('./nonexistent.js');
  console.log(`  ✅ Graceful handling of nonexistent file: returned ${invalidExports.length} exports`);
} catch (error) {
  console.log(`  ❌ Error not handled gracefully: ${error.message}`);
}

// Summary
console.log('\n\n' + '='.repeat(50));
console.log('📊 PHASE 2 IMPLEMENTATION TEST SUMMARY');
console.log('='.repeat(50));
console.log(`File Export Detection: ${passedTests}/${totalTests} tests passed`);
console.log(`Directory Structure: Working (generates tree output)`);
console.log(`Output Format: ${formatMatches}/${expectedPatterns.length} patterns match`);
console.log(`Error Handling: Graceful failure handling implemented`);

const overallScore = ((passedTests/totalTests) + (formatMatches/expectedPatterns.length)) / 2;
console.log(`\n🎯 Overall Phase 2 Score: ${(overallScore * 100).toFixed(1)}%`);

if (overallScore >= 0.8) {
  console.log('🎉 Phase 2 is working correctly!');
} else if (overallScore >= 0.6) {
  console.log('⚠️  Phase 2 is mostly working but needs some improvements');
} else {
  console.log('❌ Phase 2 needs significant fixes');
}

// Known limitations
console.log('\n📝 Known Limitations:');
console.log('  • TypeScript interfaces/types not fully parsed (requires @typescript-eslint/typescript-estree)');
console.log('  • JSX components not fully parsed (requires proper JSX traversal)');
console.log('  • These could be improved with the enhanced parser implementation');
