import { ExtractedText, ExtractorOptions, InterpolationConfig, ExtractionWarning, ExtractionWarningSeverity } from '../types';
import { InterpolationHandler, createInterpolationHandler } from '../utils/interpolation';

export interface ExtractorConfig {
  options?: ExtractorOptions;
  sourceLanguage?: string;  // 源语言，用于过滤文本
  interpolation?: InterpolationConfig;  // 插值配置
}

export interface ExtractResult {
  texts: ExtractedText[];
  warnings: ExtractionWarning[];
}

export abstract class BaseExtractor {
  protected options: ExtractorOptions;
  protected sourceLanguage: string;
  protected interpolation: InterpolationHandler;
  protected warnings: ExtractionWarning[] = [];

  constructor(config: ExtractorConfig = {}) {
    this.options = {
      includeComments: false,
      includeTemplateLiterals: true,
      includeJSX: true,
      includeVue: true,
      includeHTML: true,
      ...config.options
    };
    this.sourceLanguage = config.sourceLanguage || 'zh-CN';
    this.interpolation = createInterpolationHandler(config.interpolation);
  }

  /**
   * 清空警告列表
   */
  protected clearWarnings(): void {
    this.warnings = [];
  }

  /**
   * 获取所有警告
   */
  public getWarnings(): ExtractionWarning[] {
    return [...this.warnings];
  }

  /**
   * 添加警告
   */
  protected addWarning(
    type: ExtractionWarning['type'],
    severity: ExtractionWarningSeverity,
    message: string,
    file: string,
    line: number,
    column: number,
    code?: string,
    suggestion?: string
  ): void {
    this.warnings.push({
      type,
      severity,
      message,
      file,
      line,
      column,
      code,
      suggestion
    });
  }

  /**
   * 分析表达式复杂度并返回警告信息（如果需要）
   */
  protected analyzeExpressionComplexity(
    expression: any,
    file: string,
    line: number,
    column: number
  ): { isComplex: boolean; name?: string } {
    // 简单标识符
    if (expression.type === 'Identifier') {
      return { isComplex: false, name: expression.name };
    }

    // 简单成员表达式: user.name
    if (expression.type === 'MemberExpression') {
      if (!expression.computed) {
        const objectName = this.extractExpressionName(expression.object);
        const propertyName = expression.property.type === 'Identifier' 
          ? expression.property.name 
          : undefined;
        if (objectName && propertyName) {
          return { isComplex: false, name: `${objectName}_${propertyName}` };
        }
      }
      // 动态成员访问: obj[key]
      this.addWarning(
        'complex-expression',
        'warning',
        '动态成员访问表达式，无法静态提取变量名',
        file, line, column,
        this.getExpressionCode(expression),
        '建议将表达式结果先赋值给变量，再在模板中使用'
      );
      return { isComplex: true };
    }

    // 嵌套模板字符串
    if (expression.type === 'TemplateLiteral') {
      this.addWarning(
        'nested-template',
        'warning',
        '嵌套的模板字符串，难以提取和翻译',
        file, line, column,
        this.getExpressionCode(expression),
        '建议将嵌套的模板字符串拆分为独立的翻译单元'
      );
      return { isComplex: true };
    }

    // 条件表达式: a ? b : c
    if (expression.type === 'ConditionalExpression') {
      this.addWarning(
        'conditional-expression',
        'warning',
        '条件表达式，翻译结果可能不一致',
        file, line, column,
        this.getExpressionCode(expression),
        '建议将条件表达式移到模板外部，或拆分为多个独立的翻译'
      );
      return { isComplex: true };
    }

    // 函数调用
    if (expression.type === 'CallExpression') {
      // 检查是否是简单的格式化函数
      const calleeName = expression.callee.type === 'Identifier' 
        ? expression.callee.name 
        : undefined;
      
      // 允许一些常见的格式化函数
      const allowedFunctions = ['String', 'Number', 'toString', 'toFixed', 'toLocaleString'];
      if (calleeName && allowedFunctions.includes(calleeName)) {
        return { isComplex: false, name: `formatted` };
      }

      this.addWarning(
        'function-call',
        'info',
        '函数调用表达式，无法静态分析返回值',
        file, line, column,
        this.getExpressionCode(expression),
        '建议将函数调用结果先赋值给变量，再在模板中使用'
      );
      return { isComplex: true };
    }

    // 二元表达式: a + b, a - b
    if (expression.type === 'BinaryExpression') {
      this.addWarning(
        'binary-expression',
        'info',
        '二元表达式，无法静态分析计算结果',
        file, line, column,
        this.getExpressionCode(expression),
        '建议将计算结果先赋值给变量，再在模板中使用'
      );
      return { isComplex: true };
    }

    // 其他复杂表达式
    this.addWarning(
      'complex-expression',
      'info',
      `复杂表达式类型: ${expression.type}`,
      file, line, column,
      this.getExpressionCode(expression),
      '建议简化表达式或将结果先赋值给变量'
    );
    return { isComplex: true };
  }

