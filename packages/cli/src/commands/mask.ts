import { Command } from 'commander';
import { addCommonOptions, buildBody } from './shared.js';
import { resolveText } from '../lib/input.js';
import { createApiRequest } from '../lib/api.js';
import { resolveApiKey, resolveBaseUrl } from '../lib/config.js';
import { printTextResult } from '../lib/output.js';
import type { TextTransformResponse } from '../types.js';

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
    const apiKey = resolveApiKey(globalOpts.apiKey);
    const baseUrl = resolveBaseUrl(globalOpts.baseUrl);
    const api = createApiRequest(apiKey, baseUrl);

    const inputText = await resolveText(text, { file: options.file });
    const body = buildBody(inputText, options);
    if (options.maskingChar) body.masking_char = options.maskingChar;
    if (options.charsToShow) body.chars_to_show = parseInt(options.charsToShow, 10);
    if (options.fromEnd) body.from_end = true;

    const result = await api<TextTransformResponse>('/mask', body);
    printTextResult(result, 'Masked', globalOpts);
  });
}
