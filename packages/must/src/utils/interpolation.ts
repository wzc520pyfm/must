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
   * 是否使用命名参数
   */
  get useNamedParams(): boolean {
    return this.config.namedParams ?? false;
  }

  /**
   * 是否在 key 中包含参数名
   */
  get includeParamsInKey(): boolean {
    return this.config.includeParamsInKey ?? false;
  }

  /**
   * 生成标准占位符（用于提取和最终输出）
   * @param index 占位符索引
   * @param name 变量名（用于命名参数模式）
   */
  formatPlaceholder(index: number, name?: string): string {
    if (this.config.format) {
      return this.config.format(index, name);
    }
    
    // 如果使用命名参数且提供了名称，使用名称
    if (this.useNamedParams && name) {
      return `${this.config.prefix}${name}${this.config.suffix}`;
    }
    
    return `${this.config.prefix}${index}${this.config.suffix}`;
  }

  /**
   * 生成用于 key 的参数后缀
   * 例如: ['username', 'count'] -> '_{username}_{count}'
   */
  formatKeyParamsSuffix(paramNames: string[]): string {
    if (!this.includeParamsInKey || paramNames.length === 0) {
      return '';
    }
    return paramNames.map(name => `_{${name}}`).join('');
  }

  /**
   * 生成翻译时使用的占位符
   * 根据 translationFormat 配置决定使用什么格式
   * @param indexOrName 索引或参数名
   */
  formatForTranslation(indexOrName: number | string): string {
    const id = typeof indexOrName === 'number' ? indexOrName.toString() : indexOrName;
    
    switch (this.config.translationFormat) {
      case 'xml':
        // XML 标签格式，大多数翻译 API 会保留
        return `<ph id="${id}"/>`;
      case 'bracket':
        // 方括号格式
        return `[${id}]`;
      case 'custom':
        // 自定义格式
        const prefix = this.config.translationPrefix ?? '__PH';
        const suffix = this.config.translationSuffix ?? '__';
        return `${prefix}${id}${suffix}`;
      default:
        // 不转换，使用原格式
        if (typeof indexOrName === 'number') {
          return this.formatPlaceholder(indexOrName);
        }
        return this.formatPlaceholder(0, indexOrName);
    }
  }

  /**
   * 获取匹配标准占位符的正则表达式
   * 支持索引格式 {{0}} 和命名格式 {{name}}
   */
  getPlaceholderRegex(): RegExp {
    const prefix = this.escapeRegex(this.config.prefix);
    const suffix = this.escapeRegex(this.config.suffix);
    // 匹配数字或标识符
    return new RegExp(`${prefix}(\\d+|[a-zA-Z_][a-zA-Z0-9_]*)${suffix}`, 'g');
  }

  /**
   * 获取匹配翻译格式占位符的正则表达式
   * 支持索引和命名参数
   */
  getTranslationFormatRegex(): RegExp {
    // 匹配数字或标识符
    const idPattern = '(\\d+|[a-zA-Z_][a-zA-Z0-9_]*)';
    
    switch (this.config.translationFormat) {
      case 'xml':
        // 翻译 API 可能会修改 XML 标签格式，需要匹配多种变体：
        // <ph id="0"/> <phid="0"/> <ph id=0/> <ph id="0" /> <ph id="name"/> 等
        return new RegExp(`<ph\\s*id\\s*=\\s*"?${idPattern}"?\\s*\\/>`, 'gi');
      case 'bracket':
        return new RegExp(`\\[${idPattern}\\]`, 'g');
      case 'custom':
        const prefix = this.escapeRegex(this.config.translationPrefix ?? '__PH');
        const suffix = this.escapeRegex(this.config.translationSuffix ?? '__');
        return new RegExp(`${prefix}${idPattern}${suffix}`, 'g');
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
    return text.replace(regex, (_, idOrName) => {
      // 如果是数字，转换为数字；否则保持字符串
      const id = /^\d+$/.test(idOrName) ? parseInt(idOrName, 10) : idOrName;
      return this.formatForTranslation(id);
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
    return text.replace(regex, (_, idOrName) => {
      // 如果是数字，使用索引格式；否则使用命名格式
      if (/^\d+$/.test(idOrName)) {
        return this.formatPlaceholder(parseInt(idOrName, 10));
      }
      return this.formatPlaceholder(0, idOrName);
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

