import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { I18nConfig } from '@must/types';
import { pathToFileURL } from 'url';

const DEFAULT_CONFIG: Partial<I18nConfig> = {
  sourceLanguage: 'en',
  targetLanguages: ['zh-CN'],
  translationProvider: 'google',
  outputDir: 'i18n/strings',
  inputPatterns: [
    '**/*.js',
    '**/*.jsx',
    '**/*.ts',
    '**/*.tsx',
    '**/*.vue',
    '**/*.html'
  ],
  excludePatterns: [
    'node_modules/**',
    'dist/**',
    'build/**',
    '**/*.test.*',
    '**/*.spec.*'
  ]
};

export class ConfigManager {
  private config: I18nConfig;

  constructor(configPath?: string) {
    this.config = this.loadConfig(configPath);
  }

  private loadConfig(configPath?: string): I18nConfig {
    const configFile = configPath || this.findConfigFile();
    
    if (configFile && existsSync(configFile)) {
      try {
        // Handle TypeScript config files
        if (configFile.endsWith('.ts')) {
          return this.loadTsConfig(configFile);
        }
        
        // Handle JSON config files
        const userConfig = JSON.parse(readFileSync(configFile, 'utf-8'));
        return { ...DEFAULT_CONFIG, ...userConfig } as I18nConfig;
      } catch (error) {
        console.warn(`Failed to load config from ${configFile}:`, error);
      }
    }

    return DEFAULT_CONFIG as I18nConfig;
  }

  private loadTsConfig(filePath: string): I18nConfig {
    try {
      // Use dynamic import to load TypeScript config
      // This requires the file to be transpiled first or use tsx
      const absolutePath = require.resolve(filePath, { paths: [process.cwd()] });
      delete require.cache[absolutePath];
      const config = require(absolutePath);
      const userConfig = config.default || config;
      return { ...DEFAULT_CONFIG, ...userConfig } as I18nConfig;
    } catch (error) {
      console.warn(`Failed to load TypeScript config:`, error);
      return DEFAULT_CONFIG as I18nConfig;
    }
  }

  private findConfigFile(): string | null {
    const possibleNames = [
      'must.config.ts',
      'must.config.js',
      'must.config.json',
      'i18n.config.ts',
      'i18n.config.js',
      'i18n.config.json',
      '.i18nrc.json'
    ];

    for (const name of possibleNames) {
      const fullPath = join(process.cwd(), name);
      if (existsSync(fullPath)) {
        return fullPath;
      }
    }

    return null;
  }

  public getConfig(): I18nConfig {
    return this.config;
  }

  public updateConfig(updates: Partial<I18nConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  public validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.sourceLanguage) {
      errors.push('sourceLanguage is required');
    }

    if (!this.config.targetLanguages || this.config.targetLanguages.length === 0) {
      errors.push('targetLanguages must have at least one language');
    }

    if (!this.config.translationProvider) {
      errors.push('translationProvider is required');
    }

    if (!this.config.outputDir) {
      errors.push('outputDir is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export function createDefaultConfig(): I18nConfig {
  return {
    sourceLanguage: 'en',
    targetLanguages: ['zh-CN'],
    translationProvider: 'google',
    outputDir: 'i18n/strings',
    inputPatterns: [
      '**/*.js',
      '**/*.jsx',
      '**/*.ts',
      '**/*.tsx',
      '**/*.vue',
      '**/*.html'
    ],
    excludePatterns: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '**/*.test.*',
      '**/*.spec.*'
    ]
  };
}

