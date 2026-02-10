import fs from 'node:fs';
import { InputError } from './errors.js';

export async function resolveText(
  positionalArg: string | undefined,
  options: { file?: string }
): Promise<string> {
  if (options.file) {
    try {
      return fs.readFileSync(options.file, 'utf-8').trim();
    } catch {
      throw new InputError(`Cannot read file: ${options.file}`);
    }
  }

  if (positionalArg && positionalArg.trim()) {
    return positionalArg.trim();
  }

  if (!process.stdin.isTTY) {
    return readStdin();
  }

  throw new InputError(
    'No input provided. Pass text as argument, pipe via stdin, or use --file.'
  );
}

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    process.stdin.on('data', (chunk) => chunks.push(chunk));
    process.stdin.on('end', () => {
      const text = Buffer.concat(chunks).toString('utf-8').trim();
      if (!text) {
        reject(new InputError('No input received from stdin.'));
      } else {
        resolve(text);
      }
    });
    process.stdin.on('error', (err) => reject(new InputError(err.message)));
  });
}

export async function resolveTexts(
  positionalArg: string | undefined,
  options: { file?: string }
): Promise<string[]> {
  if (options.file) {
    try {
      const content = fs.readFileSync(options.file, 'utf-8');
      const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) throw new Error();
      return lines;
    } catch {
      throw new InputError(`Cannot read file: ${options.file}`);
    }
  }

  if (!process.stdin.isTTY) {
    const text = await readStdin();
    return text.split('\n').map((l) => l.trim()).filter(Boolean);
  }

  throw new InputError(
    'Batch mode requires --file or piped stdin (one text per line).'
  );
}

export async function resolveSamples(
  positionalArgs: string[],
  options: { file?: string }
): Promise<string[]> {
  if (options.file) {
    try {
      const content = fs.readFileSync(options.file, 'utf-8');
      const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) throw new Error();
      return lines;
    } catch {
      throw new InputError(`Cannot read samples from file: ${options.file}`);
    }
  }

  if (positionalArgs.length > 0) {
    return positionalArgs;
  }

  if (!process.stdin.isTTY) {
    const text = await readStdin();
    return text.split('\n').map((l) => l.trim()).filter(Boolean);
  }

  throw new InputError(
    'No samples provided. Pass as arguments, pipe via stdin, or use --file.'
  );
}
