import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

// 动态导入翻译文件
import zhCN from './i18n/zh-CN.json';
import en from './i18n/en.json';
import ja from './i18n/ja.json';

i18next
  .use(initReactI18next)
  .init({
    resources: {
      'zh-CN': { translation: zhCN },
      'en': { translation: en },
      'ja': { translation: ja }
    },
    lng: 'zh-CN',  // 默认语言
    fallbackLng: 'zh-CN',  // 回退语言
    interpolation: {
      escapeValue: false  // React 已经做了 XSS 防护
    },
    debug: false
  });

export default i18next;