# Changelog

All notable changes to this project will be documented in this file.

## v1.1.1...main

[compare changes](https://github.com/wzc520pyfm/must/compare/v1.1.1...main)

### 🏡 Chore

- Bump version of must package to 1.6.0 ([7ccae37](https://github.com/wzc520pyfm/must/commit/7ccae37))
- Update release scripts to streamline the release process and add a new publish command for the must package ([204749e](https://github.com/wzc520pyfm/must/commit/204749e))

### ❤️ Contributors

- Wzc520pyfm ([@wzc520pyfm](https://github.com/wzc520pyfm))

## v1.1.1

[compare changes](https://github.com/wzc520pyfm/must/compare/v1.1.0...v1.1.1)

### 🏡 Chore

- Update release scripts to push tags after publishing and bump version of must package to 1.5.0 ([4e979eb](https://github.com/wzc520pyfm/must/commit/4e979eb))

### ❤️ Contributors

- Wzc520pyfm ([@wzc520pyfm](https://github.com/wzc520pyfm))

## v1.1.0


### 🚀 Enhancements

- Init ([11f2be0](https://github.com/wzc520pyfm/must/commit/11f2be0))
- Add initial implementation of Must internationalization tool with configuration, extraction, and translation features ([645ed7c](https://github.com/wzc520pyfm/must/commit/645ed7c))
- Restructure project into monorepo, add migration guide, and update configuration for improved internationalization tool ([0874600](https://github.com/wzc520pyfm/must/commit/0874600))
- Add comprehensive QUICK_START guide and enhance AutoI18n with existing key management and patch file generation ([3179b71](https://github.com/wzc520pyfm/must/commit/3179b71))
- Enhance AutoI18n with code transformation capabilities and add usage guide for improved internationalization workflow ([7d8d5e6](https://github.com/wzc520pyfm/must/commit/7d8d5e6))
- Integrate dotenv for API configuration and update AutoI18n patch file generation logic ([4104146](https://github.com/wzc520pyfm/must/commit/4104146))
- Enhance internationalization support by integrating i18next and adding language switcher functionality ([2a3b58f](https://github.com/wzc520pyfm/must/commit/2a3b58f))
- Enhance AutoI18n with code formatting capabilities, add max key length configuration, and integrate Prettier for improved code quality ([138acbf](https://github.com/wzc520pyfm/must/commit/138acbf))
- Add language switcher functionality to App component for enhanced internationalization support ([b65429b](https://github.com/wzc520pyfm/must/commit/b65429b))
- Integrate i18next for internationalization and update App component to support dynamic language switching ([5c1e499](https://github.com/wzc520pyfm/must/commit/5c1e499))
- Enhance text validation in BaseExtractor to support Chinese characters and improve template handling in JavaScriptExtractor ([c825649](https://github.com/wzc520pyfm/must/commit/c825649))
- Enhance TextExtractor and BaseExtractor to support source language filtering for text extraction, and update import configuration for improved context injection ([210ffc8](https://github.com/wzc520pyfm/must/commit/210ffc8))
- Improve CodeTransformer to handle useTranslation updates and enhance context injection for better internationalization support ([d7528dd](https://github.com/wzc520pyfm/must/commit/d7528dd))
- Enhance JavaScriptExtractor and CodeTransformer to support JSX element merging and improve translation handling for mixed content ([8ff2e13](https://github.com/wzc520pyfm/must/commit/8ff2e13))
- Extend CodeTransformer to support static file handling with i18n integration and enhance import configuration for better translation management ([f30ca30](https://github.com/wzc520pyfm/must/commit/f30ca30))
- Add support for custom wrapper functions in CodeTransformer and enhance import configuration for static files ([6bf2bc6](https://github.com/wzc520pyfm/must/commit/6bf2bc6))
- Update import paths for localization utility and enhance getLocal function to support default values ([fb3dda9](https://github.com/wzc520pyfm/must/commit/fb3dda9))
- Update tsconfig to include baseUrl and paths for improved module resolution ([7a5b77e](https://github.com/wzc520pyfm/must/commit/7a5b77e))
- Introduce interpolation configuration for dynamic placeholder handling in i18n extraction and translation processes ([e1b4311](https://github.com/wzc520pyfm/must/commit/e1b4311))
- Update regex in InterpolationHandler to support multiple XML tag formats for improved translation handling ([c835255](https://github.com/wzc520pyfm/must/commit/c835255))
- Enhance interpolation configuration in must.config.js to support dynamic placeholder formats and improve translation handling ([79e8608](https://github.com/wzc520pyfm/must/commit/79e8608))
- Add unified import and wrapper configuration to CodeTransformer for consistent translation handling across files ([e3023bd](https://github.com/wzc520pyfm/must/commit/e3023bd))
- Add playground-unified with unified i18n configuration and dependencies for consistent translation handling ([03d27fb](https://github.com/wzc520pyfm/must/commit/03d27fb))
- Update wrapper configuration in must.config.js to support dynamic text interpolation for improved translation handling ([8e4d637](https://github.com/wzc520pyfm/must/commit/8e4d637))
- Enhance AutoI18n and extractors to support named parameters and improved key generation for dynamic text interpolation ([266ec0e](https://github.com/wzc520pyfm/must/commit/266ec0e))
- Enhance key generation in AutoI18n with new configuration options for custom prefixes and counter management ([4c8548a](https://github.com/wzc520pyfm/must/commit/4c8548a))
- Revamp README.md to enhance project description, installation instructions, and feature highlights for the AutoI18n tool ([87e6ebb](https://github.com/wzc520pyfm/must/commit/87e6ebb))
- Enhance key generation in AutoI18n to support named parameters in keys, updating README and configuration examples for clarity ([a4ba015](https://github.com/wzc520pyfm/must/commit/a4ba015))
- Introduce custom translation functionality with support for user-defined translation functions, enhancing flexibility in translation services ([fe3c8e1](https://github.com/wzc520pyfm/must/commit/fe3c8e1))
- Implement extraction warnings for complex template strings and expressions, enhancing error handling and logging in AutoI18n ([2479030](https://github.com/wzc520pyfm/must/commit/2479030))
- Add changelog and configuration for automated changelog generation, enhancing project documentation and release management ([59dbdef](https://github.com/wzc520pyfm/must/commit/59dbdef))

### 🩹 Fixes

- Update config loading to support both JavaScript and TypeScript files; add new must.config.js example ([7f84bc0](https://github.com/wzc520pyfm/must/commit/7f84bc0))
- Update language state initialization in App component to use a direct string instead of translation function ([33c9c2c](https://github.com/wzc520pyfm/must/commit/33c9c2c))
- Update release scripts in package.json to include publishing step with public access, streamlining the release process ([132a97a](https://github.com/wzc520pyfm/must/commit/132a97a))

### 💅 Refactors

- Clean up whitespace in CodeTransformer for improved readability and maintainability ([50ff673](https://github.com/wzc520pyfm/must/commit/50ff673))

### 🏡 Chore

- Update .gitignore to exclude build artifacts and add pnpm lockfile; modify tsconfig for packages to include references and baseUrl ([13faae6](https://github.com/wzc520pyfm/must/commit/13faae6))
- Remove outdated documentation files including EXAMPLES.md, MIGRATION.md, PROJECT_SUMMARY.md, PUBLISH.md, QUICK_START.md, QUICKSTART.md, and USAGE_GUIDE.md to streamline project structure ([2a4cca9](https://github.com/wzc520pyfm/must/commit/2a4cca9))
- Clean project ([5aae370](https://github.com/wzc520pyfm/must/commit/5aae370))
- Update dependencies in pnpm-lock.yaml to latest versions for improved stability and performance ([b18e211](https://github.com/wzc520pyfm/must/commit/b18e211))
- Add playground-unified i18n directory to .gitignore for improved project structure ([83cc25c](https://github.com/wzc520pyfm/must/commit/83cc25c))
- Update release scripts in package.json to ensure proper build process before publishing, and bump version of must package to 1.3.0 ([3465377](https://github.com/wzc520pyfm/must/commit/3465377))
- Bump version of must package to 1.4.0 ([5e605e4](https://github.com/wzc520pyfm/must/commit/5e605e4))

### ❤️ Contributors

- Wzc520pyfm ([@wzc520pyfm](https://github.com/wzc520pyfm))

## ...main


### 🚀 Enhancements

- Init ([11f2be0](https://github.com/wzc520pyfm/must/commit/11f2be0))
- Add initial implementation of Must internationalization tool with configuration, extraction, and translation features ([645ed7c](https://github.com/wzc520pyfm/must/commit/645ed7c))
- Restructure project into monorepo, add migration guide, and update configuration for improved internationalization tool ([0874600](https://github.com/wzc520pyfm/must/commit/0874600))
- Add comprehensive QUICK_START guide and enhance AutoI18n with existing key management and patch file generation ([3179b71](https://github.com/wzc520pyfm/must/commit/3179b71))
- Enhance AutoI18n with code transformation capabilities and add usage guide for improved internationalization workflow ([7d8d5e6](https://github.com/wzc520pyfm/must/commit/7d8d5e6))
- Integrate dotenv for API configuration and update AutoI18n patch file generation logic ([4104146](https://github.com/wzc520pyfm/must/commit/4104146))
- Enhance internationalization support by integrating i18next and adding language switcher functionality ([2a3b58f](https://github.com/wzc520pyfm/must/commit/2a3b58f))
- Enhance AutoI18n with code formatting capabilities, add max key length configuration, and integrate Prettier for improved code quality ([138acbf](https://github.com/wzc520pyfm/must/commit/138acbf))
- Add language switcher functionality to App component for enhanced internationalization support ([b65429b](https://github.com/wzc520pyfm/must/commit/b65429b))
- Integrate i18next for internationalization and update App component to support dynamic language switching ([5c1e499](https://github.com/wzc520pyfm/must/commit/5c1e499))
- Enhance text validation in BaseExtractor to support Chinese characters and improve template handling in JavaScriptExtractor ([c825649](https://github.com/wzc520pyfm/must/commit/c825649))
- Enhance TextExtractor and BaseExtractor to support source language filtering for text extraction, and update import configuration for improved context injection ([210ffc8](https://github.com/wzc520pyfm/must/commit/210ffc8))
- Improve CodeTransformer to handle useTranslation updates and enhance context injection for better internationalization support ([d7528dd](https://github.com/wzc520pyfm/must/commit/d7528dd))
- Enhance JavaScriptExtractor and CodeTransformer to support JSX element merging and improve translation handling for mixed content ([8ff2e13](https://github.com/wzc520pyfm/must/commit/8ff2e13))
- Extend CodeTransformer to support static file handling with i18n integration and enhance import configuration for better translation management ([f30ca30](https://github.com/wzc520pyfm/must/commit/f30ca30))
- Add support for custom wrapper functions in CodeTransformer and enhance import configuration for static files ([6bf2bc6](https://github.com/wzc520pyfm/must/commit/6bf2bc6))
- Update import paths for localization utility and enhance getLocal function to support default values ([fb3dda9](https://github.com/wzc520pyfm/must/commit/fb3dda9))
- Update tsconfig to include baseUrl and paths for improved module resolution ([7a5b77e](https://github.com/wzc520pyfm/must/commit/7a5b77e))
- Introduce interpolation configuration for dynamic placeholder handling in i18n extraction and translation processes ([e1b4311](https://github.com/wzc520pyfm/must/commit/e1b4311))
- Update regex in InterpolationHandler to support multiple XML tag formats for improved translation handling ([c835255](https://github.com/wzc520pyfm/must/commit/c835255))
- Enhance interpolation configuration in must.config.js to support dynamic placeholder formats and improve translation handling ([79e8608](https://github.com/wzc520pyfm/must/commit/79e8608))
- Add unified import and wrapper configuration to CodeTransformer for consistent translation handling across files ([e3023bd](https://github.com/wzc520pyfm/must/commit/e3023bd))
- Add playground-unified with unified i18n configuration and dependencies for consistent translation handling ([03d27fb](https://github.com/wzc520pyfm/must/commit/03d27fb))
- Update wrapper configuration in must.config.js to support dynamic text interpolation for improved translation handling ([8e4d637](https://github.com/wzc520pyfm/must/commit/8e4d637))
- Enhance AutoI18n and extractors to support named parameters and improved key generation for dynamic text interpolation ([266ec0e](https://github.com/wzc520pyfm/must/commit/266ec0e))
- Enhance key generation in AutoI18n with new configuration options for custom prefixes and counter management ([4c8548a](https://github.com/wzc520pyfm/must/commit/4c8548a))
- Revamp README.md to enhance project description, installation instructions, and feature highlights for the AutoI18n tool ([87e6ebb](https://github.com/wzc520pyfm/must/commit/87e6ebb))
- Enhance key generation in AutoI18n to support named parameters in keys, updating README and configuration examples for clarity ([a4ba015](https://github.com/wzc520pyfm/must/commit/a4ba015))
- Introduce custom translation functionality with support for user-defined translation functions, enhancing flexibility in translation services ([fe3c8e1](https://github.com/wzc520pyfm/must/commit/fe3c8e1))
- Implement extraction warnings for complex template strings and expressions, enhancing error handling and logging in AutoI18n ([2479030](https://github.com/wzc520pyfm/must/commit/2479030))
- Add changelog and configuration for automated changelog generation, enhancing project documentation and release management ([59dbdef](https://github.com/wzc520pyfm/must/commit/59dbdef))

### 🩹 Fixes

- Update config loading to support both JavaScript and TypeScript files; add new must.config.js example ([7f84bc0](https://github.com/wzc520pyfm/must/commit/7f84bc0))
- Update language state initialization in App component to use a direct string instead of translation function ([33c9c2c](https://github.com/wzc520pyfm/must/commit/33c9c2c))
- Update release scripts in package.json to include publishing step with public access, streamlining the release process ([132a97a](https://github.com/wzc520pyfm/must/commit/132a97a))

### 💅 Refactors

- Clean up whitespace in CodeTransformer for improved readability and maintainability ([50ff673](https://github.com/wzc520pyfm/must/commit/50ff673))

### 🏡 Chore

- Update .gitignore to exclude build artifacts and add pnpm lockfile; modify tsconfig for packages to include references and baseUrl ([13faae6](https://github.com/wzc520pyfm/must/commit/13faae6))
- Remove outdated documentation files including EXAMPLES.md, MIGRATION.md, PROJECT_SUMMARY.md, PUBLISH.md, QUICK_START.md, QUICKSTART.md, and USAGE_GUIDE.md to streamline project structure ([2a4cca9](https://github.com/wzc520pyfm/must/commit/2a4cca9))
- Clean project ([5aae370](https://github.com/wzc520pyfm/must/commit/5aae370))
- Update dependencies in pnpm-lock.yaml to latest versions for improved stability and performance ([b18e211](https://github.com/wzc520pyfm/must/commit/b18e211))
- Add playground-unified i18n directory to .gitignore for improved project structure ([83cc25c](https://github.com/wzc520pyfm/must/commit/83cc25c))
- Update release scripts in package.json to ensure proper build process before publishing, and bump version of must package to 1.3.0 ([3465377](https://github.com/wzc520pyfm/must/commit/3465377))

### ❤️ Contributors

- Wzc520pyfm ([@wzc520pyfm](https://github.com/wzc520pyfm))

## ...main


### 🚀 Enhancements

- Init ([11f2be0](https://github.com/wzc520pyfm/must/commit/11f2be0))
- Add initial implementation of Must internationalization tool with configuration, extraction, and translation features ([645ed7c](https://github.com/wzc520pyfm/must/commit/645ed7c))
- Restructure project into monorepo, add migration guide, and update configuration for improved internationalization tool ([0874600](https://github.com/wzc520pyfm/must/commit/0874600))
- Add comprehensive QUICK_START guide and enhance AutoI18n with existing key management and patch file generation ([3179b71](https://github.com/wzc520pyfm/must/commit/3179b71))
- Enhance AutoI18n with code transformation capabilities and add usage guide for improved internationalization workflow ([7d8d5e6](https://github.com/wzc520pyfm/must/commit/7d8d5e6))
- Integrate dotenv for API configuration and update AutoI18n patch file generation logic ([4104146](https://github.com/wzc520pyfm/must/commit/4104146))
- Enhance internationalization support by integrating i18next and adding language switcher functionality ([2a3b58f](https://github.com/wzc520pyfm/must/commit/2a3b58f))
- Enhance AutoI18n with code formatting capabilities, add max key length configuration, and integrate Prettier for improved code quality ([138acbf](https://github.com/wzc520pyfm/must/commit/138acbf))
- Add language switcher functionality to App component for enhanced internationalization support ([b65429b](https://github.com/wzc520pyfm/must/commit/b65429b))
- Integrate i18next for internationalization and update App component to support dynamic language switching ([5c1e499](https://github.com/wzc520pyfm/must/commit/5c1e499))
- Enhance text validation in BaseExtractor to support Chinese characters and improve template handling in JavaScriptExtractor ([c825649](https://github.com/wzc520pyfm/must/commit/c825649))
- Enhance TextExtractor and BaseExtractor to support source language filtering for text extraction, and update import configuration for improved context injection ([210ffc8](https://github.com/wzc520pyfm/must/commit/210ffc8))
- Improve CodeTransformer to handle useTranslation updates and enhance context injection for better internationalization support ([d7528dd](https://github.com/wzc520pyfm/must/commit/d7528dd))
- Enhance JavaScriptExtractor and CodeTransformer to support JSX element merging and improve translation handling for mixed content ([8ff2e13](https://github.com/wzc520pyfm/must/commit/8ff2e13))
- Extend CodeTransformer to support static file handling with i18n integration and enhance import configuration for better translation management ([f30ca30](https://github.com/wzc520pyfm/must/commit/f30ca30))
- Add support for custom wrapper functions in CodeTransformer and enhance import configuration for static files ([6bf2bc6](https://github.com/wzc520pyfm/must/commit/6bf2bc6))
- Update import paths for localization utility and enhance getLocal function to support default values ([fb3dda9](https://github.com/wzc520pyfm/must/commit/fb3dda9))
- Update tsconfig to include baseUrl and paths for improved module resolution ([7a5b77e](https://github.com/wzc520pyfm/must/commit/7a5b77e))
- Introduce interpolation configuration for dynamic placeholder handling in i18n extraction and translation processes ([e1b4311](https://github.com/wzc520pyfm/must/commit/e1b4311))
- Update regex in InterpolationHandler to support multiple XML tag formats for improved translation handling ([c835255](https://github.com/wzc520pyfm/must/commit/c835255))
- Enhance interpolation configuration in must.config.js to support dynamic placeholder formats and improve translation handling ([79e8608](https://github.com/wzc520pyfm/must/commit/79e8608))
- Add unified import and wrapper configuration to CodeTransformer for consistent translation handling across files ([e3023bd](https://github.com/wzc520pyfm/must/commit/e3023bd))
- Add playground-unified with unified i18n configuration and dependencies for consistent translation handling ([03d27fb](https://github.com/wzc520pyfm/must/commit/03d27fb))
- Update wrapper configuration in must.config.js to support dynamic text interpolation for improved translation handling ([8e4d637](https://github.com/wzc520pyfm/must/commit/8e4d637))
- Enhance AutoI18n and extractors to support named parameters and improved key generation for dynamic text interpolation ([266ec0e](https://github.com/wzc520pyfm/must/commit/266ec0e))
- Enhance key generation in AutoI18n with new configuration options for custom prefixes and counter management ([4c8548a](https://github.com/wzc520pyfm/must/commit/4c8548a))
- Revamp README.md to enhance project description, installation instructions, and feature highlights for the AutoI18n tool ([87e6ebb](https://github.com/wzc520pyfm/must/commit/87e6ebb))
- Enhance key generation in AutoI18n to support named parameters in keys, updating README and configuration examples for clarity ([a4ba015](https://github.com/wzc520pyfm/must/commit/a4ba015))
- Introduce custom translation functionality with support for user-defined translation functions, enhancing flexibility in translation services ([fe3c8e1](https://github.com/wzc520pyfm/must/commit/fe3c8e1))
- Implement extraction warnings for complex template strings and expressions, enhancing error handling and logging in AutoI18n ([2479030](https://github.com/wzc520pyfm/must/commit/2479030))
- Add changelog and configuration for automated changelog generation, enhancing project documentation and release management ([59dbdef](https://github.com/wzc520pyfm/must/commit/59dbdef))

### 🩹 Fixes

- Update config loading to support both JavaScript and TypeScript files; add new must.config.js example ([7f84bc0](https://github.com/wzc520pyfm/must/commit/7f84bc0))
- Update language state initialization in App component to use a direct string instead of translation function ([33c9c2c](https://github.com/wzc520pyfm/must/commit/33c9c2c))
- Update release scripts in package.json to include publishing step with public access, streamlining the release process ([132a97a](https://github.com/wzc520pyfm/must/commit/132a97a))

### 💅 Refactors

- Clean up whitespace in CodeTransformer for improved readability and maintainability ([50ff673](https://github.com/wzc520pyfm/must/commit/50ff673))

### 🏡 Chore

- Update .gitignore to exclude build artifacts and add pnpm lockfile; modify tsconfig for packages to include references and baseUrl ([13faae6](https://github.com/wzc520pyfm/must/commit/13faae6))
- Remove outdated documentation files including EXAMPLES.md, MIGRATION.md, PROJECT_SUMMARY.md, PUBLISH.md, QUICK_START.md, QUICKSTART.md, and USAGE_GUIDE.md to streamline project structure ([2a4cca9](https://github.com/wzc520pyfm/must/commit/2a4cca9))
- Clean project ([5aae370](https://github.com/wzc520pyfm/must/commit/5aae370))
- Update dependencies in pnpm-lock.yaml to latest versions for improved stability and performance ([b18e211](https://github.com/wzc520pyfm/must/commit/b18e211))
- Add playground-unified i18n directory to .gitignore for improved project structure ([83cc25c](https://github.com/wzc520pyfm/must/commit/83cc25c))

### ❤️ Contributors

- Wzc520pyfm ([@wzc520pyfm](https://github.com/wzc520pyfm))

## ...main


### 🚀 Enhancements

- Init ([11f2be0](https://github.com/wzc520pyfm/must/commit/11f2be0))
- Add initial implementation of Must internationalization tool with configuration, extraction, and translation features ([645ed7c](https://github.com/wzc520pyfm/must/commit/645ed7c))
- Restructure project into monorepo, add migration guide, and update configuration for improved internationalization tool ([0874600](https://github.com/wzc520pyfm/must/commit/0874600))
- Add comprehensive QUICK_START guide and enhance AutoI18n with existing key management and patch file generation ([3179b71](https://github.com/wzc520pyfm/must/commit/3179b71))
- Enhance AutoI18n with code transformation capabilities and add usage guide for improved internationalization workflow ([7d8d5e6](https://github.com/wzc520pyfm/must/commit/7d8d5e6))
- Integrate dotenv for API configuration and update AutoI18n patch file generation logic ([4104146](https://github.com/wzc520pyfm/must/commit/4104146))
- Enhance internationalization support by integrating i18next and adding language switcher functionality ([2a3b58f](https://github.com/wzc520pyfm/must/commit/2a3b58f))
- Enhance AutoI18n with code formatting capabilities, add max key length configuration, and integrate Prettier for improved code quality ([138acbf](https://github.com/wzc520pyfm/must/commit/138acbf))
- Add language switcher functionality to App component for enhanced internationalization support ([b65429b](https://github.com/wzc520pyfm/must/commit/b65429b))
- Integrate i18next for internationalization and update App component to support dynamic language switching ([5c1e499](https://github.com/wzc520pyfm/must/commit/5c1e499))
- Enhance text validation in BaseExtractor to support Chinese characters and improve template handling in JavaScriptExtractor ([c825649](https://github.com/wzc520pyfm/must/commit/c825649))
- Enhance TextExtractor and BaseExtractor to support source language filtering for text extraction, and update import configuration for improved context injection ([210ffc8](https://github.com/wzc520pyfm/must/commit/210ffc8))
- Improve CodeTransformer to handle useTranslation updates and enhance context injection for better internationalization support ([d7528dd](https://github.com/wzc520pyfm/must/commit/d7528dd))
- Enhance JavaScriptExtractor and CodeTransformer to support JSX element merging and improve translation handling for mixed content ([8ff2e13](https://github.com/wzc520pyfm/must/commit/8ff2e13))
- Extend CodeTransformer to support static file handling with i18n integration and enhance import configuration for better translation management ([f30ca30](https://github.com/wzc520pyfm/must/commit/f30ca30))
- Add support for custom wrapper functions in CodeTransformer and enhance import configuration for static files ([6bf2bc6](https://github.com/wzc520pyfm/must/commit/6bf2bc6))
- Update import paths for localization utility and enhance getLocal function to support default values ([fb3dda9](https://github.com/wzc520pyfm/must/commit/fb3dda9))
- Update tsconfig to include baseUrl and paths for improved module resolution ([7a5b77e](https://github.com/wzc520pyfm/must/commit/7a5b77e))
- Introduce interpolation configuration for dynamic placeholder handling in i18n extraction and translation processes ([e1b4311](https://github.com/wzc520pyfm/must/commit/e1b4311))
- Update regex in InterpolationHandler to support multiple XML tag formats for improved translation handling ([c835255](https://github.com/wzc520pyfm/must/commit/c835255))
- Enhance interpolation configuration in must.config.js to support dynamic placeholder formats and improve translation handling ([79e8608](https://github.com/wzc520pyfm/must/commit/79e8608))
- Add unified import and wrapper configuration to CodeTransformer for consistent translation handling across files ([e3023bd](https://github.com/wzc520pyfm/must/commit/e3023bd))
- Add playground-unified with unified i18n configuration and dependencies for consistent translation handling ([03d27fb](https://github.com/wzc520pyfm/must/commit/03d27fb))
- Update wrapper configuration in must.config.js to support dynamic text interpolation for improved translation handling ([8e4d637](https://github.com/wzc520pyfm/must/commit/8e4d637))
- Enhance AutoI18n and extractors to support named parameters and improved key generation for dynamic text interpolation ([266ec0e](https://github.com/wzc520pyfm/must/commit/266ec0e))
- Enhance key generation in AutoI18n with new configuration options for custom prefixes and counter management ([4c8548a](https://github.com/wzc520pyfm/must/commit/4c8548a))
- Revamp README.md to enhance project description, installation instructions, and feature highlights for the AutoI18n tool ([87e6ebb](https://github.com/wzc520pyfm/must/commit/87e6ebb))
- Enhance key generation in AutoI18n to support named parameters in keys, updating README and configuration examples for clarity ([a4ba015](https://github.com/wzc520pyfm/must/commit/a4ba015))
- Introduce custom translation functionality with support for user-defined translation functions, enhancing flexibility in translation services ([fe3c8e1](https://github.com/wzc520pyfm/must/commit/fe3c8e1))
- Implement extraction warnings for complex template strings and expressions, enhancing error handling and logging in AutoI18n ([2479030](https://github.com/wzc520pyfm/must/commit/2479030))
- Add changelog and configuration for automated changelog generation, enhancing project documentation and release management ([59dbdef](https://github.com/wzc520pyfm/must/commit/59dbdef))

### 🩹 Fixes

- Update config loading to support both JavaScript and TypeScript files; add new must.config.js example ([7f84bc0](https://github.com/wzc520pyfm/must/commit/7f84bc0))
- Update language state initialization in App component to use a direct string instead of translation function ([33c9c2c](https://github.com/wzc520pyfm/must/commit/33c9c2c))
- Update release scripts in package.json to include publishing step with public access, streamlining the release process ([132a97a](https://github.com/wzc520pyfm/must/commit/132a97a))

### 💅 Refactors

- Clean up whitespace in CodeTransformer for improved readability and maintainability ([50ff673](https://github.com/wzc520pyfm/must/commit/50ff673))

### 🏡 Chore

- Update .gitignore to exclude build artifacts and add pnpm lockfile; modify tsconfig for packages to include references and baseUrl ([13faae6](https://github.com/wzc520pyfm/must/commit/13faae6))
- Remove outdated documentation files including EXAMPLES.md, MIGRATION.md, PROJECT_SUMMARY.md, PUBLISH.md, QUICK_START.md, QUICKSTART.md, and USAGE_GUIDE.md to streamline project structure ([2a4cca9](https://github.com/wzc520pyfm/must/commit/2a4cca9))
- Clean project ([5aae370](https://github.com/wzc520pyfm/must/commit/5aae370))
- Update dependencies in pnpm-lock.yaml to latest versions for improved stability and performance ([b18e211](https://github.com/wzc520pyfm/must/commit/b18e211))
- Add playground-unified i18n directory to .gitignore for improved project structure ([83cc25c](https://github.com/wzc520pyfm/must/commit/83cc25c))

### ❤️ Contributors

- Wzc520pyfm ([@wzc520pyfm](https://github.com/wzc520pyfm))

## ...main


### 🚀 Enhancements

- Init ([11f2be0](https://github.com/wzc520pyfm/must/commit/11f2be0))
- Add initial implementation of Must internationalization tool with configuration, extraction, and translation features ([645ed7c](https://github.com/wzc520pyfm/must/commit/645ed7c))
- Restructure project into monorepo, add migration guide, and update configuration for improved internationalization tool ([0874600](https://github.com/wzc520pyfm/must/commit/0874600))
- Add comprehensive QUICK_START guide and enhance AutoI18n with existing key management and patch file generation ([3179b71](https://github.com/wzc520pyfm/must/commit/3179b71))
- Enhance AutoI18n with code transformation capabilities and add usage guide for improved internationalization workflow ([7d8d5e6](https://github.com/wzc520pyfm/must/commit/7d8d5e6))
- Integrate dotenv for API configuration and update AutoI18n patch file generation logic ([4104146](https://github.com/wzc520pyfm/must/commit/4104146))
- Enhance internationalization support by integrating i18next and adding language switcher functionality ([2a3b58f](https://github.com/wzc520pyfm/must/commit/2a3b58f))
- Enhance AutoI18n with code formatting capabilities, add max key length configuration, and integrate Prettier for improved code quality ([138acbf](https://github.com/wzc520pyfm/must/commit/138acbf))
- Add language switcher functionality to App component for enhanced internationalization support ([b65429b](https://github.com/wzc520pyfm/must/commit/b65429b))
- Integrate i18next for internationalization and update App component to support dynamic language switching ([5c1e499](https://github.com/wzc520pyfm/must/commit/5c1e499))
- Enhance text validation in BaseExtractor to support Chinese characters and improve template handling in JavaScriptExtractor ([c825649](https://github.com/wzc520pyfm/must/commit/c825649))
- Enhance TextExtractor and BaseExtractor to support source language filtering for text extraction, and update import configuration for improved context injection ([210ffc8](https://github.com/wzc520pyfm/must/commit/210ffc8))
- Improve CodeTransformer to handle useTranslation updates and enhance context injection for better internationalization support ([d7528dd](https://github.com/wzc520pyfm/must/commit/d7528dd))
- Enhance JavaScriptExtractor and CodeTransformer to support JSX element merging and improve translation handling for mixed content ([8ff2e13](https://github.com/wzc520pyfm/must/commit/8ff2e13))
- Extend CodeTransformer to support static file handling with i18n integration and enhance import configuration for better translation management ([f30ca30](https://github.com/wzc520pyfm/must/commit/f30ca30))
- Add support for custom wrapper functions in CodeTransformer and enhance import configuration for static files ([6bf2bc6](https://github.com/wzc520pyfm/must/commit/6bf2bc6))
- Update import paths for localization utility and enhance getLocal function to support default values ([fb3dda9](https://github.com/wzc520pyfm/must/commit/fb3dda9))
- Update tsconfig to include baseUrl and paths for improved module resolution ([7a5b77e](https://github.com/wzc520pyfm/must/commit/7a5b77e))
- Introduce interpolation configuration for dynamic placeholder handling in i18n extraction and translation processes ([e1b4311](https://github.com/wzc520pyfm/must/commit/e1b4311))
- Update regex in InterpolationHandler to support multiple XML tag formats for improved translation handling ([c835255](https://github.com/wzc520pyfm/must/commit/c835255))
- Enhance interpolation configuration in must.config.js to support dynamic placeholder formats and improve translation handling ([79e8608](https://github.com/wzc520pyfm/must/commit/79e8608))
- Add unified import and wrapper configuration to CodeTransformer for consistent translation handling across files ([e3023bd](https://github.com/wzc520pyfm/must/commit/e3023bd))
- Add playground-unified with unified i18n configuration and dependencies for consistent translation handling ([03d27fb](https://github.com/wzc520pyfm/must/commit/03d27fb))
- Update wrapper configuration in must.config.js to support dynamic text interpolation for improved translation handling ([8e4d637](https://github.com/wzc520pyfm/must/commit/8e4d637))
- Enhance AutoI18n and extractors to support named parameters and improved key generation for dynamic text interpolation ([266ec0e](https://github.com/wzc520pyfm/must/commit/266ec0e))
- Enhance key generation in AutoI18n with new configuration options for custom prefixes and counter management ([4c8548a](https://github.com/wzc520pyfm/must/commit/4c8548a))
- Revamp README.md to enhance project description, installation instructions, and feature highlights for the AutoI18n tool ([87e6ebb](https://github.com/wzc520pyfm/must/commit/87e6ebb))
- Enhance key generation in AutoI18n to support named parameters in keys, updating README and configuration examples for clarity ([a4ba015](https://github.com/wzc520pyfm/must/commit/a4ba015))
- Introduce custom translation functionality with support for user-defined translation functions, enhancing flexibility in translation services ([fe3c8e1](https://github.com/wzc520pyfm/must/commit/fe3c8e1))
- Implement extraction warnings for complex template strings and expressions, enhancing error handling and logging in AutoI18n ([2479030](https://github.com/wzc520pyfm/must/commit/2479030))
- Add changelog and configuration for automated changelog generation, enhancing project documentation and release management ([59dbdef](https://github.com/wzc520pyfm/must/commit/59dbdef))

### 🩹 Fixes

- Update config loading to support both JavaScript and TypeScript files; add new must.config.js example ([7f84bc0](https://github.com/wzc520pyfm/must/commit/7f84bc0))
- Update language state initialization in App component to use a direct string instead of translation function ([33c9c2c](https://github.com/wzc520pyfm/must/commit/33c9c2c))

### 💅 Refactors

- Clean up whitespace in CodeTransformer for improved readability and maintainability ([50ff673](https://github.com/wzc520pyfm/must/commit/50ff673))

### 🏡 Chore

- Update .gitignore to exclude build artifacts and add pnpm lockfile; modify tsconfig for packages to include references and baseUrl ([13faae6](https://github.com/wzc520pyfm/must/commit/13faae6))
- Remove outdated documentation files including EXAMPLES.md, MIGRATION.md, PROJECT_SUMMARY.md, PUBLISH.md, QUICK_START.md, QUICKSTART.md, and USAGE_GUIDE.md to streamline project structure ([2a4cca9](https://github.com/wzc520pyfm/must/commit/2a4cca9))
- Clean project ([5aae370](https://github.com/wzc520pyfm/must/commit/5aae370))
- Update dependencies in pnpm-lock.yaml to latest versions for improved stability and performance ([b18e211](https://github.com/wzc520pyfm/must/commit/b18e211))
- Add playground-unified i18n directory to .gitignore for improved project structure ([83cc25c](https://github.com/wzc520pyfm/must/commit/83cc25c))

### ❤️ Contributors

- Wzc520pyfm ([@wzc520pyfm](https://github.com/wzc520pyfm))

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

