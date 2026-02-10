import { Command } from 'commander';
import { addCommonOptions, buildBody } from './shared.js';
import { resolveText } from '../lib/input.js';
import { createApiRequest } from '../lib/api.js';
import { resolveApiKey, resolveBaseUrl } from '../lib/config.js';
import { printDetectResult } from '../lib/output.js';
import type { DetectResponse } from '../types.js';

export function registerDetectCommand(program: Command): void {
  const cmd = program
    .command('detect [text]')
    .description('detect PII in text without modifying it');

  addCommonOptions(cmd);

  cmd.action(async (text: string | undefined, options: Record<string, string>) => {
    const globalOpts = program.opts();
    const apiKey = resolveApiKey(globalOpts.apiKey);
    const baseUrl = resolveBaseUrl(globalOpts.baseUrl);
    const api = createApiRequest(apiKey, baseUrl);

    const inputText = await resolveText(text, { file: options.file });
    const body = buildBody(inputText, options);

    const result = await api<DetectResponse>('/detect', body);
    printDetectResult(result, globalOpts);
  });
}
