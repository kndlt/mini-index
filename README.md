# Codebase Index

A CLI tool for quick summarization of JavaScript/TypeScript codebases. Get an instant overview of all files and their exported symbols.

## 🚀 Quick Start

```bash
# Analyze current directory
npx codebase-index .

# Analyze specific directory
npx codebase-index my-project

# Use the simplified command
npx mindex .
```

## 📦 Installation

```bash
# Global installation
npm install -g codebase-index

# Or use directly with npx
npx codebase-index .
```

## ✨ Features

- **📁 Directory Analysis**: Recursively scans JavaScript/TypeScript projects
- **🔍 Symbol Extraction**: Finds all exported functions, classes, types, and interfaces
- **🎯 Multi-Format Support**: JavaScript (ES6/CommonJS), TypeScript, JSX/React
- **🌳 Tree Output**: Clean, readable file structure with exported symbols
- **⚡ Fast & Lightweight**: Quick analysis of entire codebases
- **🛡️ Error Handling**: Graceful handling of parsing errors

## 🎯 Use Cases

- **Code Reviews**: Get a quick overview of what a project exports
- **Documentation**: Generate file structure for documentation
- **Onboarding**: Help new developers understand codebase structure
- **Refactoring**: Identify unused exports and dependencies
- **Architecture**: Visualize project organization

## 📋 Sample Output

```
🔍 Mini-Index: Analyzing /path/to/project

- api/
  - route.ts: POST, GET
- components/
  - ChatInterface.jsx: ChatInterface, ErrorBoundary
  - Footer.jsx: Footer
- lib/
  - types.ts: User, Message, ChatState
  - utils.js: generateId, formatDate
- user.js: getCurrentUser, createUser, updateUser
```

## 🛠️ Supported File Types

| Format | Support Level | Features |
|--------|---------------|----------|
| JavaScript (ES6) | ✅ Full | Named/default exports, arrow functions |
| JavaScript (CommonJS) | ✅ Full | module.exports, exports.* |
| TypeScript | ✅ Enhanced | Interfaces, types, classes, functions |
| JSX/React | ✅ Enhanced | Components, props detection |
| JSON | ✅ Basic | File listing |

## 🎮 CLI Commands

```bash
# Main commands
npx codebase-index [directory]     # Full analysis
npx mindex [directory]         # Simplified command

# Examples
npx mindex .                   # Current directory
npx mindex src                 # Src folder only
npx mindex ../other-project    # Different project
```

## 📚 Programmatic API

```javascript
const { EnhancedAnalyzer } = require('codebase-index');

const analyzer = new EnhancedAnalyzer();
const result = analyzer.analyzeProject('./my-project');
console.log(result);
```

## 🔧 Configuration

Mini-index automatically skips common directories:
- `node_modules/`
- `.git/`
- `.next/`
- `dist/`
- `build/`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🎉 Why Codebase Index?

Perfect for:
- **Tech Leads** reviewing code structure
- **Developers** exploring new codebases
- **Documentation** teams generating overviews
- **Architects** understanding project organization
- **Anyone** who needs a quick "what does this export?" answer

---

**Get started in seconds:** `npx mindex .`
