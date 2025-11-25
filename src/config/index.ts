import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { I18nConfig } from '../types';

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
        const userConfig = JSON.parse(readFileSync(configFile, 'utf-8'));
        return { ...DEFAULT_CONFIG, ...userConfig } as I18nConfig;
      } catch (error) {
        console.warn(`Failed to load config from ${configFile}:`, error);
      }
    }

    return DEFAULT_CONFIG as I18nConfig;
  }

  private findConfigFile(): string | null {
    const possibleNames = [
      'i18n.config.json',
      '.i18nrc.json',
      'auto-i18n.config.json'
    ];

    for (const name of possibleNames) {
      if (existsSync(name)) {
        return name;
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

