import { Command } from 'commander';
import { handleImageProcessCommand, type ImageCommandOptions } from './image-shared.js';

export function registerImageSynthesizeCommand(program: Command): void {
  program
    .command('image-synthesize')
    .description('synthesize PII in an image (replace with fake data)')
    .requiredOption('-i, --image <path>', 'path to image file')
    .requiredOption('-o, --output <path>', 'output path for processed PNG')
    .option('-l, --language <code>', 'Tesseract language code (default: eng)', 'eng')
    .option('-p, --policy <name>', 'detection policy')
    .option('-e, --entities <types>', 'entity types to detect (comma-separated)')
    .option('-t, --threshold <n>', 'minimum confidence score (0.0-1.0)')
    .option('--synthesis-language <lang>', 'language for synthetic data (en, de, fr, es, etc.)')
    .action(async (options: ImageCommandOptions) => {
      const extra: Record<string, string> = {};
      if (options.synthesisLanguage) extra.synthesis_language = options.synthesisLanguage;
      await handleImageProcessCommand('synthesize', options, program.opts(), extra);
    });
}
