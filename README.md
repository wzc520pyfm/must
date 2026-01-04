# Must - 自动国际化工具

一个强大的自动化国际化工具，支持从代码中提取文案、自动翻译、代码转换，以及灵活的配置系统。

## ✨ 特性

- 🔍 **智能提取** - 自动从 JS/TS/JSX/TSX/Vue/HTML 文件中提取文案
- 🌐 **多语言翻译** - 支持百度、Google、Azure 等翻译服务
- 🔄 **代码转换** - 自动将硬编码文案替换为国际化函数调用
- 🎯 **灵活配置** - 支持自定义插值格式、key 生成规则、包裹函数
- 📦 **统一模式** - 所有文件使用相同的国际化方案
- 🔧 **命名参数** - 支持从变量名生成命名占位符

## 📦 安装

```bash
# 使用 npm
npm install must -D

# 使用 pnpm
pnpm add must -D

# 使用 yarn
yarn add must -D
```

## 🚀 快速开始

### 1. 初始化配置

```bash
npx must init
```

或手动创建 `must.config.js`：

```javascript
/** @type {import('must').I18nConfig} */
module.exports = {
  appName: 'myapp',
  sourceLanguage: 'zh-CN',
  targetLanguages: ['en', 'ja'],
  translationProvider: 'baidu',
  apiKey: process.env.BAIDU_APP_ID,
  apiSecret: process.env.BAIDU_APP_KEY,
  outputDir: 'src/i18n',
  inputPatterns: ['src/**/*.{ts,tsx}'],
  excludePatterns: ['node_modules/**', 'src/i18n/**'],
};
```

### 2. 运行提取和翻译

```bash
npx must
```

### 3. 查看结果

```
src/i18n/
├── zh-CN.json      # 源语言文案
├── en.json         # 英文翻译
├── ja.json         # 日文翻译
└── patches/        # 增量翻译
    ├── zh-CN.json
    ├── en.json
    └── ja.json
```

---

## 📖 CLI 命令

### 默认命令（提取 + 翻译 + 转换）

```bash
must [options]

选项：
  --key-prefix <prefix>       自定义 key 前缀
  --key-counter-padding <n>   计数器填充位数
  --key-counter-start <n>     计数器起始值
  --key-prefix-only           仅使用前缀+计数器模式
```

### extract - 仅提取文案

```bash
must extract [options]

选项：
  -c, --config <path>         配置文件路径
  -o, --output <dir>          输出目录
  -p, --patterns <patterns>   包含的文件模式
  -e, --exclude <patterns>    排除的文件模式
```

### translate - 提取并翻译

```bash
must translate [options]

选项：
  -c, --config <path>         配置文件路径
  -s, --source <lang>         源语言
  -t, --target <langs>        目标语言
  -p, --provider <provider>   翻译服务商
  -k, --api-key <key>         API Key
  --api-secret <secret>       API Secret
```

### init - 初始化配置

```bash
must init [options]

选项：
  -o, --output <path>         配置文件输出路径
```

### validate - 验证配置

```bash
must validate [options]

选项：
  -c, --config <path>         配置文件路径
```

---

## ⚙️ 配置参考

### 完整配置示例

```javascript
// must.config.js
require('dotenv').config();

/** @type {import('must').I18nConfig} */
module.exports = {
  // ==================== 基础配置 ====================
  
  /** 应用名称，用于生成 key 前缀 */
  appName: 'myapp',
  
  /** 源语言 */
  sourceLanguage: 'zh-CN',
  
  /** 目标语言列表 */
  targetLanguages: ['en', 'ja', 'ko'],
  
  /** 翻译服务商: 'google' | 'baidu' | 'azure' | 'youdao' */
  translationProvider: 'baidu',
  
  /** API Key */
  apiKey: process.env.BAIDU_APP_ID,
  
  /** API Secret（百度翻译需要） */
  apiSecret: process.env.BAIDU_APP_KEY,
  
  /** 区域（Azure 需要） */
  region: 'eastasia',
  
  // ==================== 文件配置 ====================
  
  /** 输出目录 */
  outputDir: 'src/i18n',
  
  /** 增量翻译目录 */
  patchDir: 'src/i18n/patches',
  
  /** 包含的文件模式 */
  inputPatterns: [
    'src/**/*.{ts,tsx,js,jsx}',
    'src/**/*.vue'
  ],
  
  /** 排除的文件模式 */
  excludePatterns: [
    'node_modules/**',
    'dist/**',
    'src/i18n/**'
  ],
  
  // ==================== Key 生成配置 ====================
  
  /** Key 风格: 'dot' | 'underscore' */
  keyStyle: 'dot',
  
  /** Key 最大长度 */
  keyMaxLength: 50,
  
  /** Key 生成详细配置 */
  keyConfig: {
    // 参见下方 "Key 生成配置" 章节
  },
  
  // ==================== 插值配置 ====================
  
  interpolation: {
    // 参见下方 "插值配置" 章节
  },
  
  // ==================== 代码转换配置 ====================
  
  transform: {
    // 参见下方 "代码转换配置" 章节
  }
};
```

