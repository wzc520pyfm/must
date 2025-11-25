import { TranslationResult, TranslatorOptions } from '@must/types';

export abstract class BaseTranslator {
  protected options: TranslatorOptions;

  constructor(options: TranslatorOptions = {}) {
    this.options = options;
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
        const translatedText = await this.translate(text, sourceLanguage, targetLanguage);
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

