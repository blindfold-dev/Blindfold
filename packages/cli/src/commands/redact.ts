import { Command } from 'commander';
import { addCommonOptions, buildBody, buildBatchBody } from './shared.js';
import { resolveText, resolveTexts } from '../lib/input.js';
import { createRequestFn } from '../lib/request.js';
import { printTextResult, printBatchResult } from '../lib/output.js';
import type { TextTransformResponse, BatchResponse } from '../types.js';

export function registerRedactCommand(program: Command): void {
  const cmd = program
    .command('redact [text]')
    .description('permanently remove PII from text');

  addCommonOptions(cmd);

  cmd.action(async (text: string | undefined, options: Record<string, string>) => {
    const globalOpts = program.opts();
    const api = createRequestFn(globalOpts);

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