---

## 🔑 Key 生成配置

### 默认模式

默认生成格式：`{appName}.{filePath}.{text}[.counter]`

```javascript
keyConfig: {
  /** 计数器样式: 'none' | 'auto' | 'always' */
  counterStyle: 'auto',
  
  /** 计数器填充位数（0 表示不填充） */
  counterPadding: 0,
  
  /** 计数器起始值 */
  counterStart: 0,
}
```

生成示例：
- `myapp.components.UserProfile.welcomeBack`
- `myapp.components.UserProfile.welcomeBack.1`（重复时）

### 前缀模式

生成格式：`{prefix}{counter}[_{params}]`

```javascript
keyConfig: {
  /** 自定义前缀 */
  prefix: 'CB_IBG_APPROLL_',
  
  /** 仅使用前缀+计数器 */
  prefixOnly: true,
  
  /** 计数器填充位数 */
  counterPadding: 5,
  
  /** 计数器起始值 */
  counterStart: 0,
  
  /** 是否在 key 中包含命名参数（配合 interpolation.namedParams 使用） */
  includeParams: false,
}
```

生成示例（不包含参数）：
- `CB_IBG_APPROLL_00000`
- `CB_IBG_APPROLL_00001`
- `CB_IBG_APPROLL_00002`

### 前缀模式 + 命名参数

当 `includeParams: true` 且 `interpolation.namedParams: true` 时：

```javascript
keyConfig: {
  prefix: 'CB_IBG_APPROLL_',
  prefixOnly: true,
  counterPadding: 5,
  includeParams: true,  // 在 key 中包含参数名
},
interpolation: {
  prefix: '{',
  suffix: '}',
  namedParams: true,  // 从变量名提取参数
}
```

源代码：
```javascript
`欢迎 ${username}，您有 ${count} 条消息`
```

生成示例：
- `CB_IBG_APPROLL_00000_{username}_{count}`
- `CB_IBG_APPROLL_00001_{level}`
- `CB_IBG_APPROLL_00002`（无参数的文案）

### 自定义生成函数

提供最大灵活性，完全自定义 key 格式：

```javascript
keyConfig: {
  generator: ({ base, text, num, params, filePath, originalText, translatedText, appName }) => {
    // 返回自定义的 key
    return `CUSTOM_${String(num).padStart(5, '0')}`;
  }
}
```

**函数参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `base` | `string` | 路径部分，如 `myapp.components.UserProfile` |
| `text` | `string` | 文案简写，如 `welcomeBack` |
| `num` | `number` | 计数器，从 0 开始递增 |
| `params` | `string[]` | 命名参数列表（启用 namedParams 时） |
| `filePath` | `string` | 完整文件路径 |
| `originalText` | `string` | 原始源语言文案 |
| `translatedText` | `string` | 翻译后的文案 |
| `appName` | `string` | 应用名称 |

**示例：**

```javascript
// 示例 1: 简单前缀 + 递增数字
generator: ({ num }) => `MSG_${String(num).padStart(5, '0')}`
// 输出: MSG_00000, MSG_00001, MSG_00002

// 示例 2: 模块 + 计数器 + 文案
generator: ({ base, text, num }) => {
  const key = `${base}.${text}`;
  return num > 0 ? `${key}.${num}` : key;
}
// 输出: myapp.Home.welcome, myapp.Home.welcome.1

// 示例 3: 包含命名参数
generator: ({ base, text, params }) => {
  let key = `${base}.${text}`;
  if (params?.length) {
    key += params.map(p => `_{${p}}`).join('');
  }
  return key;
}
// 输出: myapp.Home.welcome_{username}_{count}

// 示例 4: 从文件路径提取模块名
generator: ({ num, filePath }) => {
  const module = filePath.split('/')[1]?.toUpperCase() || 'APP';
  return `${module}_${String(num).padStart(4, '0')}`;
}
// 输出: COMPONENTS_0001, PAGES_0002
```

