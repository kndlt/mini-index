const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

class PythonParser {
  /**
   * Synchronous version of parse for compatibility with existing codebase
   * @param {string} content - Python source code
   * @param {string} filePath - Path to the file
   * @returns {Array} Array of symbol names (for compatibility)
   */
  parseSync(content, filePath) {
    try {
      // Create temporary files
      const tempDir = os.tmpdir();
      const timestamp = Date.now() + Math.random().toString(36).substr(2, 9);
      const sourceFile = path.join(tempDir, `python_source_${timestamp}.py`);
      const scriptFile = path.join(tempDir, `python_parser_${timestamp}.py`);
      
      // Write the source code to a temporary file
      fs.writeFileSync(sourceFile, content, 'utf-8');
      
      // Create the parser script with escaped path
      const escapedSourcePath = sourceFile.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      const parserScript = `import ast
import json
import sys

def extract_symbols(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            source_code = f.read()
        
        tree = ast.parse(source_code)
        symbols = []
        
        # Only process top-level nodes, not nested ones
        for node in tree.body:
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                if not node.name.startswith('_'):
                    symbols.append(node.name)
            elif isinstance(node, ast.ClassDef):
                if not node.name.startswith('_'):
                    symbols.append(node.name)
            elif isinstance(node, ast.Assign) and hasattr(node, 'lineno'):
                for target in node.targets:
                    if isinstance(target, ast.Name):
                        if not target.id.startswith('_'):
                            symbols.append(target.id)
        
        return symbols
    except Exception as e:
        return []

try:
    symbols = extract_symbols('${escapedSourcePath}')
    print(json.dumps(symbols))
except Exception as e:
    print(json.dumps([]))
`;

      fs.writeFileSync(scriptFile, parserScript, 'utf-8');

      const output = execSync(`python3 "${scriptFile}"`, {
        encoding: 'utf-8',
        timeout: 5000,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      // Clean up temporary files
      try {
        fs.unlinkSync(sourceFile);
        fs.unlinkSync(scriptFile);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }

      const symbols = JSON.parse(output.trim());
      return symbols;
      
    } catch (error) {
      console.warn(`Python parsing failed for ${filePath}: ${error.message}`);
      return [];
    }
  }
}

module.exports = PythonParser;
