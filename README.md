# Must Monorepo

一个采用 monorepo 架构的自动国际化工具库，方便调试和测试。

## 📦 项目结构

```
must/
├── packages/
│   ├── types/              # TypeScript 类型定义包
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── must/               # 主包（CLI 工具）
│       ├── src/
│       │   ├── cli/        # CLI 命令
│       │   ├── config/     # 配置管理
│       │   ├── extractors/ # 文案提取器
│       │   ├── translators/# 翻译服务
│       │   ├── utils/      # 工具函数
│       │   ├── index.ts    # 主入口
│       │   └── cli.ts      # CLI 启动
│       ├── package.json
│       └── tsconfig.json
│
├── playground/             # 测试环境
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── ...
│   ├── must.config.ts     # Must 配置文件
│   ├── package.json
│   └── vite.config.ts
│
├── pnpm-workspace.yaml    # pnpm workspace 配置
├── package.json           # 根 package.json
└── README.md
```

## 🚀 快速开始

### 前置要求

- Node.js >= 16
- pnpm >= 8

### 安装依赖

```bash
# 安装 pnpm（如果还没有）
npm install -g pnpm

# 安装所有依赖
pnpm install
```

### 构建项目

```bash
# 构建所有包
pnpm build

# 或者构建特定包
pnpm --filter @must/types build
pnpm --filter must build
```

### 开发模式

```bash
# 监听所有包的变化
pnpm dev

# 或者监听特定包
pnpm --filter must dev
```

## 🧪 测试和调试

### 使用 Playground

Playground 是一个预配置的 React 应用，用于测试 Must 工具。

#### 1. 启动 Playground 开发服务器

```bash
pnpm playground
# 或
cd playground && pnpm dev
```

访问 `http://localhost:5173` 查看应用。

#### 2. 在 Playground 中测试 Must

```bash
cd playground

# 提取文案
pnpm must extract

# 提取并翻译
pnpm must

# 或使用特定命令
pnpm translate
```

#### 3. 查看结果

提取和翻译的结果会保存在 `playground/src/i18n/` 目录下：

```
playground/src/i18n/
├── en.json
├── zh-CN.json
├── ja.json
└── extraction-report.json
```

### 实时调试

由于使用了 workspace 依赖（`"must": "workspace:*"`），对 `packages/must` 的修改会立即反映到 playground 中，无需重新构建。

#### 调试流程

1. **修改代码**：在 `packages/must/src/` 中修改代码
2. **自动编译**：运行 `pnpm --filter must dev` 启动监听模式
3. **测试**：在 playground 中运行 `pnpm must` 测试修改
4. **查看结果**：检查生成的 i18n 文件

## 📚 包说明

### @must/types

类型定义包，包含所有 TypeScript 类型和接口。

**导出的类型：**
- `I18nConfig` - 配置接口
- `ExtractedText` - 提取文本接口
- `TranslationResult` - 翻译结果接口
- `ExtractorOptions` - 提取器选项
- `TranslatorOptions` - 翻译器选项

### must

主包，包含 CLI 工具和所有核心功能。

**命令：**
```bash
must              # 提取并翻译
must extract      # 仅提取
must translate    # 提取并翻译
must init         # 初始化配置
must validate     # 验证配置
```

## 🔧 开发命令

### 根目录命令

```bash
# 安装依赖
pnpm install

# 构建所有包
pnpm build

# 开发模式（所有包）
pnpm dev

# 运行测试
pnpm test

# 代码检查
pnpm lint

# 清理
pnpm clean

# 运行 playground
pnpm playground
```

### 包特定命令

```bash
# 在特定包中运行命令
pnpm --filter must build
pnpm --filter @must/types build

# 在 playground 中运行
pnpm --filter playground dev
pnpm --filter playground must
```

## 📝 添加新功能

### 1. 修改类型定义

编辑 `packages/types/src/index.ts`：

```typescript
export interface NewFeatureConfig {
  // 新功能配置
}
```

### 2. 实现功能

在 `packages/must/src/` 中添加实现：

```typescript
import { NewFeatureConfig } from '@must/types';

// 实现代码
```

### 3. 在 Playground 中测试

1. 构建包：`pnpm build`
2. 在 playground 中测试：`cd playground && pnpm must`

## 🚢 发布

### 发布单个包

```bash
# 发布 types 包
cd packages/types
npm publish

# 发布 must 包
cd packages/must
npm publish
```

### 批量发布

```bash
# 更新所有包的版本
pnpm -r exec npm version patch

# 构建
pnpm build

# 发布
pnpm -r --filter './packages/*' publish
```

## 🎯 Monorepo 的优势

1. **便于调试**
   - 可以在 playground 中实时测试修改
   - 无需发布就能测试新功能
   - 支持断点调试

2. **代码复用**
   - 类型定义共享
   - 工具函数复用
   - 统一的依赖管理

3. **一致性**
   - 统一的构建流程
   - 统一的代码规范
   - 统一的版本管理

4. **开发效率**
   - workspace 依赖自动链接
   - 并行构建
   - 增量构建

## 📖 示例

### 添加新的提取器

1. 在 `packages/must/src/extractors/` 添加新提取器
2. 在 playground 中创建测试文件
3. 运行 `pnpm must` 测试

### 添加新的翻译服务

1. 在 `packages/must/src/translators/` 添加新翻译器
2. 更新 `packages/types/src/index.ts` 中的类型
3. 在 playground 的配置文件中使用新服务
4. 测试

## 🐛 故障排除

### 依赖问题

```bash
# 清理并重新安装
pnpm clean
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 构建问题

```bash
# 清理构建产物
pnpm clean

# 重新构建
pnpm build
```

### Playground 无法找到 must

确保已构建 must 包：

```bash
pnpm --filter must build
```

## 📄 许可证

MIT