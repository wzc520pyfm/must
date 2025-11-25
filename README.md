# Auto I18n Tool

一个自动国际化工具库，可以从项目中提取文案并自动翻译成多种语言。

## 功能特性

- 🔍 **智能文案提取**: 支持 JavaScript、TypeScript、Vue、HTML 等多种文件格式
- 🌐 **多翻译提供商**: 支持 Google Translate、百度翻译、Azure Translator
- 🎯 **灵活配置**: 支持自定义源语言、目标语言、文件模式等
- 📁 **自动文件生成**: 自动生成 i18n 文件到指定目录
- 📊 **详细报告**: 生成提取和翻译的详细报告
- 🚀 **命令行工具**: 简单易用的 CLI 命令

## 安装

```bash
npm install -g auto-i18n-tool
```

或者作为项目依赖安装：

```bash
npm install --save-dev auto-i18n-tool
```

## 快速开始

### 1. 初始化配置

```bash
auto-i18n init
```

这将创建一个 `i18n.config.json` 配置文件：

```json
{
  "sourceLanguage": "en",
  "targetLanguages": ["zh-CN"],
  "translationProvider": "google",
  "outputDir": "i18n/strings",
  "inputPatterns": [
    "**/*.js",
    "**/*.jsx", 
    "**/*.ts",
    "**/*.tsx",
    "**/*.vue",
    "**/*.html"
  ],
  "excludePatterns": [
    "node_modules/**",
    "dist/**",
    "build/**",
    "**/*.test.*",
    "**/*.spec.*"
  ]
}
```

### 2. 提取文案

```bash
auto-i18n extract
```

### 3. 提取并翻译

```bash
auto-i18n translate
```

## 命令行选项

### extract 命令

```bash
auto-i18n extract [options]
```

选项：
- `-c, --config <path>`: 配置文件路径
- `-o, --output <dir>`: 输出目录
- `-p, --patterns <patterns...>`: 包含的文件模式
- `-e, --exclude <patterns...>`: 排除的文件模式

### translate 命令

```bash
auto-i18n translate [options]
```

选项：
- `-c, --config <path>`: 配置文件路径
- `-s, --source <lang>`: 源语言代码
- `-t, --target <languages...>`: 目标语言代码
- `-p, --provider <provider>`: 翻译提供商
- `-k, --api-key <key>`: API 密钥
- `--api-secret <secret>`: API 密钥（百度翻译需要）
- `--region <region>`: 区域（Azure 需要）

### init 命令

```bash
auto-i18n init [options]
```

选项：
- `-o, --output <path>`: 配置文件输出路径

### validate 命令

```bash
auto-i18n validate [options]
```

选项：
- `-c, --config <path>`: 配置文件路径

## 配置选项

### 基本配置

- `sourceLanguage`: 源语言代码（如 'en'）
- `targetLanguages`: 目标语言代码数组（如 ['zh-CN', 'ja']）
- `translationProvider`: 翻译提供商（'google' | 'baidu' | 'azure'）
- `outputDir`: 输出目录

### 文件配置

- `inputPatterns`: 要处理的文件模式数组
- `excludePatterns`: 要排除的文件模式数组

### API 配置

- `apiKey`: API 密钥（某些提供商需要）
- `apiSecret`: API 密钥（百度翻译需要）
- `region`: 区域（Azure 需要）

## 支持的翻译提供商

### Google Translate（默认）

无需 API 密钥，但可能有使用限制。

### 百度翻译

需要申请 API 密钥：
1. 访问 [百度翻译开放平台](http://api.fanyi.baidu.com/)
2. 申请 API 密钥
3. 在配置中设置 `apiKey` 和 `apiSecret`

### Azure Translator

需要 Azure 订阅：
1. 在 Azure 门户创建 Translator 资源
2. 获取 API 密钥和区域
3. 在配置中设置 `apiKey` 和 `region`

## 支持的文件格式

- JavaScript (.js)
- TypeScript (.ts)
- React JSX (.jsx)
- React TypeScript (.tsx)
- Vue 单文件组件 (.vue)
- HTML (.html)

## 输出文件

工具会在指定的输出目录中生成以下文件：

- `{language}.json`: 每种语言的翻译文件
- `extraction-report.json`: 详细的提取报告

## 示例

### 基本使用

```bash
# 初始化配置
auto-i18n init

# 提取并翻译为中文
auto-i18n translate -s en -t zh-CN

# 翻译为多种语言
auto-i18n translate -s en -t zh-CN ja ko
```

### 使用百度翻译

```bash
auto-i18n translate \
  --provider baidu \
  --api-key YOUR_APP_ID \
  --api-secret YOUR_SECRET_KEY \
  -s en -t zh-CN
```

### 自定义文件模式

```bash
auto-i18n extract \
  --patterns "src/**/*.tsx" "components/**/*.vue" \
  --exclude "**/*.test.*" "**/*.spec.*"
```

## 开发

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 运行开发版本
npm run dev

# 运行测试
npm test

# 代码检查
npm run lint
```

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！

