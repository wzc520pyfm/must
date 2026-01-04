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
   * 统一模式：所有文件（React 组件和静态文件）使用相同的导入和包裹方式
   * 如果为 true，将只使用 global 和 wrapper 配置，忽略其他配置
   * @default false
   */
  unified?: boolean;
  
  /**
   * 统一包裹函数（当 unified 为 true 时使用）
   * 支持三种格式：
   * 1. 简单函数名: "trans" -> trans("key")
   * 2. 模板字符串: "trans('{{key}}', '{{text}}')" -> trans('key', '原文')
   * 3. 函数生成器: (key, text) => `trans('${key}', '${text}')`
   * 
   * 模板变量:
   * - {{key}}: 翻译 key
   * - {{text}}: 原文（会自动转义引号）
   * - {{0}}, {{1}}, ...: 插值表达式（用于模板字符串）
   */
  wrapper?: string | WrapperGenerator;
  
  /**
   * 全局导入语句，会添加到文件顶部的 import 区域
   * 例如: "import { useTranslation } from 'react-i18next';"
   * 或统一模式: "import { trans } from 'i18n-utils';"
   */
  global?: string;
  /**
   * 上下文注入语句，会添加到 React 组件/Hook 函数体的开头
   * 例如: "const { t } = useTranslation();"
   * 注意：统一模式下此配置被忽略
   */
  contextInjection?: string;
  /**
   * 静态文件的导入语句（用于非 React 组件的纯 JS/TS 文件）
   * 例如: "import i18n from '@/i18n';"
   * 或: "import { getLocal } from '@/utils/local';"
   * 注意：统一模式下此配置被忽略，使用 global
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
   * 注意：统一模式下此配置被忽略，使用 wrapper
   */
  staticFileWrapper?: string | WrapperGenerator;
  /**
   * React 组件中使用的翻译函数（可选，默认使用 wrapperFunction）
   * 支持与 staticFileWrapper 相同的格式
   * 注意：统一模式下此配置被忽略，使用 wrapper
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
  interpolation?: InterpolationConfig;  // 插值配置
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

/**
 * 插值配置 - 定义如何处理模板字符串中的动态表达式
 */
export interface InterpolationConfig {
  /**
   * 占位符前缀
   * @default '{{'
   */
  prefix?: string;

  /**
   * 占位符后缀
   * @default '}}'
   */
  suffix?: string;

  /**
   * 自定义占位符生成函数
   * 如果提供，将忽略 prefix/suffix，完全由函数控制格式
   * @param index 占位符索引 (0, 1, 2, ...)
   * @returns 占位符字符串，如 '{{0}}', '${0}', '<ph id="0"/>'
   */
  format?: (index: number) => string;

  /**
   * 翻译时使用的占位符格式
   * 某些翻译 API 会修改特定格式的文本，可以指定一个"安全"的格式
   * 翻译完成后会自动转换回标准格式
   * 
   * 支持的格式：
   * - 'xml': 使用 <ph id="N"/> 格式（大多数翻译 API 会保留 XML 标签）
   * - 'bracket': 使用 [N] 格式
   * - 'custom': 使用 translationPrefix/translationSuffix 自定义格式
   * - null: 不转换，直接使用原格式
   * 
   * @default null (不转换)
   */
  translationFormat?: 'xml' | 'bracket' | 'custom' | null;

  /**
   * 翻译时使用的自定义前缀（当 translationFormat 为 'custom' 时生效）
   */
  translationPrefix?: string;

  /**
   * 翻译时使用的自定义后缀（当 translationFormat 为 'custom' 时生效）
   */
  translationSuffix?: string;
}

