import { ConfigManager } from './config';
import { TextExtractor } from './extractors';
import { TranslationManager } from './translators';
import { CodeTransformer } from './transformer';
import { findFiles, ensureOutputDirectory, writeI18nFile, groupTextsByFile } from './utils/file';
import { deduplicateTexts, generateKey } from './utils/text';
import { I18nConfig, ExtractedText } from '@must/types';
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
    console.log('🔍 Extracting texts from files...');

    const files = await findFiles(this.config.inputPatterns, this.config.excludePatterns);
    console.log(`📁 Found ${files.length} files to process`);

    const allExtractedTexts: ExtractedText[] = [];

    for (const file of files) {
      try {
        const texts = await this.extractor.extractFromFile(file);
        allExtractedTexts.push(...texts);
      } catch (error) {
        console.warn(`⚠️  Failed to extract from ${file}:`, error);
      }
    }

    console.log(`✅ Extracted ${allExtractedTexts.length} text strings`);
    return allExtractedTexts;
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
        
        // 生成新的唯一 key
        key = generateKey(
          sourceText,
          extracted.file,
          translatedForKey,
          this.config.appName,
          this.config.keyStyle || 'dot',
          this.existingKeys,
          this.config.keyMaxLength || 50
        );
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

  async run(): Promise<void> {
    try {
      console.log('🚀 Starting auto i18n process...');

      const extractedTexts = await this.extractTexts();
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


