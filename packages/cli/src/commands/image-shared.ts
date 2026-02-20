import { readFileSync, writeFileSync } from 'node:fs';
import { basename, extname } from 'node:path';
import { Command } from 'commander';
import { resolveApiKey, resolveBaseUrl } from '../lib/config.js';
import { printImageProcessResult } from '../lib/output.js';
import { InputError } from '../lib/errors.js';
import type { ImageProcessMetadata, DetectedEntity } from '../types.js';

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.tiff': 'image/tiff',
  '.tif': 'image/tiff',
  '.bmp': 'image/bmp',
  '.webp': 'image/webp',
};

export interface ImageCommandOptions {
  image: string;
  output: string;
  language?: string;
  policy?: string;
  entities?: string;
  threshold?: string;
  [key: string]: string | undefined;
}

/**
 * Shared handler for image processing commands.
 * Uploads an image, handles binary response, saves to output file, prints metadata.
 */
export async function handleImageProcessCommand(
  endpoint: string,
  options: ImageCommandOptions,
  globalOpts: Record<string, string>,
  extraFields?: Record<string, string>,
): Promise<void> {
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
  if (options.policy) formData.append('policy', options.policy);
  if (options.entities) formData.append('entities', options.entities);
  if (options.threshold) formData.append('score_threshold', options.threshold);

  if (extraFields) {
    for (const [key, value] of Object.entries(extraFields)) {
      formData.append(key, value);
    }
  }

  const response = await fetch(`${apiPrefix}/file/${endpoint}`, {
    method: 'POST',
    headers: { 'X-API-Key': apiKey },
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
    throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.startsWith('image/')) {
    throw new Error('Unexpected response format from server');
  }

  // Save image to output file
  const buffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(options.output, buffer);

  // Parse metadata from headers
  let detectedEntities: DetectedEntity[] = [];
  try { detectedEntities = JSON.parse(response.headers.get('x-detected-entities') || '[]'); } catch { /* empty */ }
  let mapping: Record<string, string> = {};
  try { mapping = JSON.parse(response.headers.get('x-mapping') || '{}'); } catch { /* empty */ }

  const confidenceRaw = response.headers.get('x-ocr-confidence') || '';

  const metadata: ImageProcessMetadata = {
    entities_count: parseInt(response.headers.get('x-entities-count') || '0', 10),
    detected_entities: detectedEntities,
    mapping,
    ocr_confidence: confidenceRaw ? parseFloat(confidenceRaw) : null,
  };

  printImageProcessResult(options.output, metadata, globalOpts);
}
