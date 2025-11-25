import { BaseExtractor } from './base';
import { JavaScriptExtractor } from './javascript';
import { VueExtractor } from './vue';
import { HTMLExtractor } from './html';
import { ExtractedText, ExtractorOptions } from '../types';

export class TextExtractor {
  private extractors: Map<string, BaseExtractor> = new Map();

  constructor(options: ExtractorOptions = {}) {
    this.extractors.set('js', new JavaScriptExtractor(options));
    this.extractors.set('jsx', new JavaScriptExtractor(options));
    this.extractors.set('ts', new JavaScriptExtractor(options));
    this.extractors.set('tsx', new JavaScriptExtractor(options));
    this.extractors.set('vue', new VueExtractor(options));
    this.extractors.set('html', new HTMLExtractor(options));
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
export type { ExtractedText, ExtractorOptions };

