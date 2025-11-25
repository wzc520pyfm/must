import { I18nConfig } from 'must';

const config: I18nConfig = {
  sourceLanguage: 'en',
  targetLanguages: ['zh-CN', 'ja', 'ko'],
  translationProvider: 'google',
  outputDir: 'i18n/strings',
  inputPatterns: [
    'src/**/*.{ts,tsx,js,jsx}',
    'src/**/*.vue',
    '**/*.html'
  ],
  excludePatterns: [
    'node_modules/**',
    'dist/**',
    'build/**',
    '**/*.test.*',
    '**/*.spec.*',
    '**/*.d.ts'
  ]
};

export default config;
