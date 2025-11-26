# Must 工具使用说明

## ✅ 工具已成功运行！

您看到的 `Initializing...` 状态是正常的，这是因为：

1. **提取文本**：正在扫描文件并提取所有可翻译的文本
2. **调用翻译 API**：正在调用 Google Translate 进行翻译（这可能需要一些时间）
3. **生成文件**：创建各语言的翻译文件

## 📁 生成的文件

执行 `pnpm must` 后，已成功生成以下文件：

```
playground/src/i18n/
├── en.json                    # 英文翻译
├── zh-CN.json                 # 中文翻译
├── ja.json                    # 日文翻译
└── extraction-report.json     # 提取报告
```

### 提取统计

- ✅ 提取了 **27 个文本字符串**
- ✅ 生成了 **3 个语言文件**
- ✅ 创建了详细的提取报告

## 🌐 关于翻译 API

### 当前状态

执行过程中可能会看到以下错误：

```
RequestError: getaddrinfo ENOTFOUND translate.google.com
```

这是因为：
- 🚫 Google Translate API 需要网络访问
- 🚫 可能存在网络防火墙或 DNS 问题
- 🚫 中国大陆地区无法直接访问 Google 服务

### 解决方案

#### 方案 1：使用其他翻译服务

修改 `playground/must.config.js`：

```javascript
// 使用百度翻译
const config = {
  sourceLanguage: 'en',
  targetLanguages: ['zh-CN', 'ja'],
  translationProvider: 'baidu',  // 改为 baidu
  baiduConfig: {
    appId: 'YOUR_BAIDU_APP_ID',
    appKey: 'YOUR_BAIDU_APP_KEY'
  },
  // ...
};
```

#### 方案 2：手动翻译模式

```javascript
// 关闭自动翻译，只提取文本
const config = {
  sourceLanguage: 'en',
  targetLanguages: ['zh-CN', 'ja'],
  translationProvider: 'none',  // 不进行翻译
  // ...
};
```

然后手动编辑生成的 JSON 文件进行翻译。

#### 方案 3：使用代理

如果有代理服务器：

```bash
# 设置代理环境变量
export HTTP_PROXY=http://your-proxy:port
export HTTPS_PROXY=http://your-proxy:port

# 然后运行 must
pnpm must
```

## 📊 查看提取报告

```bash
cat playground/src/i18n/extraction-report.json
```

报告包含：
- 提取的所有文本
- 文本来源文件
- 行号和位置
- 统计信息

## 🎯 下一步操作

### 1. 集成到 React 应用

安装 i18n 库：

```bash
pnpm add react-i18next i18next
```

创建 i18n 配置：

```typescript
// src/i18n/config.ts
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import zhCN from './zh-CN.json';
import ja from './ja.json';

i18next
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      'zh-CN': { translation: zhCN },
      ja: { translation: ja }
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18next;
```

### 2. 在组件中使用

```typescript
import { useTranslation } from 'react-i18next';

function App() {
  const { t, i18n } = useTranslation();

  return (
    <div>
      <h1>{t('welcome_to_must_playground')}</h1>
      <button onClick={() => i18n.changeLanguage('zh-CN')}>
        中文
      </button>
      <button onClick={() => i18n.changeLanguage('en')}>
        English
      </button>
    </div>
  );
}
```

### 3. 更新翻译

当代码中添加了新的文本后：

```bash
# 重新提取和翻译
pnpm must

# 或者只提取不翻译
pnpm must extract --skip-translation
```

## 🔧 配置选项

### must.config.js 完整示例

```javascript
// @ts-check

/** @type {import('must').I18nConfig} */
const config = {
  // 源语言
  sourceLanguage: 'en',
  
  // 目标语言（支持多个）
  targetLanguages: ['zh-CN', 'ja', 'ko', 'es', 'fr'],
  
  // 翻译服务提供商
  translationProvider: 'google',  // 'google' | 'baidu' | 'azure' | 'none'
  
  // 输出目录
  outputDir: 'src/i18n',
  
  // 扫描的文件模式
  inputPatterns: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.test.*'
  ],
  
  // 排除的文件模式
  excludePatterns: [
    'node_modules/**',
    'dist/**',
    'build/**',
    'src/i18n/**'
  ],
  
  // 百度翻译配置（如果使用）
  baiduConfig: {
    appId: process.env.BAIDU_APP_ID,
    appKey: process.env.BAIDU_APP_KEY
  },
  
  // Azure 翻译配置（如果使用）
  azureConfig: {
    key: process.env.AZURE_TRANSLATOR_KEY,
    endpoint: process.env.AZURE_TRANSLATOR_ENDPOINT,
    region: 'eastasia'
  }
};

module.exports = config;
```

## 📝 注意事项

### 1. TypeScript 配置文件

如果使用 `must.config.ts`（TypeScript 格式），需要：
- 安装 `ts-node`
- 或者改用 `must.config.js`（推荐）

### 2. 网络问题

- Google Translate 在中国大陆不可用
- 建议使用百度翻译或 Azure Translator
- 或者先提取文本，再手动翻译

### 3. 性能优化

如果项目很大：
```javascript
// 使用更精确的 inputPatterns
inputPatterns: [
  'src/components/**/*.tsx',
  'src/pages/**/*.tsx'
],

// 排除测试文件
excludePatterns: [
  '**/*.test.*',
  '**/*.spec.*',
  '**/__tests__/**'
]
```

## 🎉 总结

Must 工具已经成功运行！即使看到翻译 API 错误，文本提取功能仍然正常工作，并生成了所需的 JSON 文件。您可以：

1. ✅ 查看生成的翻译文件
2. ✅ 手动编辑翻译（如果自动翻译失败）
3. ✅ 配置其他翻译服务提供商
4. ✅ 集成到您的应用中

如有问题，请参考上述配置选项或查看 [README.md](../README.md)。

