import { I18nConfig } from 'must';

const config: I18nConfig = {
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

export default config;
