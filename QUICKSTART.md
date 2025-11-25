# 快速开始指南

## 🎯 Monorepo 项目已配置完成！

项目已从单包结构重构为 monorepo 架构，现在可以更方便地调试和测试。

## 📋 项目结构

```
must/
├── packages/
│   ├── types/       # @must/types - 类型定义
│   └── must/        # must - 主包（CLI 工具）
├── playground/      # React 测试应用
├── pnpm-workspace.yaml
└── package.json
```

## 🚀 立即开始

### 1. 安装 pnpm（如果还没有）

```bash
npm install -g pnpm
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 构建项目

```bash
pnpm build
```

### 4. 测试功能

#### 方式一：使用 Playground（推荐）

```bash
# 终端 1：启动开发服务器
pnpm playground

# 终端 2：测试 must 工具
cd playground
pnpm must
```

查看结果：
```bash
cat playground/src/i18n/en.json
cat playground/src/i18n/zh-CN.json
```

#### 方式二：直接运行

```bash
cd packages/must
pnpm build
node dist/cli.js --help
```

## 🔧 开发工作流

### 推荐的开发流程

```bash
# 终端 1：监听 must 包的变化（自动重新编译）
pnpm --filter must dev

# 终端 2：运行 playground
pnpm playground

# 终端 3：在 playground 中测试
cd playground
pnpm must
```

### 修改代码并测试

1. 修改 `packages/must/src/` 中的代码
2. 代码会自动重新编译（如果运行了 `pnpm --filter must dev`）
3. 在 playground 中运行 `pnpm must` 测试修改
4. 查看 `playground/src/i18n/` 目录中的结果

## 📦 包说明

### @must/types
- **路径**: `packages/types/`
- **功能**: TypeScript 类型定义
- **构建**: `pnpm --filter @must/types build`

### must
- **路径**: `packages/must/`
- **功能**: CLI 工具和核心功能
- **构建**: `pnpm --filter must build`
- **开发**: `pnpm --filter must dev`

### playground
- **路径**: `playground/`
- **功能**: React 测试应用
- **运行**: `pnpm playground`
- **测试**: `cd playground && pnpm must`

## 🎨 Playground 功能

Playground 是一个完整的 React + Vite 应用，包含：

- ✅ 多种文本内容（标题、段落、按钮等）
- ✅ 预配置的 `must.config.ts`
- ✅ 实时开发服务器
- ✅ 自动提取和翻译测试

访问 `http://localhost:5173` 查看应用界面。

## 🧪 测试示例

### 提取文案

```bash
cd playground
pnpm must extract
```

### 提取并翻译

```bash
cd playground
pnpm must
# 或
pnpm translate
```

### 查看结果

```bash
# 英文原文
cat src/i18n/en.json

# 中文翻译
cat src/i18n/zh-CN.json

# 日文翻译
cat src/i18n/ja.json

# 提取报告
cat src/i18n/extraction-report.json
```

## 🔍 调试技巧

### 1. 查看详细日志

Must 会输出详细的执行日志，包括：
- 找到的文件数量
- 提取的文本数量
- 翻译进度
- 生成的文件

### 2. 修改 Playground 代码

在 `playground/src/App.tsx` 中添加更多文本：

```tsx
<p>New text to translate</p>
```

然后运行：
```bash
pnpm must
```

### 3. 修改配置

编辑 `playground/must.config.ts`：

```typescript
const config: I18nConfig = {
  sourceLanguage: 'en',
  targetLanguages: ['zh-CN', 'ja', 'ko'], // 添加韩语
  // ...
};
```

### 4. 使用不同的翻译服务

```typescript
const config: I18nConfig = {
  translationProvider: 'baidu',
  apiKey: 'YOUR_APP_ID',
  apiSecret: 'YOUR_SECRET',
  // ...
};
```

## 📚 常用命令

### 根目录

```bash
pnpm install      # 安装依赖
pnpm build        # 构建所有包
pnpm dev          # 所有包开发模式
pnpm clean        # 清理构建产物
pnpm playground   # 运行 playground
```

### 针对特定包

```bash
# 构建 must 包
pnpm --filter must build

# must 包开发模式
pnpm --filter must dev

# 运行 playground 开发服务器
pnpm --filter playground dev
```

### Playground 中

```bash
cd playground

pnpm dev         # 启动开发服务器
pnpm must        # 运行 must 工具
pnpm extract     # 仅提取文案
pnpm translate   # 提取并翻译
```

## 🎯 下一步

1. **熟悉结构**
   - 浏览 `packages/must/src/` 了解代码组织
   - 查看 `packages/types/src/index.ts` 了解类型定义

2. **尝试修改**
   - 修改提取逻辑
   - 添加新的翻译服务
   - 改进过滤规则

3. **测试修改**
   - 在 playground 中测试
   - 查看生成的翻译文件
   - 验证功能是否正常

4. **发布**
   - 参考 `MIGRATION.md` 中的发布流程

## ❓ 遇到问题？

### 依赖安装失败

```bash
pnpm clean
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 构建失败

```bash
pnpm clean
pnpm build
```

### Playground 无法找到 must

```bash
pnpm --filter must build
cd playground
pnpm must
```

### 更多帮助

- 查看 `README.md` - 完整文档
- 查看 `MIGRATION.md` - 迁移指南
- 查看各个包的 `package.json` 了解可用命令

## 🎉 开始开发

现在你可以开始开发了！修改代码，在 playground 中测试，享受 monorepo 带来的便利吧！

Happy coding! 🚀
