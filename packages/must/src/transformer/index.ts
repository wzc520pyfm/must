import * as parser from '@babel/parser';
import * as t from '@babel/types';
import { I18nConfig, ImportConfig } from '@must/types';
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
   * 解析导入配置，支持字符串和对象两种格式
   */
  private parseImportConfig(): ImportConfig {
    const importStatement = this.config.transform?.importStatement;

    if (!importStatement) {
      // 默认配置
      return {
        global: "import { useTranslation } from 'react-i18next';",
        contextInjection: "const { t } = useTranslation();"
      };
    }

    if (typeof importStatement === 'string') {
      // 向后兼容：字符串格式只设置全局导入
      return {
        global: importStatement,
        contextInjection: "const { t } = useTranslation();"
      };
    }

    // 对象格式
    return {
      global: importStatement.global || "import { useTranslation } from 'react-i18next';",
      contextInjection: importStatement.contextInjection || "const { t } = useTranslation();"
    };
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
      const importConfig = this.parseImportConfig();

      let hasI18nImport = false;
      // 记录需要注入上下文的函数/组件
      const functionsNeedingInjection = new Set<any>();
      // 记录已经有上下文注入的函数（完整的，包含 t）
      const functionsWithInjection = new Set<any>();
      // 记录需要更新解构的 useTranslation 调用（有 useTranslation 但缺少 t）
      const useTranslationDeclarationsToUpdate: Array<{
        nodePath: any;
        funcNode: any;
      }> = [];

      // 第一遍：检查是否已有 import 和 useTranslation 调用
      traverse(ast, {
        ImportDeclaration: (nodePath: any) => {
          const importSource = nodePath.node.source.value;
          if (importSource === 'react-i18next' || importSource === 'i18next') {
            hasI18nImport = true;
          }
        },
        // 检查是否已经有 useTranslation 调用
        VariableDeclaration: (nodePath: any) => {
          const declarations = nodePath.node.declarations;
          for (const decl of declarations) {
            if (t.isCallExpression(decl.init)) {
              const callee = decl.init.callee;
              if (t.isIdentifier(callee) && callee.name === 'useTranslation') {
                // 找到包含此声明的函数
                const funcParent = nodePath.findParent((p: any) =>
                  t.isFunctionDeclaration(p.node) ||
                  t.isFunctionExpression(p.node) ||
                  t.isArrowFunctionExpression(p.node)
                );

                if (funcParent) {
                  // 检查解构中是否已经有 t
                  const hasT = this.checkHasDestructuredProperty(decl.id, wrapperFunction);

                  if (hasT) {
                    // 已经有完整的注入
                    functionsWithInjection.add(funcParent.node);
                  } else {
                    // 有 useTranslation 但缺少 t，需要更新
                    useTranslationDeclarationsToUpdate.push({
                      nodePath,
                      funcNode: funcParent.node
                    });
                    // 标记为已有注入，避免重复添加新的 useTranslation 调用
                    functionsWithInjection.add(funcParent.node);
                  }
                }
              }
            }
          }
        }
      });

      // 第二遍：遍历并替换字符串，同时记录需要注入的函数
      traverse(ast, {
        // 处理普通字符串
        StringLiteral: (nodePath: any) => {
          const text = nodePath.node.value;
          const key = this.keyMap.get(text);

          if (key && this.shouldTransform(nodePath)) {
            translations.set(text, key);

            // 记录包含此字符串的函数组件
            this.markFunctionForInjection(nodePath, functionsNeedingInjection);

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

          // 记录包含此模板字符串的函数组件
          this.markFunctionForInjection(nodePath, functionsNeedingInjection);

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

            // 记录包含此 JSX 文本的函数组件
            this.markFunctionForInjection(nodePath, functionsNeedingInjection);

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

          // 记录包含此模板字符串的函数组件
          this.markFunctionForInjection(nodePath, functionsNeedingInjection);

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

      // 如果修改了代码，添加必要的导入和上下文注入
      if (modified) {
        // 添加全局导入
        if (!hasI18nImport && importConfig.global) {
          this.addGlobalImport(ast, importConfig.global);
        }

        // 更新已有的 useTranslation 调用，添加缺少的 t
        for (const { nodePath, funcNode } of useTranslationDeclarationsToUpdate) {
          // 只有当这个函数需要注入时才更新
          if (functionsNeedingInjection.has(funcNode)) {
            this.updateUseTranslationDestructure(nodePath, wrapperFunction);
          }
        }

        // 添加上下文注入（到需要的函数中）
        if (importConfig.contextInjection) {
          this.addContextInjections(ast, functionsNeedingInjection, functionsWithInjection, importConfig.contextInjection);
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
   * 标记函数需要注入上下文
   */
  private markFunctionForInjection(nodePath: any, functionsNeedingInjection: Set<any>) {
    const funcParent = nodePath.findParent((p: any) =>
      t.isFunctionDeclaration(p.node) ||
      t.isFunctionExpression(p.node) ||
      t.isArrowFunctionExpression(p.node)
    );

    if (funcParent) {
      functionsNeedingInjection.add(funcParent.node);
    }
  }

  /**
   * 检查解构模式中是否已经有指定的属性
   */
  private checkHasDestructuredProperty(pattern: any, propertyName: string): boolean {
    if (t.isObjectPattern(pattern)) {
      return pattern.properties.some((prop: any) => {
        if (t.isObjectProperty(prop)) {
          const key = prop.key;
          if (t.isIdentifier(key) && key.name === propertyName) {
            return true;
          }
        }
        return false;
      });
    }
    return false;
  }

  /**
   * 更新 useTranslation 的解构，添加缺少的属性
   */
  private updateUseTranslationDestructure(nodePath: any, propertyName: string): void {
    const declarations = nodePath.node.declarations;
    for (const decl of declarations) {
      if (t.isCallExpression(decl.init)) {
        const callee = decl.init.callee;
        if (t.isIdentifier(callee) && callee.name === 'useTranslation') {
          // 如果是对象解构模式
          if (t.isObjectPattern(decl.id)) {
            // 检查是否已经有这个属性
            const hasProperty = this.checkHasDestructuredProperty(decl.id, propertyName);
            if (!hasProperty) {
              // 添加新的属性到解构中
              // 创建 shorthand 属性: { t } 而不是 { t: t }
              const newProperty = t.objectProperty(
                t.identifier(propertyName),
                t.identifier(propertyName),
                false, // computed
                true   // shorthand
              );
              decl.id.properties.push(newProperty);
            }
          }
        }
      }
    }
  }

  /**
   * 添加全局导入语句
   */
  private addGlobalImport(ast: any, importStatement: string) {
    try {
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
    } catch (error) {
      console.warn('Failed to add global import:', error);
    }
  }

  /**
   * 添加上下文注入到函数中
   */
  private addContextInjections(
    ast: any,
    functionsNeedingInjection: Set<any>,
    functionsWithInjection: Set<any>,
    contextInjection: string
  ) {
    try {
      // 解析上下文注入语句
      const injectionAST = parser.parse(contextInjection, {
        sourceType: 'module'
      });

      const injectionStatement = injectionAST.program.body[0];
      if (!injectionStatement) return;

      // 遍历 AST，找到需要注入的函数并添加语句
      traverse(ast, {
        FunctionDeclaration: (nodePath: any) => {
          if (functionsNeedingInjection.has(nodePath.node) && !functionsWithInjection.has(nodePath.node)) {
            this.injectToFunctionBody(nodePath, injectionStatement);
            functionsWithInjection.add(nodePath.node);
          }
        },
        FunctionExpression: (nodePath: any) => {
          if (functionsNeedingInjection.has(nodePath.node) && !functionsWithInjection.has(nodePath.node)) {
            this.injectToFunctionBody(nodePath, injectionStatement);
            functionsWithInjection.add(nodePath.node);
          }
        },
        ArrowFunctionExpression: (nodePath: any) => {
          if (functionsNeedingInjection.has(nodePath.node) && !functionsWithInjection.has(nodePath.node)) {
            this.injectToArrowFunction(nodePath, injectionStatement);
            functionsWithInjection.add(nodePath.node);
          }
        }
      });
    } catch (error) {
      console.warn('Failed to add context injection:', error);
    }
  }

  /**
   * 注入语句到普通函数体
   */
  private injectToFunctionBody(nodePath: any, injectionStatement: any) {
    const body = nodePath.node.body;
    if (t.isBlockStatement(body)) {
      // 克隆注入语句以避免重复使用同一节点
      const clonedStatement = t.cloneNode(injectionStatement, true);
      body.body.unshift(clonedStatement);
    }
  }

  /**
   * 注入语句到箭头函数
   */
  private injectToArrowFunction(nodePath: any, injectionStatement: any) {
    const body = nodePath.node.body;

    if (t.isBlockStatement(body)) {
      // 已经是块语句，直接在开头插入
      const clonedStatement = t.cloneNode(injectionStatement, true);
      body.body.unshift(clonedStatement);
    } else {
      // 是表达式，需要转换为块语句
      const clonedStatement = t.cloneNode(injectionStatement, true);
      const returnStatement = t.returnStatement(body);
      nodePath.node.body = t.blockStatement([clonedStatement, returnStatement]);
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
