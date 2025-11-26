export function normalizeText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * 将文本转换为驼峰命名
 */
function toCamelCase(text: string): string {
  return text
    .replace(/[^\w\s]/g, '') // 移除特殊字符
    .split(/\s+/)
    .map((word, index) => {
      if (index === 0) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
}

/**
 * 从文件路径生成路径部分（不含扩展名）
 */
function generatePathPart(filePath: string): string {
  return filePath
    .replace(/\.(tsx?|jsx?|vue|html)$/, '')
    .replace(/^(src\/|app\/|pages\/|components\/)/, '')
    .replace(/\\/g, '/')
    .split('/')
    .filter(Boolean)
    .join('.');
}

/**
 * 生成唯一的 i18n key
 * 使用英文翻译作为 key 的一部分
 * 格式: {appName}.{filePath}.{translatedKey}[_{counter}]
 */
export function generateKey(
  text: string,
  filePath: string,
  translatedText: string,  // 英文翻译
  appName?: string,
  keyStyle: 'dot' | 'underscore' = 'dot',
  existingKeys: Set<string> = new Set()
): string {
  const separator = keyStyle === 'dot' ? '.' : '_';
  const parts: string[] = [];
  
  // 添加应用名称
  if (appName) {
    parts.push(appName.toLowerCase().replace(/[^\w]/g, ''));
  }
  
  // 添加文件路径
  const pathPart = generatePathPart(filePath);
  if (pathPart) {
    if (keyStyle === 'dot') {
      parts.push(pathPart);
    } else {
      parts.push(pathPart.replace(/\./g, '_'));
    }
  }
  
  // 使用英文翻译生成 key 的最后部分
  const translatedKey = toCamelCase(translatedText);
  if (translatedKey) {
    parts.push(translatedKey);
  } else {
    // 如果翻译为空，使用原文
    parts.push(toCamelCase(text));
  }
  
  // 生成基础 key
  let baseKey = parts.filter(Boolean).join(separator);
  
  // 如果 key 已存在，添加计数器
  let finalKey = baseKey;
  let counter = 1;
  
  while (existingKeys.has(finalKey)) {
    finalKey = `${baseKey}${separator}${counter}`;
    counter++;
  }
  
  return finalKey;
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



