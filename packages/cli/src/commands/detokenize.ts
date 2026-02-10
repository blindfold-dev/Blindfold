import fs from 'node:fs';
import { Command } from 'commander';
import { resolveText } from '../lib/input.js';
import { createApiRequest } from '../lib/api.js';
import { resolveApiKey, resolveBaseUrl } from '../lib/config.js';
import { printDetokenizeResult } from '../lib/output.js';
import { InputError } from '../lib/errors.js';
import type { DetokenizeResponse } from '../types.js';

export function registerDetokenizeCommand(program: Command): void {
  const cmd = program
    .command('detokenize [text]')
    .description('restore original values from tokenized text')
    .option('-m, --mapping <json>', 'token-to-original mapping as JSON string')
    .option('--mapping-file <path>', 'read mapping from a JSON file')
    .option('-f, --file <path>', 'read input text from file');

  cmd.action(async (text: string | undefined, options: Record<string, string>) => {
    const globalOpts = program.opts();
    const apiKey = resolveApiKey(globalOpts.apiKey);
    const baseUrl = resolveBaseUrl(globalOpts.baseUrl);
    const api = createApiRequest(apiKey, baseUrl);

    const inputText = await resolveText(text, { file: options.file });

    let mapping: Record<string, string>;
    if (options.mappingFile) {
      try {
        mapping = JSON.parse(fs.readFileSync(options.mappingFile, 'utf-8'));
      } catch {
        throw new InputError(`Cannot read mapping file: ${options.mappingFile}`);
      }
    } else if (options.mapping) {
      try {
        mapping = JSON.parse(options.mapping);
      } catch {
        throw new InputError('Invalid JSON in --mapping.');
      }
    } else {
      throw new InputError('Mapping required. Use --mapping <json> or --mapping-file <path>.');
    }

    const result = await api<DetokenizeResponse>('/detokenize', {
      text: inputText,
      mapping,
    });
    printDetokenizeResult(result, globalOpts);
  });
}
