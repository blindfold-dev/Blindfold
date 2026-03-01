import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createApiRequest } from './api.js';
import { createLocalRequest } from './local.js';
import { createServer } from './server.js';

const REGION_URLS: Record<string, string> = {
  eu: 'https://eu-api.blindfold.dev',
  us: 'https://us-api.blindfold.dev',
};

const API_KEY = process.env.BLINDFOLD_API_KEY;
const REGION = process.env.BLINDFOLD_REGION;
const MODE = process.env.BLINDFOLD_MODE;

function resolveBaseUrl(): string {
  if (process.env.BLINDFOLD_BASE_URL) return process.env.BLINDFOLD_BASE_URL;
  if (REGION) {
    const url = REGION_URLS[REGION.toLowerCase()];
    if (!url) {
      console.error(`Invalid BLINDFOLD_REGION '${REGION}'. Must be one of: ${Object.keys(REGION_URLS).join(', ')}`);
      process.exit(1);
    }
    return url;
  }
  return 'https://api.blindfold.dev';
}

function resolveLocales(): string[] | undefined {
  const raw = process.env.BLINDFOLD_LOCALES;
  if (!raw) return undefined;
  return raw.split(',').map((l) => l.trim());
}

const isLocal = MODE === 'local' || !API_KEY;

let apiRequest: (endpoint: string, body: Record<string, unknown>) => Promise<unknown>;

if (isLocal) {
  if (!API_KEY) {
    console.error(
      'No BLINDFOLD_API_KEY set. Running in local/offline mode (regex only).'
    );
  }
  apiRequest = createLocalRequest(resolveLocales());
} else {
  const BASE_URL = resolveBaseUrl();
  apiRequest = createApiRequest(API_KEY, BASE_URL);
}

const server = createServer(apiRequest);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Failed to start Blindfold MCP server:', error);
  process.exit(1);
});
