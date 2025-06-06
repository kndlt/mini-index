// Debug script to test the parser
const parser = require('./lib/ast-parser.js');

console.log('Testing user.js exports:');
const userExports = parser.extractExports('./test-samples/user.js');
console.log('Result:', userExports);

console.log('\nTesting components.jsx exports:');
const componentExports = parser.extractExports('./test-samples/components.jsx');
console.log('Result:', componentExports);

console.log('\nTesting index.js exports:');
const indexExports = parser.extractExports('./index.js');
console.log('Result:', indexExports);
