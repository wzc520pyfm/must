const translate = require('translate-google');
import { BaseTranslator } from './base';

export class GoogleTranslator extends BaseTranslator {
  async translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string> {
    try {
      const result = await translate(text, {
        from: sourceLanguage,
        to: targetLanguage
      });

      return result;
    } catch (error) {
      console.error('Google Translate error:', error);
      throw error;
    }
  }

  protected getProviderName(): string {
    return 'google';
  }
}

