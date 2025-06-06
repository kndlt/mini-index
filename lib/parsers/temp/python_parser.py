
import ast
import sys
import json

def extract_symbols(source_code):
    """Extract functions, classes, and module-level variables from Python code"""
    try:
        tree = ast.parse(source_code)
        symbols = []
        
        for node in ast.walk(tree):
            # Extract function definitions
            if isinstance(node, ast.FunctionDef):
                # Skip private functions (starting with _)
                if not node.name.startswith('_'):
                    symbols.append({
                        'name': node.name,
                        'type': 'function',
                        'line': node.lineno
                    })
            
            # Extract class definitions
            elif isinstance(node, ast.ClassDef):
                # Skip private classes (starting with _)
                if not node.name.startswith('_'):
                    symbols.append({
                        'name': node.name,
                        'type': 'class',
                        'line': node.lineno
                    })
            
            # Extract module-level variable assignments
            elif isinstance(node, ast.Assign) and hasattr(node, 'lineno'):
                # Only get top-level assignments (not inside functions/classes)
                if node.col_offset == 0:
                    for target in node.targets:
                        if isinstance(target, ast.Name):
                            # Skip private variables (starting with _)
                            if not target.id.startswith('_'):
                                symbols.append({
                                    'name': target.id,
                                    'type': 'variable',
                                    'line': node.lineno
                                })
        
        return symbols
    
    except SyntaxError as e:
        return []
    except Exception as e:
        return []

if __name__ == '__main__':
    source_code = sys.stdin.read()
    symbols = extract_symbols(source_code)
    print(json.dumps(symbols))
