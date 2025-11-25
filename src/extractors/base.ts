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
    return true;
  }
}

