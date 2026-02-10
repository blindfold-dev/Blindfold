import { Command } from 'commander';

export function addCommonOptions(cmd: Command): Command {
  return cmd
    .option('-p, --policy <name>', 'detection policy (basic, strict, gdpr_eu, hipaa_us, pci_dss)')
    .option('-e, --entities <types>', 'entity types to detect (comma-separated)')
    .option('-t, --threshold <n>', 'minimum confidence score (0.0-1.0)')
    .option('-f, --file <path>', 'read input from file')
    .option('-b, --batch', 'batch mode: process each line as a separate text (use with --file or stdin)');
}

export function buildBody(
  text: string,
  options: { policy?: string; entities?: string; threshold?: string }
): Record<string, unknown> {
  const body: Record<string, unknown> = { text };
  if (options.policy) body.policy = options.policy;
  if (options.entities) body.entities = options.entities.split(',').map((e) => e.trim());
  if (options.threshold) body.score_threshold = parseFloat(options.threshold);
  return body;
}

export function buildBatchBody(
  texts: string[],
  options: { policy?: string; entities?: string; threshold?: string }
): Record<string, unknown> {
  const body: Record<string, unknown> = { texts };
  if (options.policy) body.policy = options.policy;
  if (options.entities) body.entities = options.entities.split(',').map((e) => e.trim());
  if (options.threshold) body.score_threshold = parseFloat(options.threshold);
  return body;
}
