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
    enabled: false,  // 暂时关闭自动转换，先看 key 生成
    importStatement: "import { useTranslation } from 'react-i18next';",
    wrapperFunction: 't',
  }
};

module.exports = config;

