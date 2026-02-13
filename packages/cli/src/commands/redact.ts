import { Command } from 'commander';
import { addCommonOptions, buildBody, buildBatchBody } from './shared.js';
import { resolveText, resolveTexts } from '../lib/input.js';
import { createApiRequest } from '../lib/api.js';
import { resolveApiKey, resolveBaseUrl } from '../lib/config.js';
import { printTextResult, printBatchResult } from '../lib/output.js';
import type { TextTransformResponse, BatchResponse } from '../types.js';

export function registerRedactCommand(program: Command): void {
  const cmd = program
    .command('redact [text]')
    .description('permanently remove PII from text');

  addCommonOptions(cmd);

  cmd.action(async (text: string | undefined, options: Record<string, string>) => {
    const globalOpts = program.opts();
    const apiKey = resolveApiKey(globalOpts.apiKey);
    const baseUrl = resolveBaseUrl(globalOpts.baseUrl, globalOpts.region);
    const api = createApiRequest(apiKey, baseUrl);

    if (options.batch) {
      const texts = await resolveTexts(text, { file: options.file });
      const body = buildBatchBody(texts, options);
      const result = await api<BatchResponse>('/redact', body);
      printBatchResult(result, 'Redacted', globalOpts);
      return;
    }

    const inputText = await resolveText(text, { file: options.file });
    const body = buildBody(inputText, options);

    const result = await api<TextTransformResponse>('/redact', body);
    printTextResult(result, 'Redacted', globalOpts);
  });
}
