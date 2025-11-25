# 使用示例

本文档提供了 `must` 工具的实际使用示例。

## 示例 1：基本使用

### 项目结构

```
my-project/
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── Button.tsx
│   │   └── Header.tsx
│   └── utils/
│       └── helpers.ts
├── must.config.ts
└── package.json
```

### 配置文件 (must.config.ts)

```typescript
import { I18nConfig } from 'must';

const config: I18nConfig = {
  sourceLanguage: 'en',
  targetLanguages: ['zh-CN', 'ja'],
  translationProvider: 'google',
  outputDir: 'src/i18n',
  inputPatterns: [
    'src/**/*.{ts,tsx}'
  ],
  excludePatterns: [
    'src/**/*.test.*',
    'src/**/*.spec.*'
  ]
};

export default config;
```

### 源代码示例

**src/App.tsx**:
```typescript
import React from 'react';

function App() {
  return (
    <div>
      <h1>Welcome to My App</h1>
      <p>This is a simple example</p>
      <button>Click me</button>
    </div>
  );
}
```

### 运行 must

```bash
must
```

### 生成的文件

**src/i18n/en.json**:
```json
{
  "welcome_to_my_app": "Welcome to My App",
  "this_is_a_simple_example": "This is a simple example",
  "click_me": "Click me"
}
```

**src/i18n/zh-CN.json**:
```json
{
  "welcome_to_my_app": "欢迎来到我的应用",
  "this_is_a_simple_example": "这是一个简单的示例",
  "click_me": "点击我"
}
```

**src/i18n/ja.json**:
```json
{
  "welcome_to_my_app": "私のアプリへようこそ",
  "this_is_a_simple_example": "これは簡単な例です",
  "click_me": "クリックしてください"
}
```

## 示例 2：使用百度翻译

### 配置文件

```typescript
const config: I18nConfig = {
  sourceLanguage: 'zh-CN',
  targetLanguages: ['en', 'ja', 'ko'],
  translationProvider: 'baidu',
  apiKey: 'YOUR_BAIDU_APP_ID',
  apiSecret: 'YOUR_BAIDU_SECRET_KEY',
  outputDir: 'locales',
  inputPatterns: [
    'src/**/*.{vue,js}'
  ],
  excludePatterns: [
    'node_modules/**'
  ]
};

export default config;
```

### 运行命令

```bash
must translate
```

## 示例 3：Vue 项目

### 项目结构

```
vue-project/
├── src/
│   ├── App.vue
│   ├── components/
│   │   ├── HelloWorld.vue
│   │   └── UserProfile.vue
│   └── views/
│       ├── Home.vue
│       └── About.vue
├── must.config.ts
└── package.json
```

### 配置文件

```typescript
const config: I18nConfig = {
  sourceLanguage: 'en',
  targetLanguages: ['zh-CN', 'zh-TW', 'ja'],
  translationProvider: 'google',
  outputDir: 'src/locales',
  inputPatterns: [
    'src/**/*.vue',
    'src/**/*.js'
  ],
  excludePatterns: [
    'node_modules/**',
    'dist/**'
  ]
};

export default config;
```

### 源代码 (src/components/HelloWorld.vue)

```vue
<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <p>
      Welcome to Your Vue.js App
    </p>
    <button @click="handleClick">
      Get Started
    </button>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  methods: {
    handleClick() {
      alert('Button clicked!');
    }
  }
}
</script>
```

### 集成到 Vue 应用

生成翻译文件后，可以使用 vue-i18n：

```bash
npm install vue-i18n
```

**src/i18n.js**:
```javascript
import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import zhCN from './locales/zh-CN.json';
import ja from './locales/ja.json';

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    'zh-CN': zhCN,
    ja
  }
});

export default i18n;
```

**src/main.js**:
```javascript
import { createApp } from 'vue';
import App from './App.vue';
import i18n from './i18n';

createApp(App)
  .use(i18n)
  .mount('#app');
```

**使用翻译**:
```vue
<template>
  <div>
    <h1>{{ $t('welcome_to_your_vue_js_app') }}</h1>
    <button>{{ $t('get_started') }}</button>
  </div>
</template>
```

## 示例 4：React + TypeScript 项目

### 配置文件

```typescript
const config: I18nConfig = {
  sourceLanguage: 'en',
  targetLanguages: ['zh-CN', 'es', 'fr'],
  translationProvider: 'google',
  outputDir: 'src/translations',
  inputPatterns: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}'
  ],
  excludePatterns: [
    'node_modules/**',
    'build/**',
    'public/**'
  ]
};

export default config;
```

### 集成到 React 应用

使用 react-i18next：

```bash
npm install react-i18next i18next
```

**src/i18n.ts**:
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './translations/en.json';
import zhCN from './translations/zh-CN.json';
import es from './translations/es.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      'zh-CN': { translation: zhCN },
      es: { translation: es }
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
```

**src/App.tsx**:
```typescript
import React from 'react';
import { useTranslation } from 'react-i18next';
import './i18n';

function App() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div>
      <h1>{t('welcome_to_my_app')}</h1>
      <p>{t('this_is_a_simple_example')}</p>
      <button onClick={() => changeLanguage('zh-CN')}>中文</button>
      <button onClick={() => changeLanguage('en')}>English</button>
    </div>
  );
}

export default App;
```

## 示例 5：仅提取文案（不翻译）

如果只想提取文案用于审查，不进行翻译：

```bash
must extract
```

这将生成：
- `extraction-report.json` - 详细的提取报告

审查后可以手动翻译或稍后运行：

```bash
must translate
```

## 示例 6：自定义文件模式

```typescript
const config: I18nConfig = {
  sourceLanguage: 'en',
  targetLanguages: ['zh-CN'],
  translationProvider: 'google',
  outputDir: 'i18n',
  // 只处理特定目录
  inputPatterns: [
    'src/pages/**/*.tsx',
    'src/components/**/*.tsx',
    'src/layouts/**/*.tsx'
  ],
  // 排除测试和故事书文件
  excludePatterns: [
    '**/*.test.*',
    '**/*.spec.*',
    '**/*.stories.*',
    '**/__tests__/**',
    '**/__mocks__/**'
  ]
};
```

## 示例 7：CI/CD 集成

### GitHub Actions

**.github/workflows/i18n.yml**:
```yaml
name: Update Translations

on:
  push:
    branches: [main]
    paths:
      - 'src/**'

jobs:
  translate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Install must
        run: npm install -g must
      
      - name: Run translations
        run: must
      
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add src/i18n/
          git commit -m "Update translations" || exit 0
          git push
```

## 最佳实践

1. **定期运行**: 在添加新功能后运行 `must`
2. **代码审查**: 审查生成的翻译文件
3. **版本控制**: 将翻译文件提交到 Git
4. **人工校对**: 机器翻译后进行人工校对
5. **测试**: 在不同语言环境下测试应用

## 常见问题

### 1. 翻译质量不佳

使用专业翻译服务（百度、Azure）或人工校对。

### 2. 提取了不该提取的内容

在配置中添加排除模式，或在代码中使用技术关键词。

### 3. 某些文本未被提取

检查文件是否在 `inputPatterns` 中，且不在 `excludePatterns` 中。
