import { 
  TranslationResult, 
  CustomTranslatorConfig,
  CustomTranslateParams,
  CustomBatchTranslateParams
} from '../types';
import { BaseTranslator, TranslatorConfig } from './base';

export interface CustomTranslatorOptions extends TranslatorConfig {
  customConfig: CustomTranslatorConfig;
}

/**
 * 自定义翻译器 - 使用用户提供的翻译函数
 */
export class CustomTranslator extends BaseTranslator {
  private customConfig: CustomTranslatorConfig;

  constructor(options: CustomTranslatorOptions) {
    super(options);
    this.customConfig = options.customConfig;
  }

  protected getProviderName(): string {
    return this.customConfig.name || 'custom';
  }

  async translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string> {
    if (this.customConfig.batch) {
      // 批量翻译函数，单个文本时包装成数组
      const batchFn = this.customConfig.translate as (params: CustomBatchTranslateParams) => Promise<string[]>;
      const results = await batchFn({
        texts: [text],
        sourceLanguage,
        targetLanguage
      });
      return results[0] || text;
    } else {
      // 单文本翻译函数
      const singleFn = this.customConfig.translate as (params: CustomTranslateParams) => Promise<string>;
      return singleFn({
        text,
        sourceLanguage,
        targetLanguage
      });
    }
  }

  /**
   * 批量翻译 - 对批量函数进行优化
   */
  async translateBatch(
    texts: string[],
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<TranslationResult[]> {
    // 如果是批量翻译函数，直接调用
    if (this.customConfig.batch) {
      try {
        // 将占位符转换为翻译安全格式
        const textsForTranslation = texts.map(text => 
          this.interpolation.convertToTranslationFormat(text)
        );
        
        const batchFn = this.customConfig.translate as (params: CustomBatchTranslateParams) => Promise<string[]>;
        const translatedTexts = await batchFn({
          texts: textsForTranslation,
          sourceLanguage,
          targetLanguage
        });
        
        return texts.map((text, index) => {
          // 将翻译安全格式转换回标准格式
          let translatedText = translatedTexts[index] || text;
          translatedText = this.interpolation.convertFromTranslationFormat(translatedText);
          
          return {
            sourceText: text,
            translatedText,
            sourceLanguage,
            targetLanguage,
            provider: this.getProviderName()
          };
        });
      } catch (error) {
        console.error('Batch translation failed:', error);
        // 失败时回退到原文
        return texts.map(text => ({
          sourceText: text,
          translatedText: text,
          sourceLanguage,
          targetLanguage,
          provider: this.getProviderName()
        }));
      }
    }
    
    // 否则使用基类的逐个翻译方法
    return super.translateBatch(texts, sourceLanguage, targetLanguage);
  }
}

