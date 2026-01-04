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

/**
 * Key 生成器参数
 */
export interface KeyGeneratorParams {
  /** 路径部分，如 'app.components.UserProfile' */
  base: string;
  /** 文案简写部分，如 'welcomeBack' */
  text: string;
  /** 计数器，从 0 开始，用于处理重复 key */
  num: number;
  /** 命名参数列表（当启用 namedParams 时） */
  params?: string[];
  /** 完整文件路径 */
  filePath: string;
  /** 原始源语言文案 */
  originalText: string;
  /** 翻译后的文案（用于生成 key） */
  translatedText: string;
  /** 应用名称 */
  appName?: string;
}

/**
 * Key 生成配置
 */
export interface KeyConfig {
  /**
   * 自定义前缀
   * 例如: 'CB_IBG_APPROLL_'
   * 生成的 key: 'CB_IBG_APPROLL_00001'
   */
  prefix?: string;

  /**
   * 计数器样式
   * - 'none': 不添加计数器
   * - 'auto': 仅在重复时添加计数器（默认）
   * - 'always': 始终添加计数器
   */
  counterStyle?: 'none' | 'auto' | 'always';

  /**
   * 计数器填充位数
   * 例如: 5 表示 00001, 00002, ...
   * 默认: 0（不填充）
   */
  counterPadding?: number;

  /**
   * 计数器起始值
   * 默认: 0
   */
  counterStart?: number;

  /**
   * 是否只使用前缀+计数器模式
   * 如果为 true，key 格式为: {prefix}{counter}[_{params}]
   * 如果为 false（默认），key 格式为: {prefix}{base}.{text}[_{params}][.counter]
   */
  prefixOnly?: boolean;

  /**
   * 是否在 key 中包含命名参数
   * 当 interpolation.namedParams 为 true 时，可以选择将参数名添加到 key 中
   * 例如: 'CB_IBG_APPROLL_00001_{username}_{count}'
   * @default false
   */
  includeParams?: boolean;

  /**
   * 自定义 key 生成函数
   * 提供最大灵活性，可以完全自定义 key 格式
   * 如果提供此函数，将忽略其他配置（prefix, counterStyle 等）
   * 
   * @example
   * // 简单前缀+计数器格式
   * generator: ({ num }) => `CB_IBG_${String(num).padStart(5, '0')}`
   * 
   * @example
   * // 自定义格式
   * generator: ({ base, text, num, params }) => {
   *   let key = `${base}.${text}`;
   *   if (params?.length) key += `_{${params.join('}_{')}}`; 
   *   if (num > 0) key += `.${num}`;
   *   return key;
   * }
   */
  generator?: (params: KeyGeneratorParams) => string;
}

export interface I18nConfig {
  appName?: string;  // 应用名称，用于生成 key
  sourceLanguage: string;
  targetLanguages: string[];

  /**
   * 翻译服务商
   * 当使用 customTranslate 时可以设为 'custom'
   */
  translationProvider: 'google' | 'baidu' | 'youdao' | 'azure' | 'custom';

  apiKey?: string;
  apiSecret?: string;
  region?: string;
  outputDir: string;
  inputPatterns: string[];
  excludePatterns: string[];

  /** @deprecated 使用 customTranslate 代替 */
  customTranslator?: string;

  /**
   * 自定义翻译函数配置
   * 当 translationProvider 为 'custom' 时必须提供
   * 
   * @example
   * // 单文本翻译
   * customTranslate: {
   *   translate: async ({ text, sourceLanguage, targetLanguage }) => {
   *     const result = await myTranslationAPI(text, sourceLanguage, targetLanguage);
   *     return result.translatedText;
   *   }
   * }
   * 
   * @example
   * // 批量翻译（更高效）
   * customTranslate: {
   *   batch: true,
   *   translate: async ({ texts, sourceLanguage, targetLanguage }) => {
   *     const results = await myBatchTranslationAPI(texts, sourceLanguage, targetLanguage);
   *     return results.map(r => r.translatedText);
   *   }
   * }
   */
  customTranslate?: CustomTranslatorConfig;

