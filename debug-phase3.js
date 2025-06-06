#!/usr/bin/env node

const fs = require('fs');
const TypeScriptParser = require('./lib/parsers/typescript-parser');
const JSXParser = require('./lib/parsers/jsx-parser');

console.log('🔍 Debug: Testing Individual Parsers\n');

const tsParser = new TypeScriptParser();
const jsxParser = new JSXParser();

// Test TypeScript parser
console.log('=== TypeScript Parser Test ===');
const tsContent = fs.readFileSync('./test-samples/types.ts', 'utf-8');
console.log('TypeScript file content:');
console.log(tsContent);
console.log('\nTypeScript parser result:');
const tsResult = tsParser.parse(tsContent, './test-samples/types.ts');
console.log(JSON.stringify(tsResult, null, 2));
console.log('Export names:', tsResult.map(r => r.name));

console.log('\n=== JSX Parser Test ===');
const jsxContent = fs.readFileSync('./test-samples/components.jsx', 'utf-8');
console.log('JSX file content:');
console.log(jsxContent);
console.log('\nJSX parser result:');
const jsxResult = jsxParser.parse(jsxContent, './test-samples/components.jsx');
console.log(JSON.stringify(jsxResult, null, 2));
console.log('Export names:', jsxResult.map(r => r.name));
