import * as parser from '@babel/parser';
import * as t from '@babel/types';
import { I18nConfig } from '@must/types';
import * as fs from 'fs';
import * as path from 'path';

const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;

export interface TransformResult {
  code: string;
  modified: boolean;
  translations: Map<string, string>;  // 文本 -> key 的映射
}

export class CodeTransformer {
  private config: I18nConfig;
  private keyMap: Map<string, string>;  // 文本 -> key 的映射

  constructor(config: I18nConfig, keyMap: Map<string, string>) {
    this.config = config;
    this.keyMap = keyMap;
  }

  /**
   * 转换文件中的硬编码文本
   */
  async transform(code: string, filePath: string): Promise<TransformResult> {
    if (!this.config.transform?.enabled) {
      return { code, modified: false, translations: new Map() };
    }

    const ext = filePath.split('.').pop();
    const isTSX = ext === 'tsx' || ext === 'jsx';

    try {
      // 解析代码
      const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: [
          'typescript',
          'jsx',
        ]
      });

      let modified = false;
      const translations = new Map<string, string>();
      const wrapperFunction = this.config.transform.wrapperFunction || 't';
      let hasI18nImport = false;
      let hasUseTranslation = false;

      // 检查是否已有 import
      traverse(ast, {
        ImportDeclaration: (nodePath: any) => {
          const importSource = nodePath.node.source.value;
          if (importSource === 'react-i18next') {
            hasI18nImport = true;
            const specifiers = nodePath.node.specifiers;
            for (const spec of specifiers) {
              if (t.isImportSpecifier(spec)) {
                const imported = spec.imported;
                if (t.isIdentifier(imported) && imported.name === 'useTranslation') {
                  hasUseTranslation = true;
                }
              }
            }
          }
        }
      });

      // 遍历并替换字符串
      traverse(ast, {
        // 处理普通字符串
        StringLiteral: (nodePath: any) => {
          const text = nodePath.node.value;
          const key = this.keyMap.get(text);

          if (key && this.shouldTransform(nodePath)) {
            translations.set(text, key);

            // 使用 t(key) 替换
            const callExpression = t.callExpression(
              t.identifier(wrapperFunction),
              [t.stringLiteral(key)]
            );

            // 如果是 JSX 属性值，需要包裹在 JSXExpressionContainer 中
            if (nodePath.parent && t.isJSXAttribute(nodePath.parent)) {
              nodePath.replaceWith(t.jsxExpressionContainer(callExpression));
            } else {
              nodePath.replaceWith(callExpression);
            }
            modified = true;
          }
        },
        // 处理模板字符串
        TemplateLiteral: (nodePath: any) => {
          if (!this.shouldTransformTemplate(nodePath)) return;

          const { quasis, expressions } = nodePath.node;
          
          // 只处理包含中文的模板字符串
          const hasChineseText = quasis.some((quasi: any) => 
            /[\u4e00-\u9fa5]/.test(quasi.value.raw)
          );
          
          if (!hasChineseText) return;

          // 构建完整的模板字符串文本（用于查找 key）
          let fullText = '';
          quasis.forEach((quasi: any, index: number) => {
            fullText += quasi.value.raw;
            if (index < expressions.length) {
              fullText += `{{${index}}}`;  // 用占位符替代变量
            }
          });

          const key = this.keyMap.get(fullText.trim());
          if (!key) return;

          translations.set(fullText.trim(), key);

          // 构建 t(key, { 0: expr0, 1: expr1, ... })
          const interpolationObj = t.objectExpression(
            expressions.map((expr: any, index: number) => 
              t.objectProperty(
                t.identifier(String(index)),
                expr
              )
            )
          );

          const callExpression = expressions.length > 0
            ? t.callExpression(
                t.identifier(wrapperFunction),
                [t.stringLiteral(key), interpolationObj]
              )
            : t.callExpression(
                t.identifier(wrapperFunction),
                [t.stringLiteral(key)]
              );

          nodePath.replaceWith(callExpression);
          modified = true;
        },
        // 处理 JSX 文本
        JSXText: (nodePath: any) => {
          const text = nodePath.node.value.trim();
          if (!text) return;

          const key = this.keyMap.get(text);
          if (key) {
            translations.set(text, key);

            // JSX 中需要用 {t(key)} 包裹
            const callExpression = t.callExpression(
              t.identifier(wrapperFunction),
              [t.stringLiteral(key)]
            );

            const jsxExpression = t.jsxExpressionContainer(callExpression);
            nodePath.replaceWith(jsxExpression);
            modified = true;
          }
        },
        // 处理 JSX 属性中的模板字符串
        JSXExpressionContainer: (nodePath: any) => {
          const expr = nodePath.node.expression;
          if (!t.isTemplateLiteral(expr)) return;

          const { quasis, expressions } = expr;
          
          // 只处理包含中文的模板字符串
          const hasChineseText = quasis.some((quasi: any) => 
            /[\u4e00-\u9fa5]/.test(quasi.value.raw)
          );
          
          if (!hasChineseText) return;

          // 构建完整的模板字符串文本
          let fullText = '';
          quasis.forEach((quasi: any, index: number) => {
            fullText += quasi.value.raw;
            if (index < expressions.length) {
              fullText += `{{${index}}}`;
            }
          });

          const key = this.keyMap.get(fullText.trim());
          if (!key) return;

          translations.set(fullText.trim(), key);

          // 构建 t(key, { 0: expr0, 1: expr1, ... })
          const interpolationObj = t.objectExpression(
            expressions.map((expr: any, index: number) => 
              t.objectProperty(
                t.identifier(String(index)),
                expr
              )
            )
          );

          const callExpression = expressions.length > 0
            ? t.callExpression(
                t.identifier(wrapperFunction),
                [t.stringLiteral(key), interpolationObj]
              )
            : t.callExpression(
                t.identifier(wrapperFunction),
                [t.stringLiteral(key)]
              );

          nodePath.node.expression = callExpression;
          modified = true;
        }
      });

