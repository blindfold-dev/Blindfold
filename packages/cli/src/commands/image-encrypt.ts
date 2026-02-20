import { Command } from 'commander';
import { handleImageProcessCommand, type ImageCommandOptions } from './image-shared.js';

export function registerImageEncryptCommand(program: Command): void {
  program
    .command('image-encrypt')
    .description('encrypt PII in an image (replace with encrypted values)')
    .requiredOption('-i, --image <path>', 'path to image file')
    .requiredOption('-o, --output <path>', 'output path for processed PNG')
    .option('-l, --language <code>', 'Tesseract language code (default: eng)', 'eng')
    .option('-p, --policy <name>', 'detection policy')
    .option('-e, --entities <types>', 'entity types to detect (comma-separated)')
    .option('-t, --threshold <n>', 'minimum confidence score (0.0-1.0)')
    .option('--encryption-key <key>', 'encryption password (min 16 chars)')
    .action(async (options: ImageCommandOptions) => {
      const extra: Record<string, string> = {};
      if (options.encryptionKey) extra.encryption_key = options.encryptionKey;
      await handleImageProcessCommand('encrypt', options, program.opts(), extra);
    });
}
