import { BaseExtractor, ExtractorConfig, ExtractResult } from './base';
import { JavaScriptExtractor } from './javascript';
import { VueExtractor } from './vue';
import { HTMLExtractor } from './html';
import { ExtractedText, ExtractorOptions, InterpolationConfig, ExtractionWarning } from '@must/types';

export interface TextExtractorConfig {
  options?: ExtractorOptions;
  sourceLanguage?: string;  // 源语言，用于过滤文本
  interpolation?: InterpolationConfig;  // 插值配置
}

export interface TextExtractResult {
  texts: ExtractedText[];
  warnings: ExtractionWarning[];
}

export class TextExtractor {
  private extractors: Map<string, BaseExtractor> = new Map();
  private allWarnings: ExtractionWarning[] = [];

  constructor(config: TextExtractorConfig = {}) {
    const extractorConfig: ExtractorConfig = {
      options: config.options,
      sourceLanguage: config.sourceLanguage,
      interpolation: config.interpolation
    };
    
    this.extractors.set('js', new JavaScriptExtractor(extractorConfig));
    this.extractors.set('jsx', new JavaScriptExtractor(extractorConfig));
    this.extractors.set('ts', new JavaScriptExtractor(extractorConfig));
    this.extractors.set('tsx', new JavaScriptExtractor(extractorConfig));
    this.extractors.set('vue', new VueExtractor(extractorConfig));
    this.extractors.set('html', new HTMLExtractor(extractorConfig));
  }

  /**
   * 清空所有警告
   */
  clearWarnings(): void {
    this.allWarnings = [];
  }

  /**
   * 获取所有警告
   */
  getWarnings(): ExtractionWarning[] {
    return [...this.allWarnings];
  }

  async extractFromFile(filePath: string): Promise<ExtractedText[]> {
    const result = await this.extractFromFileWithWarnings(filePath);
    return result.texts;
  }

  async extractFromFileWithWarnings(filePath: string): Promise<TextExtractResult> {
    const extension = this.getFileExtension(filePath);
    const extractor = this.extractors.get(extension);
    
    if (!extractor) {
      console.warn(`No extractor found for file type: ${extension}`);
      return { texts: [], warnings: [] };
    }

    try {
      // 检查提取器是否支持带警告的提取
      const jsExtractor = extractor as JavaScriptExtractor;
      if (typeof jsExtractor.extractWithWarnings === 'function') {
        const result = await jsExtractor.extractWithWarnings(filePath);
        this.allWarnings.push(...result.warnings);
        return result;
      }
      
      // 回退到普通提取
      const texts = await extractor.extract(filePath);
      const warnings = extractor.getWarnings();
      this.allWarnings.push(...warnings);
      return { texts, warnings };
    } catch (error) {
      console.error(`Error extracting from ${filePath}:`, error);
      return { texts: [], warnings: [] };
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

