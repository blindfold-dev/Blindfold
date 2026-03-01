import { Command } from 'commander';
import { resolveSamples } from '../lib/input.js';
import { createRequestFn } from '../lib/request.js';
import { printDiscoverResult } from '../lib/output.js';

export function registerDiscoverCommand(program: Command): void {
  const cmd = program
    .command('discover [samples...]')
    .description('analyze text samples to discover PII types')
    .option('-t, --threshold <n>', 'minimum confidence score (0.0-1.0)')
    .option('-f, --file <path>', 'read samples from file (one per line)');

  cmd.action(async (samples: string[], options: Record<string, string>) => {
    const globalOpts = program.opts();
    const api = createRequestFn(globalOpts);

    const resolvedSamples = await resolveSamples(samples, { file: options.file });

    const body: Record<string, unknown> = { samples: resolvedSamples };
    if (options.threshold) body.threshold = parseFloat(options.threshold);

    const result = await api('/discover', body);
    printDiscoverResult(result, globalOpts);
  });
}
