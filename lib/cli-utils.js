/**
 * Shared utilities for CLI commands
 */

const path = require('path');
const fs = require('fs');

/**
 * Parse command line arguments
 * @param {string[]} argv - Process argv array
 * @returns {Object} Parsed options
 */
function parseArguments(argv) {
  const args = argv.slice(2);
  const options = {
    targetDir: process.cwd(),
    help: false,
    version: false,
    format: 'tree', // tree, json, simple
    verbose: false
  };

  // Simple argument parsing
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--version' || arg === '-v') {
      options.version = true;
    } else if (arg === '--format' || arg === '-f') {
      options.format = args[++i] || 'tree';
    } else if (arg === '--verbose') {
      options.verbose = true;
    } else if (!arg.startsWith('-')) {
      // First non-flag argument is the target directory
      options.targetDir = path.resolve(arg);
    }
  }

  return options;
}

/**
 * Display help text
 */
function displayHelp() {
  console.log(`
Usage: mindex [directory] [options]

Options:
  -h, --help      Show this help message
  -v, --version   Show version information
  -f, --format    Output format (tree, json, simple) [default: tree]
  --verbose       Show detailed output

Examples:
  mindex                    # Analyze current directory
  mindex ./src             # Analyze specific directory
  mindex . --format json   # Output as JSON
`);
}

/**
 * Handle errors consistently
 * @param {Error} error - The error to handle
 * @param {boolean} verbose - Whether to show stack trace
 */
function handleError(error, verbose = false) {
  console.error(`❌ Error: ${error.message}`);
  
  if (verbose && error.stack) {
    console.error('\nStack trace:');
    console.error(error.stack);
  }
  
  process.exit(1);
}

/**
 * Format analysis output
 * @param {Object|string} result - Analysis result
 * @param {Object} options - Formatting options
 * @param {Object} rawData - Raw data structure (optional)
 */
function formatOutput(result, options = {}, rawData = null) {
  const { format = 'tree' } = options;
  
  if (format === 'json') {
    // For JSON format, use raw data if available
    console.log(JSON.stringify(rawData || result, null, 2));
  } else if (format === 'simple') {
    // Simple format - just list files and exports
    if (typeof result === 'string') {
      // Already formatted as string
      console.log(result);
    } else {
      // Convert object to simple list
      const lines = [];
      const walk = (obj, prefix = '') => {
        for (const [key, value] of Object.entries(obj)) {
          if (key.endsWith('/')) {
            lines.push(`${prefix}${key}`);
            walk(value, prefix + '  ');
          } else {
            const exports = Array.isArray(value) ? value.join(', ') : '';
            lines.push(`${prefix}${key}${exports ? ': ' + exports : ''}`);
          }
        }
      };
      walk(result);
      console.log(lines.join('\n'));
    }
  } else {
    // Default tree format
    if (typeof result === 'string') {
      console.log(result);
    } else {
      // This shouldn't happen with current implementation, but handle it
      console.log(JSON.stringify(result, null, 2));
    }
  }
}

/**
 * Check if directory exists and is accessible
 * @param {string} dirPath - Directory path to check
 * @returns {boolean}
 */
function validateDirectory(dirPath) {
  try {
    const stats = fs.statSync(dirPath);
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
}

/**
 * Get package version
 * @returns {string} Version string
 */
function getVersion() {
  try {
    const packageJson = require('../package.json');
    return packageJson.version || 'unknown';
  } catch {
    return 'unknown';
  }
}

module.exports = {
  parseArguments,
  displayHelp,
  handleError,
  formatOutput,
  validateDirectory,
  getVersion
};