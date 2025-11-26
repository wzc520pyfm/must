export function normalizeText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * 生成翻译后文本的简短版本（用于 key）
 */
function generateShortTranslation(text: string, maxLength: number = 30): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fa5]/g, '') // 保留字母、数字、空格和中文
    .replace(/\s+/g, '_')
    .substring(0, maxLength);
}

/**
 * 从文件路径生成简短的路径标识
 */
function generatePathKey(filePath: string): string {
  // 移除文件扩展名和常见的目录前缀
  return filePath
    .replace(/\.(tsx?|jsx?|vue|html)$/, '')
    .replace(/^(src\/|app\/|pages\/|components\/)/, '')
    .replace(/[\/\\]/g, '_')
    .toLowerCase();
}

/**
 * 生成唯一的 i18n key
 * 格式: {appName}_{filePath}_{shortTranslation}[_{counter}]
 */
export function generateKey(
  text: string, 
  filePath: string,
  appName?: string,
  existingKeys: Set<string> = new Set()
): string {
  const parts: string[] = [];
  
  // 添加应用名称
  if (appName) {
    parts.push(appName.toLowerCase().replace(/[^\w]/g, '_'));
  }
  
  // 添加文件路径
  const pathKey = generatePathKey(filePath);
  parts.push(pathKey);
  
  // 添加文本的简短翻译
  const shortText = generateShortTranslation(text);
  parts.push(shortText);
  
  // 生成基础 key
  let baseKey = parts.filter(Boolean).join('_');
  
  // 如果 key 已存在，添加计数器
  let finalKey = baseKey;
  let counter = 1;
  
  while (existingKeys.has(finalKey)) {
    finalKey = `${baseKey}_${counter}`;
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