      // 如果修改了代码且没有导入，添加 import
      if (modified && !hasI18nImport) {
        const importStatement = this.config.transform.importStatement || 
          `import { useTranslation } from 'react-i18next';`;
        
        // 解析 import 语句
        const importAST = parser.parse(importStatement, {
          sourceType: 'module'
        });

        const importDeclaration = importAST.program.body[0];
        if (t.isImportDeclaration(importDeclaration)) {
          // 找到最后一个 import 语句的位置
          let lastImportIndex = -1;
          ast.program.body.forEach((node: any, index: number) => {
            if (t.isImportDeclaration(node)) {
              lastImportIndex = index;
            }
          });

          // 在最后一个 import 后插入
          if (lastImportIndex >= 0) {
            ast.program.body.splice(lastImportIndex + 1, 0, importDeclaration);
          } else {
            ast.program.body.unshift(importDeclaration);
          }
        }
      }

      // 生成新代码
      const output = generate(ast, {
        retainLines: false,
        comments: true,
        jsescapeOption: {
          minimal: true
        }
      });

      let resultCode = output.code;

      // 格式化代码
      if (this.config.transform.formatCode !== false) {
        resultCode = await this.formatCode(resultCode, filePath);
      }

      return {
        code: resultCode,
        modified,
        translations
      };
    } catch (error) {
      console.warn(`Failed to transform ${filePath}:`, error);
      return { code, modified: false, translations: new Map() };
    }
  }

  /**
   * 格式化代码
   */
  private async formatCode(code: string, filePath: string): Promise<string> {
    try {
      // 尝试使用项目的 prettier
      const prettierPath = this.findPrettier();
      if (prettierPath) {
        const prettier = require(prettierPath);
        
        // 尝试加载项目的 prettier 配置
        const prettierConfig = await prettier.resolveConfig(filePath) || {};
        
        return prettier.format(code, {
          ...prettierConfig,
          filepath: filePath,
          parser: filePath.endsWith('.tsx') || filePath.endsWith('.jsx') 
            ? 'typescript' 
            : 'babel'
        });
      }
    } catch (error) {
      // prettier 格式化失败，返回原代码
      console.warn('Prettier formatting failed:', error);
    }
    
    return code;
  }

  /**
   * 查找项目中的 prettier
   */
  private findPrettier(): string | null {
    const possiblePaths = [
      path.join(process.cwd(), 'node_modules', 'prettier'),
      path.join(process.cwd(), '..', 'node_modules', 'prettier'),
      'prettier'
    ];

    for (const p of possiblePaths) {
      try {
        require.resolve(p);
        return p;
      } catch {
        continue;
      }
    }

    return null;
  }

  /**
   * 判断是否应该转换这个字符串
   */
  private shouldTransform(nodePath: any): boolean {
    // 不转换 import 语句中的字符串
    if (nodePath.findParent((p: any) => t.isImportDeclaration(p.node))) {
      return false;
    }

    // 不转换 className 等属性
    if (nodePath.parent && t.isJSXAttribute(nodePath.parent)) {
      const attrName = nodePath.parent.name;
      if (t.isJSXIdentifier(attrName)) {
        const skipAttrs = ['className', 'class', 'id', 'key', 'ref', 'style', 'src', 'href', 'type', 'name', 'placeholder'];
        if (skipAttrs.includes(attrName.name)) {
          return false;
        }
      }
    }

    // 不转换对象的 key
    if (nodePath.parent && t.isObjectProperty(nodePath.parent) && nodePath.parent.key === nodePath.node) {
      return false;
    }

    // 不转换 console.log 等调试语句
    if (nodePath.findParent((p: any) => {
      if (t.isCallExpression(p.node)) {
        const callee = p.node.callee;
        if (t.isMemberExpression(callee) && t.isIdentifier(callee.object) && callee.object.name === 'console') {
          return true;
        }
      }
      return false;
    })) {
      return false;
    }

    return true;
  }

  /**
   * 判断是否应该转换模板字符串
   */
  private shouldTransformTemplate(nodePath: any): boolean {
    // 不转换 import 语句
    if (nodePath.findParent((p: any) => t.isImportDeclaration(p.node))) {
      return false;
    }

    // 不转换 tagged template literals (如 styled-components)
    if (nodePath.parent && t.isTaggedTemplateExpression(nodePath.parent)) {
      return false;
    }

    return true;
  }
}
