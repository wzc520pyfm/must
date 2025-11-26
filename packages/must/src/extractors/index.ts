import { BaseExtractor, ExtractorConfig } from './base';
import { JavaScriptExtractor } from './javascript';
import { VueExtractor } from './vue';
import { HTMLExtractor } from './html';
import { ExtractedText, ExtractorOptions } from '@must/types';

export interface TextExtractorConfig {
  options?: ExtractorOptions;
  sourceLanguage?: string;  // 源语言，用于过滤文本
}

export class TextExtractor {
  private extractors: Map<string, BaseExtractor> = new Map();

  constructor(config: TextExtractorConfig = {}) {
    const extractorConfig: ExtractorConfig = {
      options: config.options,
      sourceLanguage: config.sourceLanguage
    };
    
    this.extractors.set('js', new JavaScriptExtractor(extractorConfig));
    this.extractors.set('jsx', new JavaScriptExtractor(extractorConfig));
    this.extractors.set('ts', new JavaScriptExtractor(extractorConfig));
    this.extractors.set('tsx', new JavaScriptExtractor(extractorConfig));
    this.extractors.set('vue', new VueExtractor(extractorConfig));
    this.extractors.set('html', new HTMLExtractor(extractorConfig));
  }

  async extractFromFile(filePath: string): Promise<ExtractedText[]> {
    const extension = this.getFileExtension(filePath);
    const extractor = this.extractors.get(extension);
    
    if (!extractor) {
      console.warn(`No extractor found for file type: ${extension}`);
      return [];
    }

    try {
      return await extractor.extract(filePath);
    } catch (error) {
      console.error(`Error extracting from ${filePath}:`, error);
      return [];
    }
  }

  private getFileExtension(filePath: string): string {
    const parts = filePath.split('.');
    if (parts.length < 2) return '';
    
    const extension = parts[parts.length - 1].toLowerCase();
    
    // Handle special cases
    if (extension === 'jsx') return 'jsx';
    if (extension === 'tsx') return 'tsx';
    if (extension === 'ts') return 'ts';
    
    return extension;
  }
}

export { BaseExtractor, JavaScriptExtractor, VueExtractor, HTMLExtractor };
export type { ExtractedText, ExtractorOptions, ExtractorConfig };

