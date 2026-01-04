import { Command } from 'commander';
import { AutoI18n } from '../index';
import { ConfigManager, createDefaultConfig } from '../config';
import { I18nConfig } from '../types';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';

const program = new Command();

program
  .name('must')
  .description('Automated internationalization tool for extracting and translating text')
  .version('1.0.0');

// Default action when no command is specified
program
  .option('--key-prefix <prefix>', 'Custom key prefix (e.g., CB_IBG_APPROLL_)')
  .option('--key-counter-padding <num>', 'Counter padding (e.g., 5 for 00001)', parseInt)
  .option('--key-counter-start <num>', 'Counter start value', parseInt)
  .option('--key-prefix-only', 'Use prefix + counter only mode')
  .action(async (options) => {
    try {
      const spinner = ora('Initializing...').start();
      
      const configManager = new ConfigManager();
      const config = configManager.getConfig();
      
      // 应用命令行的 key 配置
      if (options.keyPrefix || options.keyCounterPadding !== undefined || 
          options.keyCounterStart !== undefined || options.keyPrefixOnly) {
        config.keyConfig = config.keyConfig || {};
        if (options.keyPrefix) config.keyConfig.prefix = options.keyPrefix;
        if (options.keyCounterPadding !== undefined) config.keyConfig.counterPadding = options.keyCounterPadding;
        if (options.keyCounterStart !== undefined) config.keyConfig.counterStart = options.keyCounterStart;
        if (options.keyPrefixOnly) config.keyConfig.prefixOnly = true;
      }
      
      const autoI18n = new AutoI18n(config);
      await autoI18n.run();
      
      spinner.succeed('Process completed successfully!');
    } catch (error) {
      console.error(chalk.red('Process failed:'), error);
      process.exit(1);
    }
  });

// Extract command
program
  .command('extract')
  .description('Extract text strings from project files')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-o, --output <dir>', 'Output directory for extracted texts', 'i18n/strings')
  .option('-p, --patterns <patterns...>', 'File patterns to include')
  .option('-e, --exclude <patterns...>', 'File patterns to exclude')
  .action(async (options) => {
    try {
      const spinner = ora('Initializing...').start();

      const configManager = new ConfigManager(options.config);
      const config = configManager.getConfig();

      // Override config with CLI options
      if (options.output) config.outputDir = options.output;
      if (options.patterns) config.inputPatterns = options.patterns;
      if (options.exclude) config.excludePatterns = options.exclude;

      const autoI18n = new AutoI18n(config);
      spinner.text = 'Extracting texts...';

      const extractedTexts = await autoI18n.extractTexts();
      await autoI18n.generateReport(extractedTexts);

      spinner.succeed(`Extracted ${extractedTexts.length} text strings`);
    } catch (error) {
      console.error(chalk.red('Extraction failed:'), error);
      process.exit(1);
    }
  });

// Translate command
program
  .command('translate')
  .description('Extract and translate text strings')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-s, --source <lang>', 'Source language code', 'en')
  .option('-t, --target <languages...>', 'Target language codes', ['zh-CN'])
  .option('-p, --provider <provider>', 'Translation provider', 'google')
  .option('-k, --api-key <key>', 'API key for translation service')
  .option('--api-secret <secret>', 'API secret (for Baidu)')
  .option('--region <region>', 'Region (for Azure)')
  .action(async (options) => {
    try {
      const spinner = ora('Initializing translation...').start();

      const configManager = new ConfigManager(options.config);
      const config = configManager.getConfig();

      // Override config with CLI options
      config.sourceLanguage = options.source;
      config.targetLanguages = options.target;
      config.translationProvider = options.provider as any;
      if (options.apiKey) config.apiKey = options.apiKey;
      if (options.apiSecret) config.apiSecret = options.apiSecret;
      if (options.region) config.region = options.region;

      const autoI18n = new AutoI18n(config);
      await autoI18n.run();

      spinner.succeed('Translation completed successfully!');
    } catch (error) {
      console.error(chalk.red('Translation failed:'), error);
      process.exit(1);
    }
  });

// Init command
program
  .command('init')
  .description('Initialize configuration file')
  .option('-o, --output <path>', 'Output path for config file', 'i18n.config.json')
  .action(async (options) => {
    try {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'sourceLanguage',
          message: 'Source language code:',
          default: 'en'
        },
        {
          type: 'input',
          name: 'targetLanguages',
          message: 'Target language codes (comma-separated):',
          default: 'zh-CN'
        },
        {
          type: 'list',
          name: 'translationProvider',
          message: 'Translation provider:',
          choices: ['google', 'baidu', 'azure'],
          default: 'google'
        },
        {
          type: 'input',
          name: 'outputDir',
          message: 'Output directory:',
          default: 'i18n/strings'
        }
      ]);

      const config: I18nConfig = {
        ...createDefaultConfig(),
        sourceLanguage: answers.sourceLanguage,
        targetLanguages: answers.targetLanguages.split(',').map((s: string) => s.trim()),
        translationProvider: answers.translationProvider,
        outputDir: answers.outputDir
      };

      const fs = require('fs');
      fs.writeFileSync(options.output, JSON.stringify(config, null, 2));

      console.log(chalk.green(`Configuration file created at ${options.output}`));
    } catch (error) {
      console.error(chalk.red('Init failed:'), error);
      process.exit(1);
    }
  });

// Validate command
program
  .command('validate')
  .description('Validate configuration')
  .option('-c, --config <path>', 'Path to configuration file')
  .action(async (options) => {
    try {
      const configManager = new ConfigManager(options.config);
      const validation = configManager.validateConfig();

      if (validation.valid) {
        console.log(chalk.green('✅ Configuration is valid'));
      } else {
        console.log(chalk.red('❌ Configuration has errors:'));
        validation.errors.forEach(error => {
          console.log(chalk.red(`  - ${error}`));
        });
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('Validation failed:'), error);
      process.exit(1);
    }
  });

program.parse();

