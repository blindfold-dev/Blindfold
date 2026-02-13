import { Command } from 'commander';
import { addCommonOptions, buildBody, buildBatchBody } from './shared.js';
import { resolveText, resolveTexts } from '../lib/input.js';
import { createApiRequest } from '../lib/api.js';
import { resolveApiKey, resolveBaseUrl } from '../lib/config.js';
import { printTextResult, printBatchResult } from '../lib/output.js';
import type { TextTransformResponse, BatchResponse } from '../types.js';

export function registerHashCommand(program: Command): void {
  const cmd = program
    .command('hash [text]')
    .description('replace PII with one-way hashes')
    .option('--hash-type <alg>', 'hash algorithm (md5, sha1, sha256)')
    .option('--hash-length <n>', 'truncate hash to this many characters');

  addCommonOptions(cmd);

  cmd.action(async (text: string | undefined, options: Record<string, string>) => {
    const globalOpts = program.opts();
    const apiKey = resolveApiKey(globalOpts.apiKey);
    const baseUrl = resolveBaseUrl(globalOpts.baseUrl, globalOpts.region);
    const api = createApiRequest(apiKey, baseUrl);

    if (options.batch) {
      const texts = await resolveTexts(text, { file: options.file });
      const body = buildBatchBody(texts, options);
      if (options.hashType) body.hash_type = options.hashType;
      if (options.hashLength) body.hash_length = parseInt(options.hashLength, 10);
      const result = await api<BatchResponse>('/hash', body);
      printBatchResult(result, 'Hashed', globalOpts);
      return;
    }

    const inputText = await resolveText(text, { file: options.file });
    const body = buildBody(inputText, options);
    if (options.hashType) body.hash_type = options.hashType;
    if (options.hashLength) body.hash_length = parseInt(options.hashLength, 10);

    const result = await api<TextTransformResponse>('/hash', body);
    printTextResult(result, 'Hashed', globalOpts);
  });
}
