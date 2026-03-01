import { Command } from 'commander';
import { addCommonOptions, buildBody, buildBatchBody } from './shared.js';
import { resolveText, resolveTexts } from '../lib/input.js';
import { createRequestFn } from '../lib/request.js';
import { printTextResult, printBatchResult } from '../lib/output.js';
import type { TextTransformResponse, BatchResponse } from '../types.js';

export function registerMaskCommand(program: Command): void {
  const cmd = program
    .command('mask [text]')
    .description('partially hide PII with masking characters')
    .option('--masking-char <char>', 'masking character (default: "*")')
    .option('--chars-to-show <n>', 'number of characters to leave visible')
    .option('--from-end', 'show visible characters from end');

  addCommonOptions(cmd);

  cmd.action(async (text: string | undefined, options: Record<string, string>) => {
    const globalOpts = program.opts();
    const api = createRequestFn(globalOpts);

    if (options.batch) {
      const texts = await resolveTexts(text, { file: options.file });
      const body = buildBatchBody(texts, options);
      if (options.maskingChar) body.masking_char = options.maskingChar;
      if (options.charsToShow) body.chars_to_show = parseInt(options.charsToShow, 10);
      if (options.fromEnd) body.from_end = true;
      const result = await api<BatchResponse>('/mask', body);
      printBatchResult(result, 'Masked', globalOpts);
      return;
    }

    const inputText = await resolveText(text, { file: options.file });
    const body = buildBody(inputText, options);
    if (options.maskingChar) body.masking_char = options.maskingChar;
    if (options.charsToShow) body.chars_to_show = parseInt(options.charsToShow, 10);
    if (options.fromEnd) body.from_end = true;

    const result = await api<TextTransformResponse>('/mask', body);
    printTextResult(result, 'Masked', globalOpts);
  });
}
