# Must - 自动国际化工具

一个自动国际化工具库，可以从项目中提取文案并自动翻译成多种语言。

## 功能特性

- 🔍 **智能文案提取**: 支持 JavaScript、TypeScript、Vue、HTML 等多种文件格式
- 🌐 **多翻译提供商**: 支持 Google Translate、百度翻译、Azure Translator
- 🎯 **灵活配置**: 支持 TypeScript/JavaScript 配置文件，可自定义源语言、目标语言、文件模式等
- 📁 **自动文件生成**: 自动生成 i18n 文件到指定目录
- 📊 **详细报告**: 生成提取和翻译的详细报告
- 🚀 **命令行工具**: 简单易用的 CLI 命令

## 安装

```bash
npm install -g must
```

或者作为项目依赖安装：

```bash
npm install --save-dev must
```

## 快速开始

### 1. 创建配置文件

在项目根目录创建 `must.config.ts` 文件：

```typescript
import { I18nConfig } from 'must';

const config: I18nConfig = {
  sourceLanguage: 'en',
  targetLanguages: ['zh-CN'],
  translationProvider: 'google',
  outputDir: 'i18n/strings',
  inputPatterns: [
    'src/**/*.{ts,tsx,js,jsx}',
    'src/**/*.vue',
    '**/*.html'
  ],
  excludePatterns: [
    'node_modules/**',
    'dist/**',
    'build/**',
    '**/*.test.*',
    '**/*.spec.*'
  ]
};

export default config;
```

也可以使用 JSON 格式 (`must.config.json`):

```json
{
  "sourceLanguage": "en",
  "targetLanguages": ["zh-CN"],
  "translationProvider": "google",
  "outputDir": "i18n/strings",
  "inputPatterns": [
    "src/**/*.{ts,tsx,js,jsx}",
    "src/**/*.vue"
  ],
  "excludePatterns": [
    "node_modules/**",
    "dist/**"
  ]
}
```

### 2. 运行工具

直接运行 `must` 命令：

```bash
must
```

这将自动：
1. 读取 `must.config.ts` (或其他支持的配置文件)
2. 提取项目中的所有文案
3. 翻译成目标语言
4. 生成翻译文件到 `i18n/strings` 目录

## 命令行选项

### 默认命令

```bash
must
```

直接运行，会自动查找配置文件并执行提取和翻译。

### extract 命令

仅提取文案，不进行翻译：

```bash
must extract [options]
```

选项：
- `-c, --config <path>`: 配置文件路径
- `-o, --output <dir>`: 输出目录
- `-p, --patterns <patterns...>`: 包含的文件模式
- `-e, --exclude <patterns...>`: 排除的文件模式

### translate 命令

提取并翻译文案：

```bash
must translate [options]
```

选项：
- `-c, --config <path>`: 配置文件路径
- `-s, --source <lang>`: 源语言代码 (默认: en)
- `-t, --target <languages...>`: 目标语言代码 (默认: zh-CN)
- `-p, --provider <provider>`: 翻译提供商 (google | baidu | azure)
- `-k, --api-key <key>`: API 密钥
- `--api-secret <secret>`: API 密钥（百度翻译需要）
- `--region <region>`: 区域（Azure 需要）

### init 命令

初始化配置文件：

```bash
must init [options]
```

选项：
- `-o, --output <path>`: 配置文件输出路径 (默认: must.config.json)

### validate 命令

验证配置文件：

```bash
must validate [options]
```

选项：
- `-c, --config <path>`: 配置文件路径

## 配置选项

### 基本配置

```typescript
interface I18nConfig {
  // 源语言代码，如 'en', 'zh-CN'
  sourceLanguage: string;
  
  // 目标语言代码数组，支持多种语言
  targetLanguages: string[];
  
  // 翻译提供商：'google' | 'baidu' | 'azure'
  translationProvider: 'google' | 'baidu' | 'azure';
  
  // 输出目录
  outputDir: string;
  
  // 要处理的文件模式
  inputPatterns: string[];
  
  // 要排除的文件模式
  excludePatterns: string[];
  
  // API 配置（可选）
  apiKey?: string;
  apiSecret?: string;
  region?: string;
}
```

### 配置文件查找顺序

Must 会按以下顺序查找配置文件：

1. `must.config.ts`
2. `must.config.js`
3. `must.config.json`
4. `i18n.config.ts`
5. `i18n.config.js`
6. `i18n.config.json`
7. `.i18nrc.json`

## 支持的翻译提供商

### Google Translate（默认）

无需 API 密钥，但可能有使用限制。

```typescript
{
  translationProvider: 'google'
}
```

### 百度翻译

需要申请 API 密钥：

1. 访问 [百度翻译开放平台](http://api.fanyi.baidu.com/)
2. 申请 API 密钥
3. 在配置中设置：

```typescript
{
  translationProvider: 'baidu',
  apiKey: 'YOUR_APP_ID',
  apiSecret: 'YOUR_SECRET_KEY'
}
```

### Azure Translator

需要 Azure 订阅：

1. 在 Azure 门户创建 Translator 资源
2. 获取 API 密钥和区域
3. 在配置中设置：

```typescript
{
  translationProvider: 'azure',
  apiKey: 'YOUR_API_KEY',
  region: 'YOUR_REGION'
}
```

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

翻译文件格式：

```json
{
  "welcome_to_our_application": "欢迎使用我们的应用",
  "hello_world": "你好世界",
  "click_me": "点击我"
}
```

## 示例

### 基本使用

```bash
# 初始化配置
must init

# 直接运行（提取 + 翻译）
must

# 仅提取文案
must extract

# 翻译为特定语言
must translate -s en -t zh-CN ja ko
```

### 使用百度翻译

```bash
must translate \
  --provider baidu \
  --api-key YOUR_APP_ID \
  --api-secret YOUR_SECRET_KEY \
  -s en -t zh-CN
```

### 自定义文件模式

```bash
must extract \
  --patterns "src/**/*.tsx" "components/**/*.vue" \
  --exclude "**/*.test.*" "**/*.spec.*"
```

### 使用自定义配置文件

```bash
must -c custom-config.ts
```

## 工作流程

1. **配置**: 创建 `must.config.ts` 配置文件
2. **提取**: Must 扫描项目文件，提取所有需要翻译的文案
3. **过滤**: 自动过滤掉技术关键词、路径、CSS类名等不需要翻译的内容
4. **翻译**: 调用翻译服务进行翻译
5. **生成**: 生成 JSON 格式的翻译文件

## 文案提取规则

Must 会智能识别并提取以下内容：

✅ **会提取**：
- 用户可见的文本内容
- JSX/Vue 模板中的文本
- HTML 标签中的文本
- 字符串字面量
- 模板字符串

❌ **不会提取**：
- 导入路径和模块名
- 技术关键词（react, vue, function 等）
- CSS 类名和 ID
- 文件路径和 URL
- 变量名和函数名
- 短于 2 个字符的文本
- 纯数字或符号

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

## 故障排除

### 翻译失败

如果翻译失败，请检查：
1. 网络连接是否正常
2. 翻译提供商的 API 密钥是否正确
3. 是否超出了免费配额

### 配置文件未找到

确保配置文件位于项目根目录，且文件名正确：
- `must.config.ts` (推荐)
- `must.config.js`
- `must.config.json`

### TypeScript 配置文件加载失败

确保项目已安装必要的依赖：

```bash
npm install -D tsx
```

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！

## 相关链接

- [GitHub 仓库](https://github.com/yourusername/must)
- [问题反馈](https://github.com/yourusername/must/issues)
- [更新日志](https://github.com/yourusername/must/releases)