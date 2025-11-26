import { ExtractedText, ExtractorOptions } from '@must/types';

export abstract class BaseExtractor {
  protected options: ExtractorOptions;

  constructor(options: ExtractorOptions = {}) {
    this.options = {
      includeComments: false,
      includeTemplateLiterals: true,
      includeJSX: true,
      includeVue: true,
      includeHTML: true,
      ...options
    };
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
    
    // Filter out common code keywords and technical terms
    const technicalKeywords = [
      'react', 'vue', 'angular', 'tsx', 'jsx', 'ts', 'js',
      'node_modules', 'package', 'import', 'export', 'const', 'let', 'var',
      'function', 'class', 'interface', 'type', 'enum', 'div', 'span',
      'button', 'input', 'form', 'header', 'footer', 'nav', 'main',
      'src', 'dist', 'build', 'app', 'btn', 'primary', 'secondary',
      'lg', 'sm', 'md', 'xl', 'px', 'py', 'mt', 'mb', 'ml', 'mr'
    ];
    
    if (technicalKeywords.includes(textWithoutPlaceholders.toLowerCase().trim())) return false;
    
    // Filter out CSS class names and IDs (but not if it contains Chinese or placeholders)
    if (/^[a-z\-_]+$/.test(textWithoutPlaceholders) && textWithoutPlaceholders.length < 15 && !textWithoutPlaceholders.includes(' ')) return false;
    
    // Filter out file extensions
    if (/^\.[a-z]{2,4}$/i.test(text)) return false;
    
    // Filter out hex colors
    if (/^#[0-9a-f]{3,8}$/i.test(text)) return false;
    
    // Must contain at least one Chinese character or meaningful letter sequence
    // 包含中文字符的文本优先通过
    if (/[\u4e00-\u9fa5]/.test(textWithoutPlaceholders)) return true;
    
    // 对于英文文本，必须包含字母且长度足够
    if (!/[a-zA-Z]/.test(textWithoutPlaceholders)) return false;
    
    return true;
  }
}

