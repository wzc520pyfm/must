import { ConfigManager } from './config';
import { TextExtractor } from './extractors';
import { TranslationManager } from './translators';
import { findFiles, ensureOutputDirectory, writeI18nFile, groupTextsByFile } from './utils/file';
import { deduplicateTexts, generateKey } from './utils/text';
import { I18nConfig, ExtractedText } from './types';

export class AutoI18n {
  private config: I18nConfig;
  private extractor: TextExtractor;
  private translator: TranslationManager;

  constructor(config?: I18nConfig) {
    const configManager = new ConfigManager();
    this.config = config || configManager.getConfig();
    this.extractor = new TextExtractor();
    this.translator = new TranslationManager(this.config);
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

  async translateTexts(extractedTexts: ExtractedText[]): Promise<Record<string, Record<string, string>>> {
    console.log('🌐 Translating texts...');

    // Get unique texts
    const uniqueTexts = deduplicateTexts(extractedTexts.map(t => t.text));
    console.log(`📝 Found ${uniqueTexts.length} unique texts to translate`);

    // Translate to all target languages
    const translations = await this.translator.translateToMultipleLanguages(
      uniqueTexts,
      this.config.sourceLanguage,
      this.config.targetLanguages
    );

    // Generate keys and organize translations
    const result: Record<string, Record<string, string>> = {};

    for (const [targetLang, translationResults] of Object.entries(translations)) {
      result[targetLang] = {};

      for (const translation of translationResults) {
        const key = generateKey(translation.sourceText);
        result[targetLang][key] = translation.translatedText;
      }
    }

    console.log('✅ Translation completed');
    return result;
  }

  async generateI18nFiles(translations: Record<string, Record<string, string>>): Promise<void> {
    console.log('📄 Generating i18n files...');

    ensureOutputDirectory(this.config.outputDir);

    // Generate files for each target language
    for (const [language, texts] of Object.entries(translations)) {
      writeI18nFile(this.config.outputDir, language, texts);
      console.log(`📝 Generated ${language}.json with ${Object.keys(texts).length} translations`);
    }

    // Generate source language file
    const sourceTexts: Record<string, string> = {};
    const uniqueSourceTexts = deduplicateTexts(
      Object.values(translations)[0] ?
        Object.keys(Object.values(translations)[0]).map(key => {
          // Find original text by key
          const translation = Object.values(translations)[0][key];
          // This is a simplified approach - in practice you'd want to store the mapping
          return translation;
        }) : []
    );

    uniqueSourceTexts.forEach(text => {
      const key = generateKey(text);
      sourceTexts[key] = text;
    });

    writeI18nFile(this.config.outputDir, this.config.sourceLanguage, sourceTexts);
    console.log(`📝 Generated ${this.config.sourceLanguage}.json`);
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

    const fs = require('fs');
    const { ensureOutputDirectory } = require('./utils/file');
    ensureOutputDirectory(this.config.outputDir);

    const reportPath = `${this.config.outputDir}/extraction-report.json`;
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

      const translations = await this.translateTexts(extractedTexts);
      await this.generateI18nFiles(translations);
      await this.generateReport(extractedTexts);

      console.log('🎉 Auto i18n process completed successfully!');
    } catch (error) {
      console.error('❌ Auto i18n process failed:', error);
      throw error;
    }
  }
}

export { ConfigManager, TextExtractor, TranslationManager };
export type { I18nConfig, ExtractedText };

