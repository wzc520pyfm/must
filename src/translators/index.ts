import { BaseTranslator } from './base';
import { GoogleTranslator } from './google';
import { BaiduTranslator } from './baidu';
import { AzureTranslator } from './azure';
import { I18nConfig, TranslatorOptions } from '../types';

export class TranslationManager {
  private translator: BaseTranslator;

  constructor(config: I18nConfig) {
    this.translator = this.createTranslator(config);
  }

  private createTranslator(config: I18nConfig): BaseTranslator {
    const options: TranslatorOptions = {
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
      region: config.region,
      customEndpoint: config.customTranslator
    };

    switch (config.translationProvider) {
      case 'google':
        return new GoogleTranslator(options);
      case 'baidu':
        return new BaiduTranslator(options);
      case 'azure':
        return new AzureTranslator(options);
      default:
        throw new Error(`Unsupported translation provider: ${config.translationProvider}`);
    }
  }

  async translateTexts(
    texts: string[],
    sourceLanguage: string,
    targetLanguage: string
  ) {
    return this.translator.translateBatch(texts, sourceLanguage, targetLanguage);
  }

  async translateToMultipleLanguages(
    texts: string[],
    sourceLanguage: string,
    targetLanguages: string[]
  ) {
    const results: Record<string, any[]> = {};
    
    for (const targetLanguage of targetLanguages) {
      results[targetLanguage] = await this.translateTexts(texts, sourceLanguage, targetLanguage);
    }
    
    return results;
  }
}

export { BaseTranslator, GoogleTranslator, BaiduTranslator, AzureTranslator };
export type { TranslatorOptions };

