export interface I18nConfig {
  sourceLanguage: string;
  targetLanguages: string[];
  translationProvider: 'google' | 'baidu' | 'youdao' | 'azure';
  apiKey?: string;
  apiSecret?: string;
  region?: string;
  outputDir: string;
  inputPatterns: string[];
  excludePatterns: string[];
  customTranslator?: string;
}

export interface ExtractedText {
  text: string;
  file: string;
  line: number;
  column: number;
  context?: string;
  type: 'string' | 'template' | 'jsx' | 'vue' | 'html';
}

export interface TranslationResult {
  sourceText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  provider: string;
}

export interface I18nFile {
  [key: string]: string | I18nFile;
}

export interface ExtractorOptions {
  includeComments?: boolean;
  includeTemplateLiterals?: boolean;
  includeJSX?: boolean;
  includeVue?: boolean;
  includeHTML?: boolean;
}

export interface TranslatorOptions {
  apiKey?: string;
  apiSecret?: string;
  region?: string;
  customEndpoint?: string;
}

