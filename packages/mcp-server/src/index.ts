import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createApiRequest } from './api.js';
import { createServer } from './server.js';

const REGION_URLS: Record<string, string> = {
  eu: 'https://eu-api.blindfold.dev',
  us: 'https://us-api.blindfold.dev',
};

const API_KEY = process.env.BLINDFOLD_API_KEY;
const REGION = process.env.BLINDFOLD_REGION;

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

const BASE_URL = resolveBaseUrl();

if (!API_KEY) {
  console.error('BLINDFOLD_API_KEY environment variable is required');
  process.exit(1);
}

const apiRequest = createApiRequest(API_KEY, BASE_URL);
const server = createServer(apiRequest);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Failed to start Blindfold MCP server:', error);
  process.exit(1);
});
