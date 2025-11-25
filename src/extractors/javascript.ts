import { readFileSync } from 'fs';
import { parse } from '@babel/parser';
const traverse = require('@babel/traverse').default;
import * as t from '@babel/types';
import { BaseExtractor } from './base';
import { ExtractedText } from '../types';

export class JavaScriptExtractor extends BaseExtractor {
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
            path.node.quasis.forEach((quasi: any, index: any) => {
              const { value, loc } = quasi;
              if (this.isValidText(value.raw)) {
                extractedTexts.push(
                  this.createExtractedText(
                    value.raw,
                    filePath,
                    loc?.start.line || 0,
                    loc?.start.column || 0,
                    'template'
                  )
                );
              }
            });
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

