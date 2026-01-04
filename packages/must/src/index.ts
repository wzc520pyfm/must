import { ConfigManager } from './config';
import { TextExtractor } from './extractors';
import { TranslationManager } from './translators';
import { CodeTransformer } from './transformer';
import { findFiles, ensureOutputDirectory, writeI18nFile, groupTextsByFile } from './utils/file';
import { deduplicateTexts, generateKey } from './utils/text';
import { I18nConfig, ExtractedText, ExtractionWarning } from '@must/types';
import * as fs from 'fs';
import * as path from 'path';

export class AutoI18n {
  private config: I18nConfig;
  private extractor: TextExtractor;
  private translator: TranslationManager;
  private existingKeys: Set<string> = new Set();

  constructor(config?: I18nConfig) {
    const configManager = new ConfigManager();
    this.config = config || configManager.getConfig();
    // 传递源语言和插值配置给提取器
    this.extractor = new TextExtractor({
      sourceLanguage: this.config.sourceLanguage,
      interpolation: this.config.interpolation
    });
    this.translator = new TranslationManager(this.config);
    
    // 加载已存在的 keys
    this.loadExistingKeys();
  }

  /**
   * 加载已存在的翻译 keys
   */
  private loadExistingKeys(): void {
    try {
      const sourceFile = path.join(this.config.outputDir, `${this.config.sourceLanguage}.json`);
      if (fs.existsSync(sourceFile)) {
        const content = fs.readFileSync(sourceFile, 'utf-8');
        const translations = JSON.parse(content);
        Object.keys(translations).forEach(key => this.existingKeys.add(key));
      }
    } catch (error) {
      // 如果文件不存在或无法读取，继续使用空的 keys
    }
  }

  async extractTexts(): Promise<ExtractedText[]> {
    const result = await this.extractTextsWithWarnings();
    return result.texts;
  }

  async extractTextsWithWarnings(): Promise<{ texts: ExtractedText[], warnings: ExtractionWarning[] }> {
    console.log('🔍 Extracting texts from files...');

    const files = await findFiles(this.config.inputPatterns, this.config.excludePatterns);
    console.log(`📁 Found ${files.length} files to process`);

    const allExtractedTexts: ExtractedText[] = [];
    this.extractor.clearWarnings();

    for (const file of files) {
      try {
        const result = await this.extractor.extractFromFileWithWarnings(file);
        allExtractedTexts.push(...result.texts);
      } catch (error) {
        console.warn(`⚠️  Failed to extract from ${file}:`, error);
      }
    }

    const warnings = this.extractor.getWarnings();
    
    // 如果有警告，输出提示
    if (warnings.length > 0) {
      const errorCount = warnings.filter(w => w.severity === 'error').length;
      const warningCount = warnings.filter(w => w.severity === 'warning').length;
      const infoCount = warnings.filter(w => w.severity === 'info').length;
      
      if (errorCount > 0 || warningCount > 0) {
        console.log(`⚠️  发现 ${warnings.length} 条提取警告 (${errorCount} 错误, ${warningCount} 警告, ${infoCount} 信息)`);
      }
    }

    console.log(`✅ Extracted ${allExtractedTexts.length} text strings`);
    return { texts: allExtractedTexts, warnings };
  }

