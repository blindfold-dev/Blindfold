import { Command } from 'commander';
import { addCommonOptions, buildBody, buildBatchBody } from './shared.js';
import { resolveText, resolveTexts } from '../lib/input.js';
import { createRequestFn } from '../lib/request.js';
import { printTextResult, printBatchResult } from '../lib/output.js';
import type { EncryptResponse, BatchResponse } from '../types.js';

export function registerEncryptCommand(program: Command): void {
  const cmd = program
    .command('encrypt [text]')
    .description('encrypt PII with AES encryption')
    .option('--encryption-key <key>', 'encryption password (auto-generated if omitted)');

  addCommonOptions(cmd);

  cmd.action(async (text: string | undefined, options: Record<string, string>) => {
    const globalOpts = program.opts();
    const api = createRequestFn(globalOpts);

    if (options.batch) {
      const texts = await resolveTexts(text, { file: options.file });
      const body = buildBatchBody(texts, options);
      if (options.encryptionKey) body.encryption_key = options.encryptionKey;
      const result = await api<BatchResponse>('/encrypt', body);
      printBatchResult(result, 'Encrypted', globalOpts);
      return;
    }

    const inputText = await resolveText(text, { file: options.file });
    const body = buildBody(inputText, options);
    if (options.encryptionKey) body.encryption_key = options.encryptionKey;

    const result = await api<EncryptResponse>('/encrypt', body);
    printTextResult(result, 'Encrypted', globalOpts);
  });
}
