import { KeyConfig, KeyGeneratorParams } from '@must/types';

export function normalizeText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * 将文本转换为驼峰命名
 */
function toCamelCase(text: string, maxLength?: number): string {
  const result = text
    .replace(/[^\w\s]/g, '') // 移除特殊字符
    .split(/\s+/)
    .map((word, index) => {
      if (index === 0) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
  
  // 如果有最大长度限制，智能截断
  if (maxLength && result.length > maxLength) {
    return smartTruncate(result, maxLength);
  }
  
  return result;
}

/**
 * 智能截断：在驼峰边界处截断，保持可读性
 */
function smartTruncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  
  // 找到最接近 maxLength 的驼峰边界
  let truncateAt = maxLength;
  
  // 从 maxLength 往前找大写字母（驼峰边界）
  for (let i = maxLength; i > maxLength * 0.6; i--) {
    if (text[i] && text[i] === text[i].toUpperCase() && /[A-Z]/.test(text[i])) {
      truncateAt = i;
      break;
    }
  }
  
  return text.substring(0, truncateAt);
}

/**
 * 从文件路径生成路径部分（不含扩展名）
 */
export function generatePathPart(filePath: string, keyStyle: 'dot' | 'underscore' = 'dot'): string {
  const separator = keyStyle === 'dot' ? '.' : '_';
  return filePath
    .replace(/\.(tsx?|jsx?|vue|html)$/, '')
    .replace(/^(src\/|app\/|pages\/|components\/)/, '')
    .replace(/\\/g, '/')
    .split('/')
    .filter(Boolean)
    .join(separator);
}

/**
 * 格式化计数器
 */
function formatCounter(num: number, padding: number = 0): string {
  if (padding <= 0) {
    return String(num);
  }
  return String(num).padStart(padding, '0');
}

/**
 * 生成 text 部分（从翻译文本生成驼峰命名）
 */
export function generateTextPart(translatedText: string, maxLength: number = 30): string {
  return toCamelCase(translatedText, maxLength);
}

export interface GenerateKeyOptions {
  text: string;
  filePath: string;
  translatedText: string;
  appName?: string;
  keyStyle?: 'dot' | 'underscore';
  existingKeys?: Set<string>;
  maxKeyLength?: number;
  paramNames?: string[];
  keyConfig?: KeyConfig;
  /** 全局计数器（用于 prefixOnly 模式） */
  globalCounter?: { value: number };
}

/**
 * 生成唯一的 i18n key
 * 支持多种配置模式：
 * 1. 默认模式: {appName}.{filePath}.{text}[_{params}][.counter]
 * 2. 前缀模式: {prefix}{counter}
 * 3. 自定义函数模式: 完全由用户定义
 */
export function generateKey(options: GenerateKeyOptions): string;
/**
 * @deprecated 使用对象参数版本
 */
export function generateKey(
  text: string,
  filePath: string,
  translatedText: string,
  appName?: string,
  keyStyle?: 'dot' | 'underscore',
  existingKeys?: Set<string>,
  maxKeyLength?: number,
  paramNames?: string[],
  keyConfig?: KeyConfig,
  globalCounter?: { value: number }
): string;
export function generateKey(
  textOrOptions: string | GenerateKeyOptions,
  filePath?: string,
  translatedText?: string,
  appName?: string,
  keyStyle: 'dot' | 'underscore' = 'dot',
  existingKeys: Set<string> = new Set(),
  maxKeyLength: number = 50,
  paramNames?: string[],
  keyConfig?: KeyConfig,
  globalCounter?: { value: number }
): string {
  // 处理新的对象参数格式
  let opts: GenerateKeyOptions;
  if (typeof textOrOptions === 'object') {
    opts = textOrOptions;
  } else {
    opts = {
      text: textOrOptions,
      filePath: filePath!,
      translatedText: translatedText!,
      appName,
      keyStyle,
      existingKeys,
      maxKeyLength,
      paramNames,
      keyConfig,
      globalCounter
    };
  }

  const {
    text,
    filePath: fp,
    translatedText: tt,
    appName: app,
    keyStyle: ks = 'dot',
    existingKeys: ek = new Set(),
    maxKeyLength: mkl = 50,
    paramNames: pn,
    keyConfig: kc,
    globalCounter: gc
  } = opts;

  const separator = ks === 'dot' ? '.' : '_';
  
  // 生成各部分
  const base = generateBasePart(fp, app, ks);
  const textPart = generateTextPart(tt || text, mkl - base.length - 10);
  
  // 如果有自定义生成函数，使用它
  if (kc?.generator) {
    let num = gc?.value ?? kc.counterStart ?? 0;
    const generatorParams: KeyGeneratorParams = {
      base,
      text: textPart,
      num,
      params: pn,
      filePath: fp,
      originalText: text,
      translatedText: tt,
      appName: app
    };
    
    let key = kc.generator(generatorParams);
    
    // 处理重复 key
    while (ek.has(key)) {
      num++;
      generatorParams.num = num;
      key = kc.generator(generatorParams);
    }
    
    // 更新全局计数器
    if (gc) {
      gc.value = num + 1;
    }
    
    return key;
  }

  // 前缀模式: {prefix}{counter}[_{params}]
  if (kc?.prefixOnly && kc?.prefix) {
    const counterStart = kc.counterStart ?? 0;
    const counterPadding = kc.counterPadding ?? 0;
    let num = gc?.value ?? counterStart;
    
    // 生成参数后缀（如果启用了 includeParams）
    const paramsSuffix = (kc.includeParams && pn && pn.length > 0)
      ? pn.map(name => `_{${name}}`).join('')
      : '';
    
    let key = `${kc.prefix}${formatCounter(num, counterPadding)}${paramsSuffix}`;
    
    while (ek.has(key)) {
      num++;
      key = `${kc.prefix}${formatCounter(num, counterPadding)}${paramsSuffix}`;
    }
    
    // 更新全局计数器
    if (gc) {
      gc.value = num + 1;
    }
    
    return key;
  }

  // 默认模式: {prefix?}{base}.{text}[_{params}][.counter]
  const parts: string[] = [];
  
  // 添加前缀（如果有）
  if (kc?.prefix) {
    parts.push(kc.prefix);
  }
  
  // 添加 base 部分
  if (base) {
    parts.push(base);
  }
  
  // 添加 text 部分
  if (textPart) {
    parts.push(textPart);
  }
  
  // 生成基础 key
  let baseKey = parts.filter(Boolean).join(separator);
  
  // 添加参数后缀
  if (pn && pn.length > 0) {
    baseKey += pn.map(name => `_{${name}}`).join('');
  }
  
  // 处理计数器
  const counterStyle = kc?.counterStyle ?? 'auto';
  const counterStart = kc?.counterStart ?? 0;
  const counterPadding = kc?.counterPadding ?? 0;
  
  if (counterStyle === 'always') {
    // 始终添加计数器
    const num = gc?.value ?? counterStart;
    const finalKey = `${baseKey}${separator}${formatCounter(num, counterPadding)}`;
    if (gc) {
      gc.value = num + 1;
    }
    return finalKey;
  }
  
  if (counterStyle === 'none') {
    // 不添加计数器（可能会有重复）
    return baseKey;
  }
  
  // auto 模式：仅在重复时添加计数器
  let finalKey = baseKey;
  let counter = 1;
  
  while (ek.has(finalKey)) {
    finalKey = `${baseKey}${separator}${counter}`;
    counter++;
  }
  
  return finalKey;
}

/**
 * 生成 base 部分（appName + filePath）
 */
function generateBasePart(filePath: string, appName?: string, keyStyle: 'dot' | 'underscore' = 'dot'): string {
  const separator = keyStyle === 'dot' ? '.' : '_';
  const parts: string[] = [];
  
  if (appName) {
    parts.push(appName.toLowerCase().replace(/[^\w]/g, ''));
  }
  
  const pathPart = generatePathPart(filePath, keyStyle);
  if (pathPart) {
    parts.push(pathPart);
  }
  
  return parts.join(separator);
}

export function deduplicateTexts(texts: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];
  
  for (const text of texts) {
    const normalized = normalizeText(text);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      unique.push(text);
    }
  }
  
  return unique;
}

export function isSimilarText(text1: string, text2: string, threshold: number = 0.8): boolean {
  const normalized1 = normalizeText(text1);
  const normalized2 = normalizeText(text2);
  
  if (normalized1 === normalized2) return true;
  
  // Simple similarity check based on common words
  const words1 = new Set(normalized1.split(' '));
  const words2 = new Set(normalized2.split(' '));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  const similarity = intersection.size / union.size;
  return similarity >= threshold;
}



