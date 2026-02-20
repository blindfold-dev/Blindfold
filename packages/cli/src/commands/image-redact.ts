import { Command } from 'commander';
import { handleImageProcessCommand, type ImageCommandOptions } from './image-shared.js';

export function registerImageRedactCommand(program: Command): void {
  program
    .command('image-redact')
    .description('redact PII in an image (cover with black boxes)')
    .requiredOption('-i, --image <path>', 'path to image file')
    .requiredOption('-o, --output <path>', 'output path for processed PNG')
    .option('-l, --language <code>', 'Tesseract language code (default: eng)', 'eng')
    .option('-p, --policy <name>', 'detection policy')
    .option('-e, --entities <types>', 'entity types to detect (comma-separated)')
    .option('-t, --threshold <n>', 'minimum confidence score (0.0-1.0)')
    .action(async (options: ImageCommandOptions) => {
      await handleImageProcessCommand('redact', options, program.opts());
    });
}
