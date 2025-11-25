import { ExtractedText, ExtractorOptions } from '../types';

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
    // Filter out very short texts, numbers, and special characters
    if (text.length < 2) return false;
    if (/^[0-9\s\-_\.]+$/.test(text)) return false;
    if (/^[a-zA-Z]{1,2}$/.test(text)) return false;
    
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
    
    if (technicalKeywords.includes(text.toLowerCase())) return false;
    
    // Filter out CSS class names and IDs
    if (/^[a-z\-_]+$/.test(text) && text.length < 15 && !text.includes(' ')) return false;
    
    // Filter out file extensions
    if (/^\.[a-z]{2,4}$/i.test(text)) return false;
    
    // Filter out hex colors
    if (/^#[0-9a-f]{3,8}$/i.test(text)) return false;
    
    // Must contain at least one letter
    if (!/[a-zA-Z\u4e00-\u9fa5]/.test(text)) return false;
    
    return true;
  }
}

