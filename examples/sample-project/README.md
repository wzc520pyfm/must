# Sample Project for Auto I18n Tool

这是一个示例项目，用于演示 auto-i18n-tool 的使用方法。

## 项目结构

```
sample-project/
├── src/
│   ├── App.tsx                 # React 主应用
│   └── components/
│       ├── Button.tsx          # React 按钮组件
│       ├── Header.tsx          # React 头部组件
│       └── Modal.vue           # Vue 模态框组件
├── index.html                  # HTML 页面
├── i18n.config.json           # 配置文件
└── README.md                  # 说明文档
```

## 使用方法

### 1. 安装工具

```bash
# 全局安装
npm install -g auto-i18n-tool

# 或者在项目中安装
npm install --save-dev auto-i18n-tool
```

### 2. 提取文案

```bash
auto-i18n extract
```

### 3. 提取并翻译

```bash
auto-i18n translate
```

### 4. 使用自定义配置

```bash
# 使用项目中的配置文件
auto-i18n translate -c i18n.config.json

# 翻译为特定语言
auto-i18n translate -s en -t zh-CN ja

# 使用百度翻译
auto-i18n translate --provider baidu --api-key YOUR_APP_ID --api-secret YOUR_SECRET_KEY
```

## 预期输出

运行翻译命令后，会在 `i18n/strings/` 目录下生成以下文件：

- `en.json` - 英文原文
- `zh-CN.json` - 中文翻译
- `ja.json` - 日文翻译
- `ko.json` - 韩文翻译
- `extraction-report.json` - 提取报告

## 提取的文案示例

工具会提取以下类型的文案：

### React/TypeScript 文件
- JSX 文本内容
- 字符串字面量
- 模板字符串
- 属性值

### Vue 文件
- 模板中的文本内容
- 脚本中的字符串
- 属性值

### HTML 文件
- 文本内容
- 属性值（title, alt, placeholder 等）

## 配置说明

示例配置文件包含以下设置：

- **sourceLanguage**: `en` - 源语言为英文
- **targetLanguages**: `["zh-CN", "ja", "ko"]` - 目标语言为中、日、韩文
- **translationProvider**: `google` - 使用 Google 翻译
- **inputPatterns**: 指定要处理的文件模式
- **excludePatterns**: 指定要排除的文件模式

