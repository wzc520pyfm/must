import { readFileSync } from 'fs';
import { parse } from '@babel/parser';
const traverse = require('@babel/traverse').default;
import * as t from '@babel/types';
import { BaseExtractor, ExtractorConfig, ExtractResult } from './base';
import { ExtractedText } from '@must/types';
import generate from '@babel/generator';

export class JavaScriptExtractor extends BaseExtractor {
  constructor(config: ExtractorConfig = {}) {
    super(config);
  }

  async extract(filePath: string): Promise<ExtractedText[]> {
    const result = await this.extractWithWarnings(filePath);
    return result.texts;
  }

  async extractWithWarnings(filePath: string): Promise<ExtractResult> {
    const extractedTexts: ExtractedText[] = [];
    this.clearWarnings();

    try {
      const code = readFileSync(filePath, 'utf-8');
      const ast = parse(code, {
        sourceType: 'module',
        allowImportExportEverywhere: true,
        allowReturnOutsideFunction: true,
        plugins: [
          'jsx',
          'typescript',
          'decorators-legacy',
          'classProperties',
          'objectRestSpread',
          'functionBind',
          'exportDefaultFrom',
          'exportNamespaceFrom',
          'dynamicImport',
          'nullishCoalescingOperator',
          'optionalChaining'
        ]
      });

      // 记录已处理的 JSX 元素，避免重复提取
      const processedJSXElements = new Set<any>();

      traverse(ast, {
        StringLiteral: (path: any) => {
          // 跳过 JSX 属性中不需要翻译的字符串（如 className, id 等）
          if (path.parent && t.isJSXAttribute(path.parent)) {
            const attrName = path.parent.name;
            if (t.isJSXIdentifier(attrName)) {
              // 只跳过技术性属性，placeholder、title、alt 等需要翻译
              const skipAttrs = ['className', 'class', 'id', 'key', 'ref', 'style', 'src', 'href', 'type', 'name', 'htmlFor', 'role', 'data-testid'];
              if (skipAttrs.includes(attrName.name) || attrName.name.startsWith('data-')) {
                return;
              }
            }
          }

          const { value, loc } = path.node;
          if (this.isValidText(value)) {
            extractedTexts.push(
              this.createExtractedText(
                value,
                filePath,
                loc?.start.line || 0,
                loc?.start.column || 0,
                'string'
              )
            );
          }
        },

        TemplateLiteral: (path: any) => {
          if (this.options.includeTemplateLiterals) {
            const { quasis, expressions, loc } = path.node;
            const line = loc?.start.line || 0;
            const column = loc?.start.column || 0;

            // 检查插值数量
            if (expressions.length > 10) {
              this.addWarning(
                'too-many-interpolations',
                'warning',
                `模板字符串包含 ${expressions.length} 个插值，可能过于复杂`,
                filePath, line, column,
                this.getNodeCode(path.node),
                '建议拆分为多个独立的翻译单元，或简化模板结构'
              );
            }

            // 构建完整的模板字符串，用可配置的占位符格式替代表达式
            let fullTemplate = '';
            const paramNames: string[] = [];
            let hasComplexExpression = false;

            quasis.forEach((quasi: any, index: number) => {
              fullTemplate += quasi.value.raw;
              if (index < expressions.length) {
                const expr = expressions[index];

                // 分析表达式复杂度
                const analysis = this.analyzeExpressionComplexity(
                  expr,
                  filePath,
                  expr.loc?.start.line || line,
                  expr.loc?.start.column || column
                );

                if (analysis.isComplex) {
                  hasComplexExpression = true;
                }

                // 尝试提取变量名（用于命名参数模式）
                const exprName = analysis.name || this.extractExpressionName(expr);
                paramNames.push(exprName || `p${index}`);

                // 如果使用命名参数，使用变量名；否则使用索引
                fullTemplate += this.formatPlaceholder(index, exprName);
              }
            });

            if (this.isValidText(fullTemplate)) {
              const extracted = this.createExtractedText(
                fullTemplate,
                filePath,
                line,
                column,
                'template'
              );
              // 将参数名和复杂度信息存储在 context 中
              const contextData: any = {};
              if (paramNames.length > 0) {
                contextData.paramNames = paramNames;
              }
              if (hasComplexExpression) {
                contextData.hasComplexExpression = true;
              }
              if (Object.keys(contextData).length > 0) {
                extracted.context = JSON.stringify(contextData);
              }
              extractedTexts.push(extracted);
            }
          }
        },

        // 处理 JSX 元素，合并连续的文本和表达式
        JSXElement: (path: any) => {
          if (!this.options.includeJSX) return;
          if (processedJSXElements.has(path.node)) return;

          const children = path.node.children;
          if (!children || children.length === 0) return;

          // 检查是否有混合内容（文本 + 表达式）
          const hasText = children.some((child: any) =>
            t.isJSXText(child) && this.isValidText(child.value)
          );
          const hasExpression = children.some((child: any) =>
            t.isJSXExpressionContainer(child) && !t.isJSXEmptyExpression(child.expression)
          );

          // 如果有混合内容，尝试合并为一个模板
          if (hasText && hasExpression) {
            const mergedText = this.mergeJSXChildren(children);
            if (mergedText && this.isValidText(mergedText)) {
              processedJSXElements.add(path.node);
              extractedTexts.push(
                this.createExtractedText(
                  mergedText,
                  filePath,
                  path.node.loc?.start.line || 0,
                  path.node.loc?.start.column || 0,
                  'jsx'
                )
              );
              return;
            }
          }

          // 否则单独处理每个 JSXText
          children.forEach((child: any) => {
            if (t.isJSXText(child)) {
              const text = child.value.trim();
              if (text && this.isValidText(text)) {
                extractedTexts.push(
                  this.createExtractedText(
                    text,
                    filePath,
                    child.loc?.start.line || 0,
                    child.loc?.start.column || 0,
                    'jsx'
                  )
                );
              }
            }
          });
        },

        JSXExpressionContainer: (path: any) => {
          if (this.options.includeJSX && t.isStringLiteral(path.node.expression)) {
            const { value, loc } = path.node.expression;
            if (this.isValidText(value)) {
              extractedTexts.push(
                this.createExtractedText(
                  value,
                  filePath,
                  loc?.start.line || 0,
                  loc?.start.column || 0,
                  'jsx'
                )
              );
            }
          }
        }
      });

    } catch (error) {
      this.addWarning(
        'parse-error',
        'error',
        `解析文件失败: ${error instanceof Error ? error.message : String(error)}`,
        filePath, 0, 0,
        undefined,
        '检查文件语法是否正确'
      );
      console.warn(`Failed to parse ${filePath}:`, error);
    }

    return {
      texts: extractedTexts,
      warnings: this.getWarnings()
    };
  }

