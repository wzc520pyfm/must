import { glob } from 'glob';
import { ensureDirSync, writeFileSync, existsSync, statSync } from 'fs-extra';
import { join, resolve, isAbsolute } from 'path';

export interface FindFilesOptions {
  /** 文件匹配模式 */
  patterns: string[];
  /** 排除模式 */
  excludePatterns?: string[];
  /** 输入目录，patterns 将相对于此目录匹配 */
  inputDir?: string;
  /** 指定的文件或目录列表 */
  inputFiles?: string[];
}

/**
 * 规范化路径：处理绝对路径、相对路径、以及拖入终端产生的带转义的路径
 */
function normalizePath(inputPath: string, cwd: string): string {
  // 去除路径两端的空白和引号（拖入终端可能带引号）
  let normalized = inputPath.trim().replace(/^["']|["']$/g, '');

  // 处理转义的空格（如 /path/to/my\ folder）
  normalized = normalized.replace(/\\ /g, ' ');

  // 如果是绝对路径直接返回，否则相对于 cwd 解析
  return isAbsolute(normalized) ? normalized : resolve(cwd, normalized);
}

/**
 * 查找文件
 * 支持三种模式：
 * 1. 只使用 patterns：在当前目录下匹配
 * 2. patterns + inputDir：在指定目录下匹配
 * 3. patterns + inputFiles：只在指定的文件/目录中匹配
 * 
 * 支持绝对路径和相对路径，可以直接将文件夹拖入终端使用
 */
export async function findFiles(
  patternsOrOptions: string[] | FindFilesOptions,
  excludePatterns: string[] = []
): Promise<string[]> {
  // 兼容旧的调用方式
  const options: FindFilesOptions = Array.isArray(patternsOrOptions)
    ? { patterns: patternsOrOptions, excludePatterns }
    : patternsOrOptions;

  const {
    patterns,
    excludePatterns: exclude = [],
    inputDir,
    inputFiles
  } = options;

  const allFiles: string[] = [];
  const cwd = process.cwd();

  // 如果指定了 inputFiles，优先处理
  if (inputFiles && inputFiles.length > 0) {
    for (const inputPath of inputFiles) {
      const absolutePath = normalizePath(inputPath, cwd);

      if (!existsSync(absolutePath)) {
        console.warn(`⚠️  Path not found: ${inputPath}`);
        continue;
      }

      const stat = statSync(absolutePath);

      if (stat.isFile()) {
        // 如果是文件，检查是否匹配 patterns
        const matchesPattern = patterns.some(pattern => {
          // 简单的扩展名匹配
          if (pattern.includes('*.')) {
            const ext = pattern.match(/\*\.(\{[^}]+\}|\w+)$/)?.[1];
            if (ext) {
              // 处理 {ts,tsx} 格式
              if (ext.startsWith('{') && ext.endsWith('}')) {
                const exts = ext.slice(1, -1).split(',');
                return exts.some(e => absolutePath.endsWith(`.${e}`));
              }
              return absolutePath.endsWith(`.${ext}`);
            }
          }
          return true; // 如果不是扩展名模式，默认匹配
        });

        if (matchesPattern) {
          allFiles.push(absolutePath);
        }
      } else if (stat.isDirectory()) {
        // 如果是目录，在该目录下使用 patterns 匹配
        for (const pattern of patterns) {
          const files = await glob(pattern, {
            cwd: absolutePath,
            ignore: exclude,
            nodir: true,
            absolute: true
          });
          allFiles.push(...files);
        }
      }
    }
  } else {
    // 使用 inputDir 或当前目录
    // inputDir 也支持绝对路径（如拖入终端的路径）
    const searchDir = inputDir ? normalizePath(inputDir, cwd) : cwd;

    if (inputDir && !existsSync(searchDir)) {
      console.warn(`⚠️  Input directory not found: ${inputDir}`);
      return [];
    }

    for (const pattern of patterns) {
      const files = await glob(pattern, {
        cwd: searchDir,
        ignore: exclude,
        nodir: true,
        absolute: true
      });
      allFiles.push(...files);
    }
  }

  return [...new Set(allFiles)]; // Remove duplicates
}

/**
 * 简化版本：直接使用 patterns 匹配（兼容旧代码）
 */
export async function findFilesByPatterns(
  patterns: string[],
  excludePatterns: string[] = []
): Promise<string[]> {
  return findFiles({ patterns, excludePatterns });
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

