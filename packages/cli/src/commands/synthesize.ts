import { Command } from 'commander';
import { addCommonOptions, buildBody } from './shared.js';
import { resolveText } from '../lib/input.js';
import { createApiRequest } from '../lib/api.js';
import { resolveApiKey, resolveBaseUrl } from '../lib/config.js';
import { printTextResult } from '../lib/output.js';
import type { TextTransformResponse } from '../types.js';

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

    const inputText = await resolveText(text, { file: options.file });
    const body = buildBody(inputText, options);
    if (options.language) body.language = options.language;

    const result = await api<TextTransformResponse>('/synthesize', body);
    printTextResult(result, 'Synthesized', globalOpts);
  });
}