  async translateTexts(extractedTexts: ExtractedText[]): Promise<{
    translations: Record<string, Record<string, string>>,
    sourceMap: Record<string, ExtractedText>
  }> {
    console.log('🌐 Translating texts...');

    // 去重并保留第一个出现的位置信息
    const textMap = new Map<string, ExtractedText>();
    extractedTexts.forEach(extracted => {
      const normalized = extracted.text.trim();
      if (normalized && !textMap.has(normalized)) {
        textMap.set(normalized, extracted);
      }
    });

    const uniqueTexts = Array.from(textMap.keys());
    console.log(`📝 Found ${uniqueTexts.length} unique texts to translate`);

    // Translate to all target languages
    const translations = await this.translator.translateToMultipleLanguages(
      uniqueTexts,
      this.config.sourceLanguage,
      this.config.targetLanguages
    );

    // Generate keys and organize translations
    const result: Record<string, Record<string, string>> = {};
    const sourceMap: Record<string, ExtractedText> = {};

    // 初始化每个语言的翻译对象
    for (const targetLang of this.config.targetLanguages) {
      result[targetLang] = {};
    }

    // 处理源语言
    result[this.config.sourceLanguage] = {};

    // 创建 text -> existing key 的映射
    const existingTextToKey = new Map<string, string>();
    try {
      const sourceFile = path.join(this.config.outputDir, `${this.config.sourceLanguage}.json`);
      if (fs.existsSync(sourceFile)) {
        const content = JSON.parse(fs.readFileSync(sourceFile, 'utf-8'));
        Object.entries(content).forEach(([key, text]) => {
          existingTextToKey.set(text as string, key);
        });
      }
    } catch (error) {
      // 忽略错误
    }

    // 全局计数器（用于 prefixOnly 或 always 计数器模式）
    const globalCounter = { value: this.config.keyConfig?.counterStart ?? 0 };

    for (const sourceText of uniqueTexts) {
      const extracted = textMap.get(sourceText)!;
      
      // 如果文本已经存在，使用已有的 key
      let key: string;
      if (existingTextToKey.has(sourceText)) {
        key = existingTextToKey.get(sourceText)!;
      } else {
        // 获取英文翻译用于生成 key
        const enTranslations = translations['en'] || translations[this.config.targetLanguages[0]];
        const enTranslation = enTranslations?.find(t => t.sourceText === sourceText);
        const translatedForKey = enTranslation?.translatedText || sourceText;
        
        // 从 context 中提取参数名（如果启用了 includeParams 或 includeParamsInKey）
        let paramNames: string[] | undefined;
        const shouldIncludeParams = this.config.keyConfig?.includeParams || 
                                    this.config.interpolation?.includeParamsInKey;
        
        if (shouldIncludeParams) {
          // 首先尝试从 context 中获取（模板字符串）
          if (extracted.context) {
            try {
              const ctx = JSON.parse(extracted.context);
              paramNames = ctx.paramNames;
            } catch {
              // 忽略解析错误
            }
          }
          
          // 如果没有从 context 获取到，尝试从文本中提取 {name} 格式的参数
          if (!paramNames || paramNames.length === 0) {
            const prefix = this.config.interpolation?.prefix || '{{';
            const suffix = this.config.interpolation?.suffix || '}}';
            // 构建正则表达式来匹配占位符
            const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const escapedSuffix = suffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`${escapedPrefix}([a-zA-Z_][a-zA-Z0-9_]*)${escapedSuffix}`, 'g');
            const matches = [...sourceText.matchAll(regex)];
            if (matches.length > 0) {
              paramNames = matches.map(m => m[1]);
            }
          }
        }
        
        // 生成新的唯一 key
        key = generateKey({
          text: sourceText,
          filePath: extracted.file,
          translatedText: translatedForKey,
          appName: this.config.appName,
          keyStyle: this.config.keyStyle || 'dot',
          existingKeys: this.existingKeys,
          maxKeyLength: this.config.keyMaxLength || 50,
          paramNames,
          keyConfig: this.config.keyConfig,
          globalCounter
        });
        this.existingKeys.add(key);
      }
      
      sourceMap[key] = extracted;

      // 添加源语言文本
      result[this.config.sourceLanguage][key] = sourceText;

      // 添加目标语言翻译
      for (const targetLang of this.config.targetLanguages) {
        const langTranslations = translations[targetLang];
        if (langTranslations) {
          const translation = langTranslations.find(t => t.sourceText === sourceText);
          result[targetLang][key] = translation?.translatedText || sourceText;
        }
      }
    }

