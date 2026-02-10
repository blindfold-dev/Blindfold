import { Command } from 'commander';
import { addCommonOptions, buildBody, buildBatchBody } from './shared.js';
import { resolveText, resolveTexts } from '../lib/input.js';
import { createApiRequest } from '../lib/api.js';
import { resolveApiKey, resolveBaseUrl } from '../lib/config.js';
import { printTokenizeResult, printBatchResult } from '../lib/output.js';
import type { TokenizeResponse, BatchResponse } from '../types.js';

export function registerTokenizeCommand(program: Command): void {
  const cmd = program
    .command('tokenize [text]')
    .description('replace PII with reversible tokens');

  addCommonOptions(cmd);

  cmd.action(async (text: string | undefined, options: Record<string, string>) => {
    const globalOpts = program.opts();
    const apiKey = resolveApiKey(globalOpts.apiKey);
    const baseUrl = resolveBaseUrl(globalOpts.baseUrl);
    const api = createApiRequest(apiKey, baseUrl);

    if (options.batch) {
      const texts = await resolveTexts(text, { file: options.file });
      const body = buildBatchBody(texts, options);
      const result = await api<BatchResponse>('/tokenize', body);
      printBatchResult(result, 'Tokenized', globalOpts);
      return;
    }

    const inputText = await resolveText(text, { file: options.file });
    const body = buildBody(inputText, options);

    const result = await api<TokenizeResponse>('/tokenize', body);
    printTokenizeResult(result, globalOpts);
  });
}
