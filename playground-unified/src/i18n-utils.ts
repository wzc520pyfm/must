/**
 * 统一的国际化工具函数
 * 所有文件都使用这个函数进行翻译
 */

// 简单的翻译实现（实际项目中可以替换为 i18next 等）
const translations: Record<string, Record<string, string>> = {};

// 当前语言
let currentLanguage = 'zh-CN';

/**
 * 加载翻译文件
 */
export async function loadTranslations(lang: string) {
  try {
    const module = await import(`./i18n/${lang}.json`);
    translations[lang] = module.default || module;
    currentLanguage = lang;
  } catch (error) {
    console.warn(`Failed to load translations for ${lang}:`, error);
  }
}

/**
 * 设置当前语言
 */
export function setLanguage(lang: string) {
  currentLanguage = lang;
}

/**
 * 获取当前语言
 */
export function getLanguage() {
  return currentLanguage;
}

/**
 * 翻译函数
 * @param key - 翻译 key
 * @param defaultText - 默认文本（用于开发时显示）
 * @returns 翻译后的文本
 */
export function trans(key: string, defaultText: string): string {
  const langTranslations = translations[currentLanguage];
  if (langTranslations && langTranslations[key]) {
    return langTranslations[key];
  }
  // 如果没有翻译，返回默认文本
  return defaultText;
}

// 初始化加载中文
loadTranslations('zh-CN');

