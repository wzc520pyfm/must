/**
 * 自定义包裹函数生成器
 * @param key - 翻译 key
 * @param originalText - 原文
 * @param interpolations - 插值表达式数组（用于模板字符串）
 * @returns 生成的代码字符串
 */
export type WrapperGenerator = (
  key: string,
  originalText: string,
  interpolations?: string[]
) => string;

/**
 * 导入配置 - 支持全局导入和上下文注入
 */
export interface ImportConfig {
  /**
   * 全局导入语句，会添加到文件顶部的 import 区域
   * 例如: "import { useTranslation } from 'react-i18next';"
   */
  global?: string;
  /**
   * 上下文注入语句，会添加到 React 组件/Hook 函数体的开头
   * 例如: "const { t } = useTranslation();"
   */
  contextInjection?: string;
  /**
   * 静态文件的导入语句（用于非 React 组件的纯 JS/TS 文件）
   * 例如: "import i18n from '@/i18n';"
   * 或: "import { getLocal } from '@/utils/local';"
   */
  staticFileImport?: string;
  /**
   * 静态文件中使用的翻译函数
   * 支持三种格式：
   * 1. 简单函数名: "i18n.t" -> i18n.t("key")
   * 2. 模板字符串: "getLocal('{{key}}', '{{text}}')" -> getLocal('key', '原文')
   * 3. 函数生成器: (key, text) => `getLocal('${key}', '${text}')`
   * 
   * 模板变量:
   * - {{key}}: 翻译 key
   * - {{text}}: 原文
   * - {{0}}, {{1}}, ...: 插值表达式（用于模板字符串）
   */
  staticFileWrapper?: string | WrapperGenerator;
  /**
   * React 组件中使用的翻译函数（可选，默认使用 wrapperFunction）
   * 支持与 staticFileWrapper 相同的格式
   */
  componentWrapper?: string | WrapperGenerator;
}

export interface TransformConfig {
  enabled?: boolean;  // 是否启用自动转换
  /**
   * 导入配置，支持两种格式：
   * 1. 字符串格式（向后兼容）: "import { useTranslation } from 'react-i18next';"
   * 2. 对象格式（推荐）: { global: "import ...", contextInjection: "const { t } = ..." }
   */
  importStatement?: string | ImportConfig;
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