  /**
   * 获取 AST 节点对应的源代码
   */
  private getNodeCode(node: any): string {
    try {
      const result = generate(node, { compact: true });
      // 限制长度
      const code = result.code;
      if (code.length > 100) {
        return code.substring(0, 100) + '...';
      }
      return code;
    } catch {
      return '[无法获取代码]';
    }
  }

  /**
   * 合并 JSX 子元素为一个带插值的字符串
   * 例如: "当前等级：" + {level} + " 级" => "当前等级：{{0}} 级"
   */
  private mergeJSXChildren(children: any[]): string | null {
    let result = '';
    let expressionIndex = 0;
    let hasValidText = false;

    for (const child of children) {
      if (t.isJSXText(child)) {
        const text = child.value;
        // 保留空格但去除纯换行
        const trimmed = text.replace(/^\s*\n\s*/g, '').replace(/\s*\n\s*$/g, '');
        if (trimmed) {
          result += trimmed;
          if (this.isValidText(trimmed)) {
            hasValidText = true;
          }
        }
      } else if (t.isJSXExpressionContainer(child) && !t.isJSXEmptyExpression(child.expression)) {
        // 跳过已经是 t() 调用的表达式
        if (t.isCallExpression(child.expression)) {
          const callee = child.expression.callee;
          if (t.isIdentifier(callee) && callee.name === 't') {
            return null; // 已经被翻译过，不需要再处理
          }
        }
        // 尝试提取变量名（用于命名参数模式）
        const exprName = this.extractExpressionName(child.expression);
        result += this.formatPlaceholder(expressionIndex, exprName);
        expressionIndex++;
      }
    }

    // 只有当包含有效的中文文本时才返回
    return hasValidText ? result.trim() : null;
  }
}