---

## 🔤 插值配置

控制模板字符串中动态表达式的占位符格式。

### 基础配置

```javascript
interpolation: {
  /** 占位符前缀（默认 '{{'） */
  prefix: '{{',
  
  /** 占位符后缀（默认 '}}'） */
  suffix: '}}',
}
```

源代码：
```javascript
`欢迎 ${username}，您有 ${count} 条消息`
```

提取结果：
```
欢迎 {{0}}，您有 {{1}} 条消息
```

### 命名参数模式

从变量名生成命名占位符：

```javascript
interpolation: {
  prefix: '{',
  suffix: '}',
  
  /** 启用命名参数 */
  namedParams: true,
  
  /** 在 key 中包含参数名 */
  includeParamsInKey: true,
}
```

源代码：
```javascript
`欢迎 ${username}，您有 ${count} 条消息`
```

提取结果：
```
欢迎 {username}，您有 {count} 条消息
```

生成的 key（启用 includeParamsInKey）：
```
myapp.Home.welcome_{username}_{count}
```

### 自定义占位符函数

```javascript
interpolation: {
  /** 完全自定义占位符格式 */
  format: (index, name) => {
    if (name) return `\${${name}}`;
    return `\${${index}}`;
  }
}
```

### 翻译安全格式

某些翻译 API 会破坏特定格式的占位符，可以指定翻译时使用的安全格式：

```javascript
interpolation: {
  prefix: '{{',
  suffix: '}}',
  
  /**
   * 翻译时使用的格式
   * - 'xml': <ph id="N"/> （推荐，大多数翻译 API 保留 XML 标签）
   * - 'bracket': [N]
   * - 'custom': 自定义格式
   * - null: 不转换
   */
  translationFormat: 'xml',
  
  /** 自定义翻译格式（translationFormat 为 'custom' 时） */
  translationPrefix: '__PH',
  translationSuffix: '__',
}
```

工作流程：
1. 提取：`欢迎 {{0}}` 
2. 翻译时：`欢迎 <ph id="0"/>` （转换为安全格式）
3. 翻译后：`Welcome <ph id="0"/>` → `Welcome {{0}}`（转换回来）

---

## 🔄 代码转换配置

自动将硬编码文案替换为国际化函数调用。

### 基础配置

```javascript
transform: {
  /** 启用代码转换 */
  enabled: true,
  
  /** 包裹函数名 */
  wrapperFunction: 't',
  
  /** 格式化代码 */
  formatCode: true,
}
```

### 导入配置（分离模式）

React 组件和静态文件使用不同的配置：

```javascript
transform: {
  enabled: true,
  importStatement: {
    /** React 组件：全局导入 */
    global: "import { useTranslation } from 'react-i18next';",
    
    /** React 组件：上下文注入 */
    contextInjection: "const { t } = useTranslation();",
    
    /** 静态文件：导入语句 */
    staticFileImport: "import i18n from '@/i18n';",
    
    /** 静态文件：包裹函数 */
    staticFileWrapper: "i18n.t",
  },
}
```

**转换效果（React 组件）：**

```tsx
// 转换前
function App() {
  return <h1>欢迎使用</h1>;
}

// 转换后
import { useTranslation } from 'react-i18next';
function App() {
  const { t } = useTranslation();
  return <h1>{t('myapp.App.welcome' /* 欢迎使用 */)}</h1>;
}
```

**转换效果（静态文件）：**

```typescript
// 转换前
export const TITLE = '应用标题';

// 转换后
import i18n from '@/i18n';
export const TITLE = i18n.t('myapp.constants.appTitle' /* 应用标题 */);
```

### 导入配置（统一模式）

所有文件使用相同的导入和包裹方式：

```javascript
transform: {
  enabled: true,
  importStatement: {
    /** 启用统一模式 */
    unified: true,
    
    /** 统一导入语句 */
    global: "import { trans } from '@/i18n-utils';",
    
    /** 统一包裹函数 */
    wrapper: "trans('{{key}}', '{{text}}')",
  },
}
```

