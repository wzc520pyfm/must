import { glob } from 'glob';
import { ensureDirSync, writeFileSync, existsSync } from 'fs-extra';
import { join } from 'path';

export async function findFiles(
  patterns: string[],
  excludePatterns: string[] = []
): Promise<string[]> {
  const allFiles: string[] = [];

  for (const pattern of patterns) {
    const files = await glob(pattern, {
      ignore: excludePatterns,
      nodir: true
    });
    allFiles.push(...files);
  }

  return [...new Set(allFiles)]; // Remove duplicates
}

export function ensureOutputDirectory(outputDir: string): void {
  if (!existsSync(outputDir)) {
    ensureDirSync(outputDir);
  }
}

export function writeI18nFile(
  outputDir: string,
  language: string,
  data: Record<string, string>
): void {
  const filePath = join(outputDir, `${language}.json`);
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function groupTextsByFile(extractedTexts: any[]): Map<string, any[]> {
  const grouped = new Map<string, any[]>();

  for (const text of extractedTexts) {
    const file = text.file;
    if (!grouped.has(file)) {
      grouped.set(file, []);
    }
    grouped.get(file)!.push(text);
  }

  return grouped;
}

