import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import { I18nConfig } from '@must/types';

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
  transform(code: string, filePath: string): TransformResult {
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
          ...(isTSX ? ['jsx'] as const : [])
        ]
      });

      let modified = false;
      const translations = new Map<string, string>();
      const wrapperFunction = this.config.transform.wrapperFunction || 't';
      let hasImport = false;

      // 检查是否已有 import
      traverse(ast, {
        ImportDeclaration: (path: any) => {
          const importSource = path.node.source.value;
          if (importSource === 'react-i18next') {
            // 检查是否已经导入了 wrapperFunction
            const specifiers = path.node.specifiers;
            for (const spec of specifiers) {
              if (t.isImportSpecifier(spec)) {
                const imported = spec.imported;
                if (t.isIdentifier(imported) && imported.name === wrapperFunction) {
                  hasImport = true;
                  break;
                }
              }
            }
          }
        }
      });

      // 遍历并替换字符串
      traverse(ast, {
        StringLiteral: (path: any) => {
          const text = path.node.value;
          const key = this.keyMap.get(text);

          if (key && this.shouldTransform(path)) {
            translations.set(text, key);
            
            // 如果有自定义转换函数
            if (this.config.transform?.customTransform) {
              const result = this.config.transform.customTransform({
                text,
                key,
                sourceCode: code,
                filePath
              });
              // 这里需要解析 result 并替换，暂时使用默认方式
            }

            // 使用 t(key) 替换
            const callExpression = t.callExpression(
              t.identifier(wrapperFunction),
              [t.stringLiteral(key)]
            );

            path.replaceWith(callExpression);
            modified = true;
          }
        },
        JSXText: (path: any) => {
          const text = path.node.value.trim();
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
            path.replaceWith(jsxExpression);
            modified = true;
          }
        }
      });

      // 如果修改了代码且没有导入，添加 import
      if (modified && !hasImport) {
        const importStatement = this.config.transform.importStatement || 
          `import { ${wrapperFunction} } from 'react-i18next';`;
        
        // 解析 import 语句
        const importAST = parser.parse(importStatement, {
          sourceType: 'module'
        });

        const importDeclaration = importAST.program.body[0];
        if (t.isImportDeclaration(importDeclaration)) {
          ast.program.body.unshift(importDeclaration);
        }
      }

      // 生成新代码
      const output = generate(ast, {
        retainLines: true,
        comments: true
      });

      return {
        code: output.code,
        modified,
        translations
      };
    } catch (error) {
      console.warn(`Failed to transform ${filePath}:`, error);
      return { code, modified: false, translations: new Map() };
    }
  }

  /**
   * 判断是否应该转换这个字符串
   */
  private shouldTransform(path: any): boolean {
    // 不转换 import 语句中的字符串
    if (path.findParent((p: any) => t.isImportDeclaration(p.node))) {
      return false;
    }

    // 不转换 className 等属性
    if (path.parent && t.isJSXAttribute(path.parent)) {
      const attrName = path.parent.name;
      if (t.isJSXIdentifier(attrName)) {
        const skipAttrs = ['className', 'class', 'id', 'key', 'ref', 'style', 'src', 'href'];
        if (skipAttrs.includes(attrName.name)) {
          return false;
        }
      }
    }

    // 不转换对象的 key
    if (path.parent && t.isObjectProperty(path.parent) && path.parent.key === path.node) {
      return false;
    }

    return true;
  }
}

