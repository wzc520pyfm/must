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

      traverse(ast, {
        StringLiteral: (path: any) => {
          // 跳过 JSX 属性中的字符串（如 className, id 等）
          if (path.parent && t.isJSXAttribute(path.parent)) {
            const attrName = path.parent.name;
            if (t.isJSXIdentifier(attrName)) {
              const skipAttrs = ['className', 'class', 'id', 'key', 'ref', 'style', 'src', 'href', 'type', 'name', 'htmlFor', 'role', 'aria-label', 'data-testid'];
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
            
            // 构建完整的模板字符串，用 {{index}} 替代表达式占位符
            let fullTemplate = '';
            quasis.forEach((quasi: any, index: number) => {
              fullTemplate += quasi.value.raw;
              if (index < expressions.length) {
                // 使用 {{index}} 作为占位符，后续可以转换为 i18next 的插值格式
                fullTemplate += `{{${index}}}`;
              }
            });
            
            // 只有当模板包含有效的中文文本时才提取
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
        JSXText: (path: any) => {
          if (this.options.includeJSX) {
            const { value, loc } = path.node;
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
}

