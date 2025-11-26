# Must 国际化工具 - 快速开始

## 🎯 核心概念

Must 是一个自动化的国际化工具，可以：
1. 自动提取代码中的所有中文文案
2. 自动翻译成多种语言
3. 生成结构化的翻译文件
4. 追踪翻译的增量变更

## 📦 安装

### 在 Monorepo 中使用

```bash
# 安装依赖
pnpm install

# 构建工具
pnpm build

# 在 playground 中测试
cd playground
pnpm must
```

## ⚙️ 配置

在项目根目录创建 `must.config.js`：

```javascript
// @ts-check

/** @type {import('must').I18nConfig} */
const config = {
  // 应用名称（用于生成 key）
  appName: 'myapp',
  
  // 源语言（开发时使用的语言）
  sourceLanguage: 'zh-CN',
  
  // 目标语言（需要翻译到的语言）
  targetLanguages: ['en', 'ja'],
  
  // 翻译服务提供商
  translationProvider: 'baidu',  // 可选：google, baidu, azure
  
  // 百度翻译配置（如果使用 baidu）
  apiKey: 'YOUR_BAIDU_APP_ID',
  apiSecret: 'YOUR_BAIDU_APP_KEY',
  
  // 输出目录
  outputDir: 'src/i18n',
  
  // Patch 目录（记录增量翻译）
  patchDir: 'src/i18n/patches',
  
  // 要扫描的文件
  inputPatterns: [
    'src/**/*.{ts,tsx,js,jsx}'
  ],
  
  // 要排除的文件
  excludePatterns: [
    'node_modules/**',
    'dist/**',
    'src/i18n/**'
  ]
};

module.exports = config;
```

## 🚀 使用

### 1. 在代码中使用中文

```tsx
// src/App.tsx
function App() {
  return (
    <div>
      <h1>欢迎使用我的应用</h1>
      <p>这是一个示例应用，展示国际化功能。</p>
      <button>点击这里</button>
    </div>
  );
}
```

### 2. 运行提取和翻译

```bash
# 在项目目录运行
pnpm must

# 或者如果全局安装了
must
```

### 3. 查看生成的文件

```
src/i18n/
├── zh-CN.json              # 中文（源语言）
├── en.json                 # 英文翻译
├── ja.json                 # 日文翻译
├── extraction-report.json  # 提取报告
└── patches/
    └── patch-2025-11-26-xxx.json  # 增量补丁
```

### 4. 在代码中使用翻译

#### 安装 i18n 库

```bash
pnpm add react-i18next i18next
```

#### 配置 i18next

```typescript
// src/i18n/config.ts
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhCN from './zh-CN.json';
import en from './en.json';
import ja from './ja.json';

i18next
  .use(initReactI18next)
  .init({
    resources: {
      'zh-CN': { translation: zhCN },
      'en': { translation: en },
      'ja': { translation: ja }
    },
    lng: 'zh-CN',  // 默认语言
    fallbackLng: 'zh-CN',
    interpolation: {
      escapeValue: false
    }
  });

export default i18next;
```

#### 在组件中使用

```tsx
// src/App.tsx
import { useTranslation } from 'react-i18next';

function App() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div>
      <h1>{t('myapp_app_欢迎使用我的应用')}</h1>
      <p>{t('myapp_app_这是一个示例应用展示国际化功能')}</p>
      <button>{t('myapp_app_点击这里')}</button>
      
      <div>
        <button onClick={() => changeLanguage('zh-CN')}>中文</button>
        <button onClick={() => changeLanguage('en')}>English</button>
        <button onClick={() => changeLanguage('ja')}>日本語</button>
      </div>
    </div>
  );
}
```

## 🔄 工作流程

### 开发新功能

1. **正常开发**：直接在代码中写中文
   ```tsx
   <button>保存</button>
   ```

2. **提取翻译**：完成功能后运行
   ```bash
   pnpm must
   ```

3. **查看 Patch**：检查 `src/i18n/patches/` 中的新增翻译

4. **替换文案**：用翻译 key 替换硬编码文字
   ```tsx
   <button>{t('myapp_button_保存')}</button>
   ```

### 日常维护

```bash
# 定期运行，提取新的文案
pnpm must

# 查看是否有新的翻译
ls src/i18n/patches/
```

## 📝 Key 命名规则

生成的 key 格式：`{appName}_{filePath}_{text}`

### 示例

