import { Command } from 'commander';
import { handleImageProcessCommand, type ImageCommandOptions } from './image-shared.js';

export function registerImageHashCommand(program: Command): void {
  program
    .command('image-hash')
    .description('hash PII in an image (replace with deterministic hashes)')
    .requiredOption('-i, --image <path>', 'path to image file')
    .requiredOption('-o, --output <path>', 'output path for processed PNG')
    .option('-l, --language <code>', 'Tesseract language code (default: eng)', 'eng')
    .option('-p, --policy <name>', 'detection policy')
    .option('-e, --entities <types>', 'entity types to detect (comma-separated)')
    .option('-t, --threshold <n>', 'minimum confidence score (0.0-1.0)')
    .option('--hash-type <type>', 'hash algorithm: md5, sha1, sha256 (default)')
    .option('--hash-prefix <prefix>', 'prefix for hash values (default: "HASH_")')
    .option('--hash-length <n>', 'truncate hash to this many characters (default: 16)')
    .action(async (options: ImageCommandOptions) => {
      const extra: Record<string, string> = {};
      if (options.hashType) extra.hash_type = options.hashType;
      if (options.hashPrefix !== undefined) extra.hash_prefix = options.hashPrefix;
      if (options.hashLength) extra.hash_length = options.hashLength;
      await handleImageProcessCommand('hash', options, program.opts(), extra);
    });
}
