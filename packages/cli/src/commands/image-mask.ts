import { Command } from 'commander';
import { handleImageProcessCommand, type ImageCommandOptions } from './image-shared.js';

export function registerImageMaskCommand(program: Command): void {
  program
    .command('image-mask')
    .description('mask PII in an image (partially hide)')
    .requiredOption('-i, --image <path>', 'path to image file')
    .requiredOption('-o, --output <path>', 'output path for processed PNG')
    .option('-l, --language <code>', 'Tesseract language code (default: eng)', 'eng')
    .option('-p, --policy <name>', 'detection policy')
    .option('-e, --entities <types>', 'entity types to detect (comma-separated)')
    .option('-t, --threshold <n>', 'minimum confidence score (0.0-1.0)')
    .option('--chars-to-show <n>', 'number of characters to leave visible (default: 3)')
    .option('--from-end', 'show visible characters from end')
    .option('--masking-char <char>', 'masking character (default: "*")')
    .action(async (options: ImageCommandOptions) => {
      const extra: Record<string, string> = {};
      if (options.charsToShow) extra.chars_to_show = options.charsToShow;
      if (options.fromEnd) extra.from_end = 'true';
      if (options.maskingChar) extra.masking_char = options.maskingChar;
      await handleImageProcessCommand('mask', options, program.opts(), extra);
    });
}
