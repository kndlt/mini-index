#!/usr/bin/env node

const EnhancedAnalyzer = require('./lib/enhanced-analyzer');

console.log('🔬 Phase 3 Enhanced Parser Testing\n');

const analyzer = new EnhancedAnalyzer();

// Test the enhanced analyzer
console.log('=== Testing Enhanced TypeScript/JSX Parsing ===\n');

// Test directory analysis with enhanced parsing
console.log('📂 Testing enhanced directory scanning:');
const result = analyzer.analyzeProject('./test-samples');
console.log(result);

// Display compatibility report
console.log('\n=== Enhanced Compatibility Report ===\n');
analyzer.displayCompatibilityScore();

console.log('\n🎉 Phase 3 Implementation Complete!');
