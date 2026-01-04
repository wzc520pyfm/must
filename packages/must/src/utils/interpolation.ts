import { InterpolationConfig } from '@must/types';

/**
 * 插值处理器 - 处理模板字符串中的动态表达式占位符
 */
export class InterpolationHandler {
  private config: Required<Pick<InterpolationConfig, 'prefix' | 'suffix'>> & InterpolationConfig;

  constructor(config: InterpolationConfig = {}) {
    this.config = {
      prefix: config.prefix ?? '{{',
      suffix: config.suffix ?? '}}',
      ...config
    };
  }

  /**
   * 生成标准占位符（用于提取和最终输出）
   */
  formatPlaceholder(index: number): string {
    if (this.config.format) {
      return this.config.format(index);
    }
    return `${this.config.prefix}${index}${this.config.suffix}`;
  }

  /**
   * 生成翻译时使用的占位符
   * 根据 translationFormat 配置决定使用什么格式
   */
  formatForTranslation(index: number): string {
    switch (this.config.translationFormat) {
      case 'xml':
        // XML 标签格式，大多数翻译 API 会保留
        return `<ph id="${index}"/>`;
      case 'bracket':
        // 方括号格式
        return `[${index}]`;
      case 'custom':
        // 自定义格式
        const prefix = this.config.translationPrefix ?? '__PH';
        const suffix = this.config.translationSuffix ?? '__';
        return `${prefix}${index}${suffix}`;
      default:
        // 不转换，使用原格式
        return this.formatPlaceholder(index);
    }
  }

  /**
   * 获取匹配标准占位符的正则表达式
   */
  getPlaceholderRegex(): RegExp {
    const prefix = this.escapeRegex(this.config.prefix);
    const suffix = this.escapeRegex(this.config.suffix);
    return new RegExp(`${prefix}(\\d+)${suffix}`, 'g');
  }

  /**
   * 获取匹配翻译格式占位符的正则表达式
   */
  getTranslationFormatRegex(): RegExp {
    switch (this.config.translationFormat) {
      case 'xml':
        // 翻译 API 可能会修改 XML 标签格式，需要匹配多种变体：
        // <ph id="0"/> <phid="0"/> <ph id=0/> <ph id="0" /> 等
        return /<ph\s*id\s*=\s*"?(\d+)"?\s*\/>/gi;
      case 'bracket':
        return /\[(\d+)\]/g;
      case 'custom':
        const prefix = this.escapeRegex(this.config.translationPrefix ?? '__PH');
        const suffix = this.escapeRegex(this.config.translationSuffix ?? '__');
        return new RegExp(`${prefix}(\\d+)${suffix}`, 'g');
      default:
        return this.getPlaceholderRegex();
    }
  }

  /**
   * 将文本中的标准占位符转换为翻译格式
   */
  convertToTranslationFormat(text: string): string {
    if (!this.config.translationFormat) {
      return text;
    }

    const regex = this.getPlaceholderRegex();
    return text.replace(regex, (_, index) => {
      return this.formatForTranslation(parseInt(index, 10));
    });
  }

  /**
   * 将翻译后的文本中的翻译格式占位符转换回标准格式
   */
  convertFromTranslationFormat(text: string): string {
    if (!this.config.translationFormat) {
      return text;
    }

    const regex = this.getTranslationFormatRegex();
    return text.replace(regex, (_, index) => {
      return this.formatPlaceholder(parseInt(index, 10));
    });
  }

  /**
   * 检查文本是否包含占位符
   */
  hasPlaceholders(text: string): boolean {
    return this.getPlaceholderRegex().test(text);
  }

  /**
   * 提取文本中的所有占位符索引
   */
  extractPlaceholderIndices(text: string): number[] {
    const regex = this.getPlaceholderRegex();
    const indices: number[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      indices.push(parseInt(match[1], 10));
    }
    return indices;
  }

  /**
   * 转义正则表达式特殊字符
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

/**
 * 创建默认的插值处理器
 */
export function createInterpolationHandler(config?: InterpolationConfig): InterpolationHandler {
  return new InterpolationHandler(config);
}

