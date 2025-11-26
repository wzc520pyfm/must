export interface TransformConfig {
  enabled?: boolean;  // 是否启用自动转换
  importStatement?: string;  // 自定义 import 语句
  wrapperFunction?: string;  // 包裹函数名，默认 't'
  formatCode?: boolean;  // 是否格式化代码，默认 true
  // 自定义转换函数
  customTransform?: (params: {
    text: string;
    key: string;
    sourceCode: string;
    filePath: string;
  }) => string;
}

export interface I18nConfig {
  appName?: string;  // 应用名称，用于生成 key
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
  patchDir?: string;  // patch 目录，用于存储增量翻译
  keyStyle?: 'dot' | 'underscore';  // key 风格：点分隔或下划线，默认 'dot'
  keyMaxLength?: number;  // key 最大长度，默认 50
  transform?: TransformConfig;  // 代码转换配置
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

