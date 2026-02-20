import { Command } from 'commander';
import { handleImageProcessCommand, type ImageCommandOptions } from './image-shared.js';

export function registerImageTokenizeCommand(program: Command): void {
  program
    .command('image-tokenize')
    .description('tokenize PII in an image (replace with token labels)')
    .requiredOption('-i, --image <path>', 'path to image file')
    .requiredOption('-o, --output <path>', 'output path for processed PNG')
    .option('-l, --language <code>', 'Tesseract language code (default: eng)', 'eng')
    .option('-p, --policy <name>', 'detection policy')
    .option('-e, --entities <types>', 'entity types to detect (comma-separated)')
    .option('-t, --threshold <n>', 'minimum confidence score (0.0-1.0)')
    .action(async (options: ImageCommandOptions) => {
      await handleImageProcessCommand('tokenize', options, program.opts());
    });
}