  patchDir?: string;  // patch 目录，用于存储增量翻译
  keyStyle?: 'dot' | 'underscore';  // key 风格：点分隔或下划线，默认 'dot'
  keyMaxLength?: number;  // key 最大长度，默认 50
  keyConfig?: KeyConfig;  // key 生成配置
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

/**
 * 提取警告的严重程度
 */
export type ExtractionWarningSeverity = 'warning' | 'error' | 'info';

/**
 * 提取警告
 */
export interface ExtractionWarning {
  /** 警告类型 */
  type:
  | 'complex-expression'      // 复杂表达式，无法提取变量名
  | 'nested-template'         // 嵌套模板字符串
  | 'conditional-expression'  // 条件表达式
  | 'function-call'           // 函数调用
  | 'too-many-interpolations' // 过多插值
  | 'dynamic-text'            // 动态文本（无法静态分析）
  | 'binary-expression'       // 二元表达式
  | 'parse-error';            // 解析错误

  /** 严重程度 */
  severity: ExtractionWarningSeverity;

  /** 警告消息 */
  message: string;

  /** 文件路径 */
  file: string;

  /** 行号 */
  line: number;

  /** 列号 */
  column: number;

  /** 原始代码片段 */
  code?: string;

  /** 建议的处理方式 */
  suggestion?: string;
}

export interface TranslationResult {
  sourceText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  provider: string;
}

/**
 * 自定义翻译函数的参数
 */
export interface CustomTranslateParams {
  /** 要翻译的文本 */
  text: string;
  /** 源语言代码 */
  sourceLanguage: string;
  /** 目标语言代码 */
  targetLanguage: string;
}

/**
 * 批量翻译函数的参数
 */
export interface CustomBatchTranslateParams {
  /** 要翻译的文本数组 */
  texts: string[];
  /** 源语言代码 */
  sourceLanguage: string;
  /** 目标语言代码 */
  targetLanguage: string;
}

/**
 * 自定义翻译函数类型
 * 可以是单个文本翻译函数或批量翻译函数
 */
export type CustomTranslateFunction =
  | ((params: CustomTranslateParams) => Promise<string>)
  | ((params: CustomBatchTranslateParams) => Promise<string[]>);

/**
 * 自定义翻译器配置
 */
export interface CustomTranslatorConfig {
  /**
   * 翻译函数
   * 支持两种签名：
   * 1. 单文本翻译: ({ text, sourceLanguage, targetLanguage }) => Promise<string>
   * 2. 批量翻译: ({ texts, sourceLanguage, targetLanguage }) => Promise<string[]>
   */
  translate: CustomTranslateFunction;

  /**
   * 翻译器名称（用于日志和报告）
   * @default 'custom'
   */
  name?: string;

  /**
   * 是否为批量翻译函数
   * 如果为 true，translate 函数应接收 texts 数组并返回翻译结果数组
   * @default false
   */
  batch?: boolean;
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
   * 使用命名参数而非索引参数
   * 如果为 true，会从模板字符串的变量名提取参数名
   * 例如: `欢迎${username}` -> '欢迎{username}'
   * 
   * @default false
   */
  namedParams?: boolean;

  /**
   * 在 key 中包含参数名
   * 例如: 'app.welcome_{username}_{location}'
   * 
   * @default false
   */
  includeParamsInKey?: boolean;

  /**
   * 自定义占位符生成函数
   * 如果提供，将忽略 prefix/suffix，完全由函数控制格式
   * @param index 占位符索引 (0, 1, 2, ...)
   * @param name 变量名（如果 namedParams 为 true）
   * @returns 占位符字符串，如 '{{0}}', '{username}', '<ph id="0"/>'
   */
  format?: (index: number, name?: string) => string;

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