**转换效果：**

```typescript
// 转换前（React 组件）
function App() {
  return <h1>欢迎使用</h1>;
}

// 转换后
import { trans } from '@/i18n-utils';
function App() {
  return <h1>{trans('myapp.App.welcome', '欢迎使用')}</h1>;
}

// 转换前（静态文件）
export const TITLE = '应用标题';

// 转换后
import { trans } from '@/i18n-utils';
export const TITLE = trans('myapp.constants.appTitle', '应用标题');
```

### 包裹函数配置

支持三种格式：

#### 1. 简单函数名

```javascript
wrapper: "t"
// 输出: t('key')

wrapper: "i18n.t"
// 输出: i18n.t('key')
```

#### 2. 模板字符串

```javascript
wrapper: "trans('{{key}}', '{{text}}')"
// 输出: trans('myapp.App.welcome', '欢迎使用')

wrapper: "t('{{key}}' /* {{text}} */)"
// 输出: t('myapp.App.welcome' /* 欢迎使用 */)
```

**模板变量：**
- `{{key}}`: 翻译 key
- `{{text}}`: 原文
- `{{0}}`, `{{1}}`, ...: 插值表达式

#### 3. 生成函数

```javascript
wrapper: (key, text, interpolations) => {
  if (interpolations?.length) {
    const params = interpolations.join(', ');
    return `trans('${key}', { ${params} } /* ${text} */)`;
  }
  return `trans('${key}' /* ${text} */)`;
}
// 输出: trans('myapp.App.welcome', { username, count } /* 欢迎 {username}，{count} 条消息 */)
```

---

## 📝 完整配置示例

### 示例 1：React + react-i18next

```javascript
// must.config.js
require('dotenv').config();

module.exports = {
  appName: 'myapp',
  sourceLanguage: 'zh-CN',
  targetLanguages: ['en', 'ja'],
  translationProvider: 'baidu',
  apiKey: process.env.BAIDU_APP_ID,
  apiSecret: process.env.BAIDU_APP_KEY,
  outputDir: 'src/i18n',
  inputPatterns: ['src/**/*.{ts,tsx}'],
  excludePatterns: ['node_modules/**', 'src/i18n/**'],
  
  interpolation: {
    prefix: '{{',
    suffix: '}}',
    translationFormat: 'xml',
  },
  
  transform: {
    enabled: true,
    importStatement: {
      global: "import { useTranslation } from 'react-i18next';",
      contextInjection: "const { t } = useTranslation();",
    },
    wrapperFunction: 't',
    formatCode: true,
  }
};
```

### 示例 2：统一模式 + 自定义函数

```javascript
// must.config.js
module.exports = {
  appName: 'app',
  sourceLanguage: 'zh-CN',
  targetLanguages: ['en'],
  translationProvider: 'baidu',
  apiKey: process.env.BAIDU_APP_ID,
  apiSecret: process.env.BAIDU_APP_KEY,
  outputDir: 'src/i18n',
  inputPatterns: ['src/**/*.{ts,tsx}'],
  excludePatterns: ['node_modules/**', 'src/i18n/**'],
  
  interpolation: {
    prefix: '{',
    suffix: '}',
    namedParams: true,
    translationFormat: 'xml',
  },
  
  transform: {
    enabled: true,
    importStatement: {
      unified: true,
      global: "import { trans } from '@/i18n-utils';",
      wrapper: (key, text) => `trans('${key}' /** ${text} */)`,
    },
    formatCode: true,
  }
};
```

### 示例 3：前缀 + 计数器模式

```javascript
// must.config.js
module.exports = {
  appName: 'myapp',
  sourceLanguage: 'zh-CN',
  targetLanguages: ['en'],
  translationProvider: 'baidu',
  apiKey: process.env.BAIDU_APP_ID,
  apiSecret: process.env.BAIDU_APP_KEY,
  outputDir: 'src/i18n',
  inputPatterns: ['src/**/*.{ts,tsx}'],
  excludePatterns: ['node_modules/**', 'src/i18n/**'],
  
  // Key 使用前缀 + 5位数字
  keyConfig: {
    prefix: 'CB_IBG_APPROLL_',
    prefixOnly: true,
    counterPadding: 5,
    counterStart: 0,
  },
  
  transform: {
    enabled: true,
    importStatement: {
      unified: true,
      global: "import { t } from '@/i18n';",
      wrapper: "t('{{key}}')",
    },
  }
};

// 生成的 key: CB_IBG_APPROLL_00000, CB_IBG_APPROLL_00001, ...
```

