import axios from 'axios';
import { createHash } from 'crypto';
import { BaseTranslator } from './base';

export class BaiduTranslator extends BaseTranslator {
  private readonly baseUrl = 'https://fanyi-api.baidu.com/api/trans/vip/translate';

  async translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string> {
    this.validateApiKey();
    
    const appId = this.options.apiKey!;
    const secretKey = this.options.apiSecret!;
    const salt = Date.now().toString();
    const signStr = appId + text + salt + secretKey;
    const sign = createHash('md5').update(signStr).digest('hex');

    const params = {
      q: text,
      from: this.convertLanguageCode(sourceLanguage, 'baidu'),
      to: this.convertLanguageCode(targetLanguage, 'baidu'),
      appid: appId,
      salt: salt,
      sign: sign
    };

    try {
      const response = await axios.get(this.baseUrl, { params });
      
      if (response.data.error_code) {
        throw new Error(`Baidu Translate API error: ${response.data.error_msg}`);
      }

      return response.data.trans_result[0].dst;
    } catch (error) {
      console.error('Baidu Translate error:', error);
      throw error;
    }
  }

  protected getProviderName(): string {
    return 'baidu';
  }

  private convertLanguageCode(lang: string, provider: 'baidu'): string {
    const langMap: Record<string, Record<string, string>> = {
      baidu: {
        'en': 'en',
        'zh': 'zh',
        'zh-CN': 'zh',
        'zh-TW': 'cht',
        'ja': 'jp',
        'ko': 'kor',
        'fr': 'fra',
        'de': 'de',
        'es': 'spa',
        'it': 'it',
        'pt': 'pt',
        'ru': 'ru',
        'ar': 'ara'
      }
    };

    return langMap[provider]?.[lang] || lang;
  }
}

