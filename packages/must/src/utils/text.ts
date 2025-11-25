export function normalizeText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

export function generateKey(text: string, context?: string): string {
  // Generate a meaningful key from the text
  let key = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .substring(0, 50); // Limit length
  
  if (context) {
    const contextKey = context
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 20);
    key = `${contextKey}_${key}`;
  }
  
  return key || 'text';
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

