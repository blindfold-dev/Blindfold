import { readFileSync } from 'node:fs';
import { basename, extname } from 'node:path';
import { Command } from 'commander';
import { resolveApiKey, resolveBaseUrl } from '../lib/config.js';
import { printImageDetectResult } from '../lib/output.js';
import { InputError } from '../lib/errors.js';
import type { ImageDetectResponse } from '../types.js';

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.tiff': 'image/tiff',
  '.tif': 'image/tiff',
  '.bmp': 'image/bmp',
  '.webp': 'image/webp',
};

export function registerImageDetectCommand(program: Command): void {
  program
    .command('image-detect')
    .description('detect PII in an image using OCR')
    .requiredOption('-i, --image <path>', 'path to image file')
    .option('-l, --language <code>', 'Tesseract language code (default: eng)', 'eng')
    .option('-p, --policy <name>', 'detection policy (basic, strict, gdpr_eu, hipaa_us, pci_dss)')
    .option('-e, --entities <types>', 'entity types to detect (comma-separated)')
    .option('-t, --threshold <n>', 'minimum confidence score (0.0-1.0)')
    .action(async (options: Record<string, string>) => {
      const globalOpts = program.opts();
      const apiKey = resolveApiKey(globalOpts.apiKey);
      const baseUrl = resolveBaseUrl(globalOpts.baseUrl, globalOpts.region);
      const apiPrefix = `${baseUrl}/api/public/v1`;

      const imagePath = options.image;
      const ext = extname(imagePath).toLowerCase();
      const mimeType = MIME_TYPES[ext];
      if (!mimeType) {
        throw new InputError(
          `Unsupported image format: ${ext}. Supported: ${Object.keys(MIME_TYPES).join(', ')}`
        );
      }

      const imageData = readFileSync(imagePath);
      const fileName = basename(imagePath);

      const formData = new FormData();
      formData.append('file', new Blob([imageData], { type: mimeType }), fileName);
      formData.append('language', options.language || 'eng');
      if (options.policy) {
        formData.append('policy', options.policy);
      }
      if (options.entities) {
        formData.append('entities', options.entities);
      }
      if (options.threshold) {
        formData.append('score_threshold', options.threshold);
      }

      const response = await fetch(`${apiPrefix}/file/detect`, {
        method: 'POST',
        headers: {
          'X-API-Key': apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        let detail = text;
        try {
          const json = JSON.parse(text);
          detail = json.detail || json.message || text;
        } catch {
          // Use raw text
        }
        throw new Error(
          typeof detail === 'string' ? detail : JSON.stringify(detail)
        );
      }

      const result = (await response.json()) as ImageDetectResponse;
      printImageDetectResult(result, globalOpts);
    });
}