| 源文本 | 文件 | 生成的 Key |
|--------|------|------------|
| "欢迎" | src/App.tsx | `myapp_app_欢迎` |
| "保存" | src/components/Button.tsx | `myapp_button_保存` |
| "用户设置" | src/pages/Settings.tsx | `myapp_settings_用户设置` |

### 优点

- ✅ **可读性强**：一眼看出文案的含义
- ✅ **避免冲突**：包含文件路径，减少重复
- ✅ **易于维护**：key 稳定，不会因为文案修改而变化
- ✅ **团队协作**：清晰的命名规范

## 🔧 翻译服务配置

### Google Translate（默认，免费）

```javascript
const config = {
  translationProvider: 'google',
  // 不需要 API key
};
```

**注意**：可能在中国大陆无法访问

### 百度翻译（推荐，国内可用）

1. 注册百度翻译开放平台：https://fanyi-api.baidu.com/
2. 创建应用获取 APP ID 和密钥

```javascript
const config = {
  translationProvider: 'baidu',
  apiKey: 'YOUR_BAIDU_APP_ID',
  apiSecret: 'YOUR_BAIDU_APP_KEY',
};
```

### Azure Translator

```javascript
const config = {
  translationProvider: 'azure',
  apiKey: 'YOUR_AZURE_KEY',
  region: 'eastasia',
};
```

## 📊 Patch 文件说明

每次运行 `must` 命令时，如果有新的翻译，会在 `patchDir` 生成一个 patch 文件。

### Patch 文件用途

1. **增量审查**：只需审查新增的翻译
2. **版本控制**：追踪每次翻译的变更
3. **团队协作**：查看谁添加了什么翻译
4. **回滚支持**：基于 patch 进行回滚

### Patch 文件示例

```json
{
  "timestamp": "2025-11-26T01:33:40.123Z",
  "sourceLanguage": "zh-CN",
  "targetLanguages": ["en", "ja"],
  "translations": {
    "zh-CN": {
      "myapp_app_新功能": "新功能"
    },
    "en": {
      "myapp_app_新功能": "New Feature"
    },
    "ja": {
      "myapp_app_新功能": "新機能"
    }
  },
  "metadata": {
    "myapp_app_新功能": {
      "file": "src/App.tsx",
      "line": 10,
      "column": 12,
      "type": "jsx"
    }
  }
}
```

## 🎯 最佳实践

### 1. Git 工作流

```bash
# .gitignore
src/i18n/patches/*.json  # 可选：不提交 patch 文件

# 或者保留 patch 文件，方便团队协作
```

### 2. CI/CD 集成

```yaml
# .github/workflows/i18n.yml
name: Check i18n
on: [pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: pnpm install
      - run: pnpm build
      - run: pnpm must
      - name: Check for new translations
        run: |
          if [ -n "$(git status --porcelain src/i18n)" ]; then
            echo "发现未提交的翻译文件"
            exit 1
          fi
```

### 3. 文案编写规范

- ✅ 使用完整的句子，不要使用单个词
- ✅ 保持一致的表达方式
- ✅ 避免使用俚语和方言
- ✅ 考虑翻译后的长度变化

### 4. 定期维护

```bash
# 每周运行一次，确保所有文案都已翻译
pnpm must

# 检查 patch 目录
ls -la src/i18n/patches/

# 审查新增的翻译
```

## 🐛 故障排除

### 问题：翻译 API 无法访问

**症状**：
```
RequestError: getaddrinfo ENOTFOUND translate.google.com
```

**解决方案**：
1. 切换到百度翻译：`translationProvider: 'baidu'`
2. 使用代理：设置 `HTTP_PROXY` 环境变量
3. 手动翻译：设置 `translationProvider: 'none'`

### 问题：生成的 key 太长

**解决方案**：
- key 长度限制为 30 个字符
- 如果文案很长，会自动截断
- 建议拆分长文案为多个短句

### 问题：相同文案生成了多个 key

**原因**：文案在不同文件中出现

**解决方案**：
- 工具会自动识别相同文案
- 如果已经生成了多个 key，手动合并它们
- 下次运行时会使用已有的 key

## 📚 更多资源

- [完整功能说明](./NEW_FEATURES.md)
- [项目 README](./README.md)
- [发布指南](./PUBLISH.md)

## 💡 提示

- 首次使用建议在测试项目中试验
- 定期备份翻译文件
- 团队协作时统一配置文件
- 使用版本控制追踪翻译变更

开始使用 Must，让国际化变得简单！🚀

