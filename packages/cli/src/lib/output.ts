const isColor = process.stdout.isTTY && !process.env.NO_COLOR;

export const c = {
  bold: (s: string) => (isColor ? `\x1b[1m${s}\x1b[0m` : s),
  green: (s: string) => (isColor ? `\x1b[32m${s}\x1b[0m` : s),
  red: (s: string) => (isColor ? `\x1b[31m${s}\x1b[0m` : s),
  yellow: (s: string) => (isColor ? `\x1b[33m${s}\x1b[0m` : s),
  dim: (s: string) => (isColor ? `\x1b[2m${s}\x1b[0m` : s),
  cyan: (s: string) => (isColor ? `\x1b[36m${s}\x1b[0m` : s),
};

interface OutputOptions {
  json?: boolean;
  quiet?: boolean;
}

interface TextResult {
  text: string;
  detected_entities?: DetectedEntityOutput[];
  entities_count?: number;
}

interface DetectedEntityOutput {
  type: string;
  text: string;
  start: number;
  end: number;
  score: number;
}

export function printTextResult(
  result: TextResult,
  label: string,
  opts: OutputOptions
): void {
  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (opts.quiet) {
    console.log(result.text);
    return;
  }

  console.log(c.bold(`${label}:`));
  console.log(result.text);

  if (result.detected_entities && result.detected_entities.length > 0) {
    console.log();
    console.log(c.dim(`${result.entities_count ?? result.detected_entities.length} entities found:`));
    for (const e of result.detected_entities) {
      console.log(
        `  ${c.cyan(e.type.padEnd(20))} ${c.yellow(`"${e.text}"`)}  ${c.dim(`(${(e.score * 100).toFixed(0)}%)`)}`
      );
    }
  } else {
    console.log(c.dim('\nNo entities detected.'));
  }
}

export function printDetectResult(
  result: { detected_entities: DetectedEntityOutput[]; entities_count: number },
  opts: OutputOptions
): void {
  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (opts.quiet) {
    for (const e of result.detected_entities) {
      console.log(e.type);
    }
    return;
  }

  if (result.detected_entities.length === 0) {
    console.log(c.dim('No entities detected.'));
    return;
  }

  console.log(c.bold(`${result.entities_count} entities detected:`));
  console.log();
  for (const e of result.detected_entities) {
    console.log(
      `  ${c.cyan(e.type.padEnd(20))} ${c.yellow(`"${e.text}"`)}  ${c.dim(`score: ${(e.score * 100).toFixed(0)}%  pos: ${e.start}-${e.end}`)}`
    );
  }
}

export function printTokenizeResult(
  result: TextResult & { mapping: Record<string, string> },
  opts: OutputOptions
): void {
  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (opts.quiet) {
    console.log(result.text);
    return;
  }

  console.log(c.bold('Tokenized:'));
  console.log(result.text);

  if (Object.keys(result.mapping).length > 0) {
    console.log();
    console.log(c.dim('Mapping:'));
    for (const [token, original] of Object.entries(result.mapping)) {
      console.log(`  ${c.cyan(token)} ${c.dim('→')} ${c.yellow(original)}`);
    }
  }
}

export function printDetokenizeResult(
  result: { text: string; replacements_made: number },
  opts: OutputOptions
): void {
  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (opts.quiet) {
    console.log(result.text);
    return;
  }

  console.log(c.bold('Restored:'));
  console.log(result.text);
  console.log(c.dim(`\n${result.replacements_made} replacements made.`));
}

export function printBatchResult(
  result: { results: Record<string, unknown>[]; total: number; succeeded: number; failed: number },
  label: string,
  opts: OutputOptions
): void {
  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (opts.quiet) {
    for (const item of result.results) {
      if ('error' in item) {
        console.log(`ERROR: ${item.error}`);
      } else if ('text' in item) {
        console.log(item.text);
      }
    }
    return;
  }

  console.log(c.bold(`${label} (batch): ${result.succeeded}/${result.total} succeeded`));
  if (result.failed > 0) {
    console.log(c.red(`  ${result.failed} failed`));
  }
  console.log();

  for (let i = 0; i < result.results.length; i++) {
    const item = result.results[i];
    if ('error' in item) {
      console.log(`  ${c.dim(`[${i + 1}]`)} ${c.red(`Error: ${item.error}`)}`);
    } else if ('text' in item) {
      console.log(`  ${c.dim(`[${i + 1}]`)} ${item.text}`);
    } else if ('detected_entities' in item) {
      const entities = item.detected_entities as { type: string; text: string; score: number }[];
      console.log(`  ${c.dim(`[${i + 1}]`)} ${entities.length} entities found`);
    }
  }
}

export function printDiscoverResult(
  result: unknown,
  opts: OutputOptions
): void {
  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // For human/quiet, just print JSON since discover has variable structure
  console.log(JSON.stringify(result, null, 2));
}
