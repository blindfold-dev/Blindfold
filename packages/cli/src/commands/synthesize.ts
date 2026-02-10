import { Command } from 'commander';
import { addCommonOptions, buildBody, buildBatchBody } from './shared.js';
import { resolveText, resolveTexts } from '../lib/input.js';
import { createApiRequest } from '../lib/api.js';
import { resolveApiKey, resolveBaseUrl } from '../lib/config.js';
import { printTextResult, printBatchResult } from '../lib/output.js';
import type { TextTransformResponse, BatchResponse } from '../types.js';

export function registerSynthesizeCommand(program: Command): void {
  const cmd = program
    .command('synthesize [text]')
    .description('replace PII with realistic fake data')
    .option('-l, --language <code>', 'language for fake data (en, cs, de, fr, es, it, pl, sk)');

  addCommonOptions(cmd);

  cmd.action(async (text: string | undefined, options: Record<string, string>) => {
    const globalOpts = program.opts();
    const apiKey = resolveApiKey(globalOpts.apiKey);
    const baseUrl = resolveBaseUrl(globalOpts.baseUrl);
    const api = createApiRequest(apiKey, baseUrl);

    if (options.batch) {
      const texts = await resolveTexts(text, { file: options.file });
      const body = buildBatchBody(texts, options);
      if (options.language) body.language = options.language;
      const result = await api<BatchResponse>('/synthesize', body);
      printBatchResult(result, 'Synthesized', globalOpts);
      return;
    }

    const inputText = await resolveText(text, { file: options.file });
    const body = buildBody(inputText, options);
    if (options.language) body.language = options.language;

    const result = await api<TextTransformResponse>('/synthesize', body);
    printTextResult(result, 'Synthesized', globalOpts);
  });
}
