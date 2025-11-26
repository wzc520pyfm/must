// @ts-check
require('dotenv').config();

/** @type {import('must').I18nConfig} */
const config = {
  appName: 'playground',  // 应用名称，用于生成 key
  sourceLanguage: 'zh-CN',  // 源语言改为中文
  targetLanguages: ['en', 'ja'],  // 目标语言为英文和日文
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
  // 代码转换配置
  transform: {
    enabled: true,  // 开启自动转换
    // 导入配置：支持全局导入和上下文注入
    importStatement: {
      // 全局导入语句，添加到文件顶部
      global: "import { useTranslation } from 'react-i18next';",
      // 上下文注入语句，添加到 React 组件/Hook 函数体开头
      contextInjection: "const { t } = useTranslation();"
    },
    wrapperFunction: 't',
    formatCode: true,  // 格式化代码
  }
};

module.exports = config;

