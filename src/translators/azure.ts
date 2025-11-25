import axios from 'axios';
import { BaseTranslator } from './base';

export class AzureTranslator extends BaseTranslator {
  private readonly baseUrl = 'https://api.cognitive.microsofttranslator.com/translate';

  async translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string> {
    this.validateApiKey();
    
    const subscriptionKey = this.options.apiKey!;
    const region = this.options.region || 'global';
    
    const params = {
      'api-version': '3.0',
      'from': sourceLanguage,
      'to': targetLanguage
    };

    const headers = {
      'Ocp-Apim-Subscription-Key': subscriptionKey,
      'Ocp-Apim-Subscription-Region': region,
      'Content-Type': 'application/json'
    };

    const body = [{ text }];

    try {
      const response = await axios.post(
        `${this.baseUrl}?api-version=3.0&from=${sourceLanguage}&to=${targetLanguage}`,
        body,
        { headers }
      );
      
      return response.data[0].translations[0].text;
    } catch (error) {
      console.error('Azure Translate error:', error);
      throw error;
    }
  }

  protected getProviderName(): string {
    return 'azure';
  }
}

