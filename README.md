# Mini-Index

[![npm version](https://badge.fury.io/js/codebase-index.svg)](https://badge.fury.io/js/codebase-index)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A fast, professional CLI tool for analyzing JavaScript/TypeScript codebases. Get instant overviews of project structure and exported symbols.

## 🚀 Quick Start

```bash
# Analyze current directory
npx mindex .

# Analyze specific directory  
npx mindex my-project

# Multiple output formats
npx mindex . --format json
npx mindex . --verbose
```

Example output:
```
- advanced_python.py: VERSION, DEBUG, StatusEnum, UserData, authenticate_user
- api/
  - route.ts: POST, GET
- components.jsx: ChatInterface, ErrorBoundary, Footer
- types.ts: User, Message, DEFAULT_CONFIG, ChatState
- user.js: generateUserId, getCurrentUser, createUser
```

## 📦 Installation

```bash
# Global installation
npm install -g codebase-index

# Or use directly with npx (recommended)
npx mindex .
```

## ✨ Features

- **📁 Directory Analysis**: Recursively scans JavaScript/TypeScript projects
- **🔍 Symbol Extraction**: Finds all exported functions, classes, types, and interfaces  
- **🎯 Multi-Language Support**: JavaScript, TypeScript, JSX/React, Python
- **📊 Multiple Formats**: Tree view, JSON output, simple listing
- **⚡ Fast Performance**: Quick analysis of entire codebases
- **🛡️ Error Resilient**: Graceful handling of parsing errors

## 🎮 CLI Usage

```bash
# Basic usage
mindex [directory] [options]

# Options
-h, --help      Show help message
-v, --version   Show version information  
-f, --format    Output format (tree, json, simple) [default: tree]
--verbose       Show detailed output

# Examples
mindex                    # Analyze current directory
mindex ./src             # Analyze specific directory
mindex . --format json   # JSON output for programmatic use
mindex . --verbose       # Detailed output with progress
```

## 🛠️ Supported Languages

| Language | Support Level | Features |
|----------|---------------|----------|
| JavaScript (ES6) | ✅ Full | Named/default exports, arrow functions |
| JavaScript (CommonJS) | ✅ Full | module.exports, exports.* |
| TypeScript | ✅ Enhanced | Interfaces, types, classes, functions |
| JSX/React | ✅ Enhanced | Components, props detection |
| Python | ✅ Basic | Functions, classes, variables |

## 📚 Programmatic API

```javascript
const { EnhancedAnalyzer } = require('codebase-index');

const analyzer = new EnhancedAnalyzer();

// Get formatted string output
const result = analyzer.analyzeProject('./my-project');
console.log(result);

// Get structured data
const data = analyzer.analyzeProject('./my-project', { returnObject: true });
console.log(JSON.stringify(data, null, 2));
```

## 🎯 Use Cases

- **Code Reviews**: Quick project structure overview
- **Documentation**: Generate file listings for docs
- **Onboarding**: Help new developers understand codebases
- **Refactoring**: Identify exported symbols and dependencies
- **Architecture**: Visualize project organization

## 🔧 Configuration

Mini-index automatically skips common directories:
- `node_modules/`, `.git/`, `.next/`, `dist/`, `build/`
- `__pycache__/`, `venv/`, `env/`, `.venv/`

## 📊 Output Formats

### Tree Format (Default)
```
- components/
  - Button.tsx: Button, ButtonProps
  - Input.tsx: Input, InputProps
- utils/
  - helpers.js: formatDate, parseQuery
```

### JSON Format
```json
{
  "components/": {
    "Button.tsx": ["Button", "ButtonProps"],
    "Input.tsx": ["Input", "InputProps"]
  },
  "utils/": {
    "helpers.js": ["formatDate", "parseQuery"]
  }
}
```

## 🚀 Performance

- **Fast scanning**: Processes large codebases in seconds
- **Memory efficient**: Minimal memory footprint
- **Error resilient**: Continues analysis even if some files fail to parse

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## Requirements

- Node.js >= 14.0.0
- Python 3.x (for Python file analysis)

---

**Get started in seconds:** `npx mindex .`