### 示例 3.1：前缀 + 计数器 + 命名参数

```javascript
// must.config.js
module.exports = {
  appName: 'myapp',
  sourceLanguage: 'zh-CN',
  targetLanguages: ['en'],
  translationProvider: 'baidu',
  apiKey: process.env.BAIDU_APP_ID,
  apiSecret: process.env.BAIDU_APP_KEY,
  outputDir: 'src/i18n',
  inputPatterns: ['src/**/*.{ts,tsx}'],
  excludePatterns: ['node_modules/**', 'src/i18n/**'],
  
  // Key 使用前缀 + 5位数字 + 参数名
  keyConfig: {
    prefix: 'CB_IBG_APPROLL_',
    prefixOnly: true,
    counterPadding: 5,
    counterStart: 0,
    includeParams: true,  // ✅ 包含命名参数
  },
  
  interpolation: {
    prefix: '{',
    suffix: '}',
    namedParams: true,  // ✅ 启用命名参数
    translationFormat: 'xml',
  },
  
  transform: {
    enabled: true,
    importStatement: {
      unified: true,
      global: "import { trans } from '@/i18n-utils';",
      wrapper: (key, text, interpolations) => {
        if (interpolations?.length) {
          const params = interpolations.join(', ');
          return `trans('${key}', { ${params} })`;
        }
        return `trans('${key}')`;
      },
    },
  }
};

// 源代码: `欢迎 ${username}，您有 ${count} 条消息`
// 生成的 key: CB_IBG_APPROLL_00000_{username}_{count}
// 转换后: trans('CB_IBG_APPROLL_00000_{username}_{count}', { username, count })
```

### 示例 4：自定义 Key 生成函数

```javascript
// must.config.js
module.exports = {
  appName: 'myapp',
  sourceLanguage: 'zh-CN',
  targetLanguages: ['en'],
  translationProvider: 'baidu',
  apiKey: process.env.BAIDU_APP_ID,
  apiSecret: process.env.BAIDU_APP_KEY,
  outputDir: 'src/i18n',
  inputPatterns: ['src/**/*.{ts,tsx}'],
  excludePatterns: ['node_modules/**', 'src/i18n/**'],
  
  interpolation: {
    prefix: '{',
    suffix: '}',
    namedParams: true,
    includeParamsInKey: true,
  },
  
  keyConfig: {
    generator: ({ base, text, num, params }) => {
      let key = `${base}.${text}`;
      
      // 添加命名参数
      if (params?.length) {
        key += params.map(p => `_{${p}}`).join('');
      }
      
      // 处理重复
      if (num > 0) {
        key += `.${num}`;
      }
      
      return key;
    }
  },
  
  transform: {
    enabled: true,
    importStatement: {
      unified: true,
      global: "import { t } from '@/i18n';",
      wrapper: (key, text, interpolations) => {
        if (interpolations?.length) {
          const params = interpolations.join(', ');
          return `t('${key}', { ${params} })`;
        }
        return `t('${key}')`;
      },
    },
  }
};

// 生成的 key: myapp.Home.welcome_{username}_{count}
// 转换后: t('myapp.Home.welcome_{username}_{count}', { username, count })
```

---

## 🏗️ 项目结构

```
must/
├── packages/
│   ├── types/              # TypeScript 类型定义
│   └── must/               # 主包（CLI + 核心逻辑）
│       ├── src/
│       │   ├── cli/        # CLI 命令
│       │   ├── config/     # 配置管理
│       │   ├── extractors/ # 文案提取器
│       │   ├── translators/# 翻译服务
│       │   ├── transformer/# 代码转换器
│       │   └── utils/      # 工具函数
├── playground/             # 测试环境
├── playground-unified/     # 统一模式测试环境
└── pnpm-workspace.yaml
```

---

## 🧪 本地开发

### 安装依赖

```bash
pnpm install
```

### 构建

```bash
pnpm build
```

### 在 Playground 中测试

```bash
cd playground
pnpm must
```

### 开发模式

```bash
# 监听变化
pnpm --filter must dev

# 在另一个终端测试
cd playground && pnpm must
```

---

## 📄 许可证

MIT
