import { readFileSync } from 'fs';
import { parse } from '@babel/parser';
const traverse = require('@babel/traverse').default;
import * as t from '@babel/types';
import { BaseExtractor, ExtractorConfig } from './base';
import { ExtractedText } from '@must/types';

export class JavaScriptExtractor extends BaseExtractor {
  constructor(config: ExtractorConfig = {}) {
    super(config);
  }

  async extract(filePath: string): Promise<ExtractedText[]> {
    const extractedTexts: ExtractedText[] = [];

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
            
            // 构建完整的模板字符串，用可配置的占位符格式替代表达式
            let fullTemplate = '';
            quasis.forEach((quasi: any, index: number) => {
              fullTemplate += quasi.value.raw;
              if (index < expressions.length) {
                fullTemplate += this.formatPlaceholder(index);
              }
            });
            
            if (this.isValidText(fullTemplate)) {
              extractedTexts.push(
                this.createExtractedText(
                  fullTemplate,
                  filePath,
                  loc?.start.line || 0,
                  loc?.start.column || 0,
                  'template'
                )
              );
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
      console.warn(`Failed to parse ${filePath}:`, error);
    }

    return extractedTexts;
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
        result += this.formatPlaceholder(expressionIndex);
        expressionIndex++;
      }
    }

    // 只有当包含有效的中文文本时才返回
    return hasValidText ? result.trim() : null;
  }
}
