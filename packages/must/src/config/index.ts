import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { I18nConfig } from '../types';
import { pathToFileURL } from 'url';

const DEFAULT_CONFIG: Partial<I18nConfig> = {
  sourceLanguage: 'zh-CN',  // 默认源语言为中文
  targetLanguages: ['en'],  // 默认目标语言为英文
  translationProvider: 'google',
  inputDir: '',  // 默认为空，表示使用项目根目录
  inputFiles: [],  // 默认为空，不指定特定文件/目录
  outputDir: 'i18n/strings',
  patchDir: 'i18n/patches',  // 默认 patch 目录
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
        // Handle JavaScript/TypeScript config files
        if (configFile.endsWith('.js') || configFile.endsWith('.ts')) {
          return this.loadModuleConfig(configFile);
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

  private loadModuleConfig(filePath: string): I18nConfig {
    try {
      // For .ts files, try to use ts-node/register if available
      if (filePath.endsWith('.ts')) {
        try {
          require('ts-node/register');
        } catch {
          // ts-node not available, try to require directly
        }
      }
      
      // Use require to load the module
      const absolutePath = require.resolve(filePath, { paths: [process.cwd()] });
      delete require.cache[absolutePath];
      const config = require(absolutePath);
      const userConfig = config.default || config;
      return { ...DEFAULT_CONFIG, ...userConfig } as I18nConfig;
    } catch (error) {
      console.warn(`Failed to load module config:`, error);
      return DEFAULT_CONFIG as I18nConfig;
    }
  }

  private findConfigFile(): string | null {
    const possibleNames = [
      'must.config.js',         // 优先 JS 文件（更稳定）
      'must.config.json',
      'must.config.ts',
      'i18n.config.js',
      'i18n.config.json',
      'i18n.config.ts',
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