  /**
   * 获取表达式的代码片段（简化版）
   */
  private getExpressionCode(expression: any): string {
    try {
      // 尝试从位置信息构建代码预览
      if (expression.start !== undefined && expression.end !== undefined) {
        return `[${expression.type}]`;
      }
      return `[${expression.type}]`;
    } catch {
      return '[unknown]';
    }
  }

  /**
   * 生成占位符
   * @param index 占位符索引
   * @param name 变量名（用于命名参数模式）
   */
  protected formatPlaceholder(index: number, name?: string): string {
    return this.interpolation.formatPlaceholder(index, name);
  }

  /**
   * 是否使用命名参数
   */
  protected get useNamedParams(): boolean {
    return this.interpolation.useNamedParams;
  }

  /**
   * 从表达式节点提取变量名
   */
  protected extractExpressionName(expression: any): string | undefined {
    // 简单标识符: username
    if (expression.type === 'Identifier') {
      return expression.name;
    }
    // 成员表达式: user.name -> 'user_name'
    if (expression.type === 'MemberExpression') {
      const object = this.extractExpressionName(expression.object);
      const property = expression.property.type === 'Identifier' 
        ? expression.property.name 
        : undefined;
      if (object && property) {
        return `${object}_${property}`;
      }
    }
    return undefined;
  }

  abstract extract(filePath: string): Promise<ExtractedText[]>;

  protected createExtractedText(
    text: string,
    file: string,
    line: number,
    column: number,
    type: ExtractedText['type'],
    context?: string
  ): ExtractedText {
    return {
      text: text.trim(),
      file,
      line,
      column,
      context,
      type
    };
  }

  protected isValidText(text: string): boolean {
    // 去除模板占位符后检查文本
    const placeholderRegex = this.interpolation.getPlaceholderRegex();
    const textWithoutPlaceholders = text.replace(placeholderRegex, '');

    // Filter out very short texts, numbers, and special characters
    if (textWithoutPlaceholders.trim().length < 2) return false;
    if (/^[0-9\s\-_\.]+$/.test(textWithoutPlaceholders)) return false;
    if (/^[a-zA-Z]{1,2}$/.test(textWithoutPlaceholders.trim())) return false;

    // Filter out URLs and paths
    if (/^(https?:\/\/|\/|\.\/|\.\.\/|~\/)/.test(text)) return false;
    if (/^[@\.][\w\-\/]+/.test(text)) return false; // npm packages, relative paths

    // Filter out file extensions
    if (/^\.[a-z]{2,4}$/i.test(text)) return false;

    // Filter out hex colors
    if (/^#[0-9a-f]{3,8}$/i.test(text)) return false;

    // 根据源语言决定提取策略
    // 目前只支持中文作为源语言，只提取包含中文的文本
    // 未来可以扩展支持英文等其他语言
    if (this.sourceLanguage.startsWith('zh')) {
      // 中文源语言：必须包含中文字符
      return /[\u4e00-\u9fa5]/.test(textWithoutPlaceholders);
    }

    // 日文源语言：必须包含日文字符（平假名、片假名、汉字）
    if (this.sourceLanguage.startsWith('ja')) {
      return /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fa5]/.test(textWithoutPlaceholders);
    }

    // 韩文源语言：必须包含韩文字符
    if (this.sourceLanguage.startsWith('ko')) {
      return /[\uac00-\ud7af\u1100-\u11ff]/.test(textWithoutPlaceholders);
    }

    // 其他语言（如英文）：暂不支持，返回 false
    // 英文文案和代码本身都是英文，不好区分，未来再扩展
    return false;
  }
}

