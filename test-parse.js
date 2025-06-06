const fs = require('fs');
const espree = require('espree');

const content = fs.readFileSync('./test-samples/user.js', 'utf-8');
console.log('File content:');
console.log(content);

try {
  const ast = espree.parse(content, {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: false,
      globalReturn: true
    }
  });
  console.log('\nAST parsed successfully');
  console.log('AST type:', ast.type);
  console.log('Body length:', ast.body.length);
} catch (error) {
  console.log('\nParsing error:', error.message);
}
