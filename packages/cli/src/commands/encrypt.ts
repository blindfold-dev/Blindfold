import { Command } from 'commander';
import { addCommonOptions, buildBody } from './shared.js';
import { resolveText } from '../lib/input.js';
import { createApiRequest } from '../lib/api.js';
import { resolveApiKey, resolveBaseUrl } from '../lib/config.js';
import { printTextResult } from '../lib/output.js';
import type { EncryptResponse } from '../types.js';

export function registerEncryptCommand(program: Command): void {
  const cmd = program
    .command('encrypt [text]')
    .description('encrypt PII with AES encryption')
    .option('--encryption-key <key>', 'encryption password (auto-generated if omitted)');

  addCommonOptions(cmd);

  cmd.action(async (text: string | undefined, options: Record<string, string>) => {
    const globalOpts = program.opts();
    const apiKey = resolveApiKey(globalOpts.apiKey);
    const baseUrl = resolveBaseUrl(globalOpts.baseUrl);
    const api = createApiRequest(apiKey, baseUrl);

    const inputText = await resolveText(text, { file: options.file });
    const body = buildBody(inputText, options);
    if (options.encryptionKey) body.encryption_key = options.encryptionKey;

    const result = await api<EncryptResponse>('/encrypt', body);
    printTextResult(result, 'Encrypted', globalOpts);
  });
}
