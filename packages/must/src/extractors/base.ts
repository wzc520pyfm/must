import { ExtractedText, ExtractorOptions } from '@must/types';

export interface ExtractorConfig {
  options?: ExtractorOptions;
  sourceLanguage?: string;  // 源语言，用于过滤文本
}

export abstract class BaseExtractor {
  protected options: ExtractorOptions;
  protected sourceLanguage: string;

  constructor(config: ExtractorConfig = {}) {
    this.options = {
      includeComments: false,
      includeTemplateLiterals: true,
      includeJSX: true,
      includeVue: true,
      includeHTML: true,
      ...config.options
    };
    this.sourceLanguage = config.sourceLanguage || 'zh-CN';
  }

  abstract extract(filePath: string): Promise<ExtractedText[]>;

  protected createExtractedText(
    text: string,
    file: string,
    line: number,
    column: number,
    type: ExtractedText['type'],
    context?: string
  ): ExtractedText {
    return {
      text: text.trim(),
      file,
      line,
      column,
      context,
      type
    };
  }

  protected isValidText(text: string): boolean {
    // 去除模板占位符后检查文本
    const textWithoutPlaceholders = text.replace(/\{\{\d+\}\}/g, '');
    
    // Filter out very short texts, numbers, and special characters
    if (textWithoutPlaceholders.trim().length < 2) return false;
    if (/^[0-9\s\-_\.]+$/.test(textWithoutPlaceholders)) return false;
    if (/^[a-zA-Z]{1,2}$/.test(textWithoutPlaceholders.trim())) return false;
    
    // Filter out URLs and paths
    if (/^(https?:\/\/|\/|\.\/|\.\.\/|~\/)/.test(text)) return false;
    if (/^[@\.][\w\-\/]+/.test(text)) return false; // npm packages, relative paths
    
    // Filter out file extensions
    if (/^\.[a-z]{2,4}$/i.test(text)) return false;
    
    // Filter out hex colors
    if (/^#[0-9a-f]{3,8}$/i.test(text)) return false;
    
    // 根据源语言决定提取策略
    // 目前只支持中文作为源语言，只提取包含中文的文本
    // 未来可以扩展支持英文等其他语言
    if (this.sourceLanguage.startsWith('zh')) {
      // 中文源语言：必须包含中文字符
      return /[\u4e00-\u9fa5]/.test(textWithoutPlaceholders);
    }
    
    // 日文源语言：必须包含日文字符（平假名、片假名、汉字）
    if (this.sourceLanguage.startsWith('ja')) {
      return /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fa5]/.test(textWithoutPlaceholders);
    }
    
    // 韩文源语言：必须包含韩文字符
    if (this.sourceLanguage.startsWith('ko')) {
      return /[\uac00-\ud7af\u1100-\u11ff]/.test(textWithoutPlaceholders);
    }
    
    // 其他语言（如英文）：暂不支持，返回 false
    // 英文文案和代码本身都是英文，不好区分，未来再扩展
    return false;
  }
}

