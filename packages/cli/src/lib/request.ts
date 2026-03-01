import { createApiRequest } from './api.js';
import { createLocalRequest } from './local.js';
import { resolveBaseUrl, loadConfig } from './config.js';

export function createRequestFn(globalOpts: Record<string, string>) {
  if (globalOpts.local) {
    const locales = globalOpts.locales
      ? globalOpts.locales.split(',').map((l: string) => l.trim())
      : undefined;
    return createLocalRequest(locales);
  }

  const apiKey =
    globalOpts.apiKey || process.env.BLINDFOLD_API_KEY || loadConfig().apiKey;

  if (!apiKey) {
    console.error(
      'No API key configured. Running in local/offline mode (regex only).\n' +
        'For AI-powered detection, run: blindfold config set-key <your-key>\n'
    );
    const locales = globalOpts.locales
      ? globalOpts.locales.split(',').map((l: string) => l.trim())
      : undefined;
    return createLocalRequest(locales);
  }

  const baseUrl = resolveBaseUrl(globalOpts.baseUrl, globalOpts.region);
  return createApiRequest(apiKey, baseUrl);
}
