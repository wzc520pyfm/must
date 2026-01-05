// @ts-check
require('dotenv').config();

/** @type {import('must').I18nConfig} */
const config = {
  appName: 'playground',  // 应用名称，用于生成 key
  sourceLanguage: 'zh-CN',  // 源语言改为中文
  targetLanguages: ['en', 'ja'],  // 目标语言为英文和日文
  // skipTranslation: true, // 跳过翻译，仅提取文案并生成语言文件
  translationProvider: 'baidu',
  // 从环境变量读取 API 配置
  apiKey: process.env.BAIDU_APP_ID,
  apiSecret: process.env.BAIDU_APP_KEY,
  outputDir: 'src/i18n',
  patchDir: 'src/i18n/patches',  // patch 目录
  keyStyle: 'dot',  // 使用点分隔的 key 风格
  keyMaxLength: 50,  // key 最大长度
  inputPatterns: [
    'src/**/*.{ts,tsx}'
  ],
  excludePatterns: [
    'node_modules/**',
    'dist/**',
    'src/i18n/**'
  ],
  
  // 插值配置：定义模板字符串中动态表达式的占位符格式
  interpolation: {
    // 占位符前后缀（默认 '{{' 和 '}}'）
    prefix: '{{',
    suffix: '}}',
    
    // 翻译时使用的安全格式，避免翻译 API 破坏占位符
    // 可选值：
    // - 'xml': 使用 <ph id="N"/> 格式（推荐，大多数翻译 API 会保留 XML 标签）
    // - 'bracket': 使用 [N] 格式
    // - 'custom': 使用自定义 translationPrefix/translationSuffix
    // - null: 不转换（如果翻译 API 不会破坏占位符）
    translationFormat: 'xml',
    
    // 自定义格式的前后缀（当 translationFormat 为 'custom' 时生效）
    // translationPrefix: '__PH',
    // translationSuffix: '__',
    
    // 或者使用函数完全自定义占位符格式
    // format: (index) => `\${${index}}`,  // 生成 ${0}, ${1}, ...
  },

  // 代码转换配置
  transform: {
    enabled: true,  // 开启自动转换
    // 导入配置：支持全局导入和上下文注入
    importStatement: {
      // React 组件：全局导入语句
      global: "import { useTranslation } from 'react-i18next';",
      // React 组件：上下文注入语句
      contextInjection: "const { t } = useTranslation();",
      // 静态文件：导入自定义国际化函数
      staticFileImport: "import { getLocal } from '@/utils/local';",
      // 静态文件：使用模板格式包裹
      // 支持三种格式：
      // 1. 简单函数名: "i18n.t" -> i18n.t("key")
      // 2. 模板字符串: "getLocal('{{key}}', '{{text}}')" -> getLocal('key', '原文')
      // 3. 函数生成器: (key, text) => `getLocal('${key}', '${text}')`
      staticFileWrapper: "getLocal('{{key}}', '{{text}}')"
    },
    wrapperFunction: 't',
    formatCode: true,  // 格式化代码
  }
};

module.exports = config;