    console.log('✅ Translation completed');
    return { translations: result, sourceMap };
  }

  async generateI18nFiles(
    translations: Record<string, Record<string, string>>,
    sourceMap: Record<string, ExtractedText>
  ): Promise<void> {
    console.log('📄 Generating i18n files...');

    ensureOutputDirectory(this.config.outputDir);

    // 加载现有翻译
    const existingTranslations: Record<string, Record<string, string>> = {};
    for (const lang of [this.config.sourceLanguage, ...this.config.targetLanguages]) {
      const langFile = path.join(this.config.outputDir, `${lang}.json`);
      if (fs.existsSync(langFile)) {
        existingTranslations[lang] = JSON.parse(fs.readFileSync(langFile, 'utf-8'));
      } else {
        existingTranslations[lang] = {};
      }
    }

    // 合并新旧翻译
    const mergedTranslations: Record<string, Record<string, string>> = {};
    const newTranslations: Record<string, Record<string, string>> = {};

    for (const lang of [this.config.sourceLanguage, ...this.config.targetLanguages]) {
      mergedTranslations[lang] = { ...existingTranslations[lang] };
      newTranslations[lang] = {};

      // 添加新的翻译
      for (const [key, value] of Object.entries(translations[lang] || {})) {
        if (!existingTranslations[lang][key]) {
          // 这是新增的翻译
          newTranslations[lang][key] = value;
        }
        mergedTranslations[lang][key] = value;
      }
    }

    // 写入完整的翻译文件
    for (const [language, texts] of Object.entries(mergedTranslations)) {
      writeI18nFile(this.config.outputDir, language, texts);
      console.log(`📝 Generated ${language}.json with ${Object.keys(texts).length} translations`);
    }

    // 生成 patch 文件（仅包含新增的翻译）
    await this.generatePatchFiles(newTranslations, sourceMap);
  }

  async generatePatchFiles(
    newTranslations: Record<string, Record<string, string>>,
    sourceMap: Record<string, ExtractedText>
  ): Promise<void> {
    const patchDir = this.config.patchDir || path.join(this.config.outputDir, 'patches');
    
    // 检查是否有新增翻译
    const hasNewTranslations = Object.values(newTranslations).some(
      translations => Object.keys(translations).length > 0
    );

    if (!hasNewTranslations) {
      console.log('ℹ️  No new translations to patch');
      return;
    }

    ensureOutputDirectory(patchDir);

    // 生成与 i18n 目录相同结构的 patch 文件
    // patches 目录下只包含本次新增的翻译
    let newCount = 0;
    for (const lang of [this.config.sourceLanguage, ...this.config.targetLanguages]) {
      const langTranslations = newTranslations[lang];
      if (langTranslations && Object.keys(langTranslations).length > 0) {
        const patchPath = path.join(patchDir, `${lang}.json`);
        writeI18nFile(patchDir, lang, langTranslations);
        newCount = Object.keys(langTranslations).length;
      }
    }

    console.log(`📦 Generated patch files in ${patchDir} (${newCount} new translations)`);
  }

  async transformSourceFiles(
    translations: Record<string, Record<string, string>>
  ): Promise<void> {
    if (!this.config.transform?.enabled) {
      return;
    }

    console.log('🔄 Transforming source files...');

    // 创建 text -> key 的映射
    const keyMap = new Map<string, string>();
    const sourceTranslations = translations[this.config.sourceLanguage];
    Object.entries(sourceTranslations).forEach(([key, text]) => {
      keyMap.set(text, key);
    });

    // 创建转换器
    const transformer = new CodeTransformer(this.config, keyMap);

    // 获取需要转换的文件
    const files = await findFiles(this.config.inputPatterns, this.config.excludePatterns);
    
    let transformedCount = 0;
    for (const file of files) {
      try {
        const code = fs.readFileSync(file, 'utf-8');
        const result = await transformer.transform(code, file);

        if (result.modified) {
          fs.writeFileSync(file, result.code, 'utf-8');
          transformedCount++;
          console.log(`  ✓ Transformed ${file}`);
        }
      } catch (error) {
        console.warn(`  ⚠️  Failed to transform ${file}:`, error);
      }
    }

    console.log(`✅ Transformed ${transformedCount} files`);
  }

  async generateReport(extractedTexts: ExtractedText[]): Promise<void> {
    console.log('📊 Generating extraction report...');

    const groupedByFile = groupTextsByFile(extractedTexts);
    const report = {
      summary: {
        totalFiles: groupedByFile.size,
        totalTexts: extractedTexts.length,
        uniqueTexts: deduplicateTexts(extractedTexts.map(t => t.text)).length
      },
      byFile: Object.fromEntries(groupedByFile)
    };

    ensureOutputDirectory(this.config.outputDir);

    const reportPath = path.join(this.config.outputDir, 'extraction-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`📋 Report saved to ${reportPath}`);
  }

  /**
   * 生成警告日志文件
   */
  async generateWarningsLog(warnings: ExtractionWarning[]): Promise<void> {
    if (warnings.length === 0) {
      return;
    }

    ensureOutputDirectory(this.config.outputDir);
    const logPath = path.join(this.config.outputDir, 'extraction-warnings.json');
    
    // 按文件分组警告
    const warningsByFile: Record<string, ExtractionWarning[]> = {};
    for (const warning of warnings) {
      if (!warningsByFile[warning.file]) {
        warningsByFile[warning.file] = [];
      }
      warningsByFile[warning.file].push(warning);
    }

    // 统计信息
    const summary = {
      total: warnings.length,
      byType: {} as Record<string, number>,
      bySeverity: {
        error: warnings.filter(w => w.severity === 'error').length,
        warning: warnings.filter(w => w.severity === 'warning').length,
        info: warnings.filter(w => w.severity === 'info').length
      }
    };

    // 按类型统计
    for (const warning of warnings) {
      summary.byType[warning.type] = (summary.byType[warning.type] || 0) + 1;
    }

    const logContent = {
      generatedAt: new Date().toISOString(),
      summary,
      warningsByFile
    };

    fs.writeFileSync(logPath, JSON.stringify(logContent, null, 2), 'utf-8');
    
    // 控制台输出警告摘要
    console.log(`⚠️  警告日志已保存到 ${logPath}`);
    
    // 输出主要警告到控制台
    const errorWarnings = warnings.filter(w => w.severity === 'error');
    const importantWarnings = warnings.filter(w => w.severity === 'warning');
    
    if (errorWarnings.length > 0) {
      console.log('\n❌ 错误:');
      errorWarnings.slice(0, 5).forEach(w => {
        console.log(`   ${w.file}:${w.line} - ${w.message}`);
      });
      if (errorWarnings.length > 5) {
        console.log(`   ... 还有 ${errorWarnings.length - 5} 条错误`);
      }
    }
    
    if (importantWarnings.length > 0) {
      console.log('\n⚠️  警告:');
      importantWarnings.slice(0, 5).forEach(w => {
        console.log(`   ${w.file}:${w.line} - ${w.message}`);
      });
      if (importantWarnings.length > 5) {
        console.log(`   ... 还有 ${importantWarnings.length - 5} 条警告`);
      }
    }
  }

  async run(): Promise<void> {
    try {
      console.log('🚀 Starting auto i18n process...');

      const { texts: extractedTexts, warnings } = await this.extractTextsWithWarnings();
      
      // 生成警告日志
      if (warnings.length > 0) {
        await this.generateWarningsLog(warnings);
      }
      
      if (extractedTexts.length === 0) {
        console.log('ℹ️  No texts found to translate');
        return;
      }

      const { translations, sourceMap } = await this.translateTexts(extractedTexts);
      await this.generateI18nFiles(translations, sourceMap);
      await this.generateReport(extractedTexts);
      
      // 执行代码转换（如果启用）
      await this.transformSourceFiles(translations);

      console.log('🎉 Auto i18n process completed successfully!');
    } catch (error) {
      console.error('❌ Auto i18n process failed:', error);
      throw error;
    }
  }
}

export { ConfigManager, TextExtractor, TranslationManager };
export type { I18nConfig, ExtractedText, InterpolationConfig } from '@must/types';


