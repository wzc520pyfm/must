import { readFileSync } from 'fs';
import { parse } from '@babel/parser';
const traverse = require('@babel/traverse').default;
import * as t from '@babel/types';
import { BaseExtractor, ExtractorConfig } from './base';
import { ExtractedText } from '../types';

export class VueExtractor extends BaseExtractor {
  constructor(config: ExtractorConfig = {}) {
    super(config);
  }
  async extract(filePath: string): Promise<ExtractedText[]> {
    const extractedTexts: ExtractedText[] = [];

    try {
      const content = readFileSync(filePath, 'utf-8');

      // Extract script content
      const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
      if (scriptMatch) {
        const scriptContent = scriptMatch[1];
        const scriptTexts = await this.extractJavaScriptContent(scriptContent, filePath);
        extractedTexts.push(...scriptTexts);
      }

      // Extract template content
      const templateMatch = content.match(/<template[^>]*>([\s\S]*?)<\/template>/);
      if (templateMatch) {
        const templateContent = templateMatch[1];
        const templateTexts = this.extractTemplateContent(templateContent, filePath);
        extractedTexts.push(...templateTexts);
      }

    } catch (error) {
      console.warn(`Failed to parse Vue file ${filePath}:`, error);
    }

    return extractedTexts;
  }

  private async extractJavaScriptContent(content: string, filePath: string): Promise<ExtractedText[]> {
    const extractedTexts: ExtractedText[] = [];

    try {
      const ast = parse(content, {
        sourceType: 'module',
        allowImportExportEverywhere: true,
        plugins: [
          'jsx',
          'typescript',
          'decorators-legacy',
          'classProperties',
          'objectRestSpread'
        ]
      });

      traverse(ast, {
        StringLiteral: (path: any) => {
          const { value, loc } = path.node;
          if (this.isValidText(value)) {
            extractedTexts.push(
              this.createExtractedText(
                value,
                filePath,
                loc?.start.line || 0,
                loc?.start.column || 0,
                'vue'
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
                  'vue'
                )
              );
            }
          }
        }
      });
    } catch (error) {
      console.warn(`Failed to parse JavaScript in Vue file:`, error);
    }

    return extractedTexts;
  }

  private extractTemplateContent(content: string, filePath: string): ExtractedText[] {
    const extractedTexts: ExtractedText[] = [];

    // Extract text content from HTML-like template
    const textRegex = />([^<>\{\}]+)</g;
    let match;
    let lineNumber = 1;

    while ((match = textRegex.exec(content)) !== null) {
      const text = match[1].trim();
      if (this.isValidText(text)) {
        // Calculate approximate line number
        const beforeMatch = content.substring(0, match.index);
        const lineNum = beforeMatch.split('\n').length;

        extractedTexts.push(
          this.createExtractedText(
            text,
            filePath,
            lineNum,
            0,
            'html'
          )
        );
      }
    }

    return extractedTexts;
  }
}

