// @ts-check

/** @type {import('must').I18nConfig} */
const config = {
  sourceLanguage: 'en',
  targetLanguages: ['zh-CN', 'ja'],
  translationProvider: 'google',
  outputDir: 'src/i18n',
  inputPatterns: [
    'src/**/*.{ts,tsx}'
  ],
  excludePatterns: [
    'node_modules/**',
    'dist/**',
    'src/i18n/**'
  ]
};

module.exports = config;
