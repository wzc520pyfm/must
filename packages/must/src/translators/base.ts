import { TranslationResult, TranslatorOptions, InterpolationConfig } from '@must/types';
import { InterpolationHandler, createInterpolationHandler } from '../utils/interpolation';

export interface TranslatorConfig extends TranslatorOptions {
  interpolation?: InterpolationConfig;
}

export abstract class BaseTranslator {
  protected options: TranslatorOptions;
  protected interpolation: InterpolationHandler;

  constructor(options: TranslatorConfig = {}) {
    const { interpolation, ...translatorOptions } = options;
    this.options = translatorOptions;
    this.interpolation = createInterpolationHandler(interpolation);
  }

  abstract translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string>;

  async translateBatch(
    texts: string[],
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<TranslationResult[]> {
    const results: TranslationResult[] = [];
    
    for (const text of texts) {
      try {
        // 将占位符转换为翻译安全格式
        const textForTranslation = this.interpolation.convertToTranslationFormat(text);
        
        // 调用翻译 API
        let translatedText = await this.translate(textForTranslation, sourceLanguage, targetLanguage);
        
        // 将翻译安全格式转换回标准格式
        translatedText = this.interpolation.convertFromTranslationFormat(translatedText);
        
        results.push({
          sourceText: text,
          translatedText,
          sourceLanguage,
          targetLanguage,
          provider: this.getProviderName()
        });
      } catch (error) {
        console.error(`Translation failed for "${text}":`, error);
        results.push({
          sourceText: text,
          translatedText: text, // Fallback to original text
          sourceLanguage,
          targetLanguage,
          provider: this.getProviderName()
        });
      }
    }
    
    return results;
  }

  protected abstract getProviderName(): string;

  protected validateApiKey(): boolean {
    if (!this.options.apiKey) {
      throw new Error(`API key is required for ${this.getProviderName()} translator`);
    }
    return true;
  }
}

