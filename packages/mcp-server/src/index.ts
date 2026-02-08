import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createApiRequest } from './api.js';
import { createServer } from './server.js';

const API_KEY = process.env.BLINDFOLD_API_KEY;
const BASE_URL = process.env.BLINDFOLD_BASE_URL || 'https://api.blindfold.dev';

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
