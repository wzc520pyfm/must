// @ts-check
require('dotenv').config();

/** @type {import('must').I18nConfig} */
const config = {
  appName: 'app',  // 应用名称，用于生成 key
  sourceLanguage: 'zh-CN',
  targetLanguages: ['en', 'ja'],
  translationProvider: 'baidu',
  apiKey: process.env.BAIDU_APP_ID,
  apiSecret: process.env.BAIDU_APP_KEY,
  outputDir: 'src/i18n',
  patchDir: 'src/i18n/patches',
  keyStyle: 'dot',
  keyMaxLength: 50,
  inputPatterns: [
    'src/**/*.{ts,tsx}'
  ],
  excludePatterns: [
    'node_modules/**',
    'dist/**',
    'src/i18n/**'
  ],

  // 插值配置
  interpolation: {
    prefix: '{{',
    suffix: '}}',
    translationFormat: 'xml',
  },

  // ✅ 统一模式配置
  // 所有文件（React 组件 + 静态文件）使用相同的导入和包裹方式
  transform: {
    enabled: true,
    importStatement: {
      // 开启统一模式
      unified: true,
      
      // 统一导入语句 - 所有文件都使用这个
      global: "import { trans } from '@/i18n-utils';",
      
      // 统一包裹函数 - 所有文件都使用这个
      // 使用模板格式：trans('key', '原文')
      wrapper: "trans('{{key}}', '{{text}}')",
      
      // 也可以使用函数生成器：
      // wrapper: (key, text) => `trans('${key}', '${text}')`,
    },
    formatCode: true,
  }
};

module.exports = config;

