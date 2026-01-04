# Changelog

All notable changes to this project will be documented in this file.

## v1.0.0 (2026-01-04)

### ✨ Features

- **Core**: Automatic text extraction from JS/TS/JSX/TSX/Vue/HTML files
- **Translation**: Support for multiple translation providers (Google, Baidu, Azure, Youdao)
- **Custom Translation**: Support custom translation functions for integration with any API or local models
- **Code Transformation**: Automatic import injection and text wrapping with i18n functions
- **Interpolation**: Configurable placeholder formats (`{{}}`, `{}`, custom) with named parameter support
- **Key Generation**: 
  - Default mode: `{appName}.{filePath}.{text}`
  - Prefix mode: `{prefix}{counter}`
  - Custom generator function for full flexibility
  - Named parameter inclusion in keys (`key_{param1}_{param2}`)
- **Unified Mode**: Single import and wrapper configuration for all file types
- **Incremental Updates**: Patch directory for tracking newly added translations
- **Warning System**: Detection and logging of complex template strings

### 📦 Package

- `must`: CLI tool, core functionality, and TypeScript type definitions (all-in-one)

### 🔧 Configuration

- Flexible `must.config.js` with full TypeScript support
- Environment variable support for API keys
- Prettier integration for code formatting

### 📝 Documentation

- Comprehensive README with examples
- API documentation for all configuration options

