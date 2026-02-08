/**
 * MCP Server setup with all Blindfold tools registered.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

// Common schemas
const policyParam = z
  .string()
  .optional()
  .describe(
    'Detection policy: "basic", "strict", "gdpr_eu", "hipaa_us", "pci_dss", or a custom policy name'
  );
const entitiesParam = z
  .array(z.string())
  .optional()
  .describe('Specific entity types to detect (e.g. ["person", "email address", "phone number"])');
const thresholdParam = z
  .number()
  .min(0)
  .max(1)
  .optional()
  .describe('Minimum confidence score (0.0 to 1.0) for entity detection');

type ApiRequestFn = (endpoint: string, body: Record<string, unknown>) => Promise<unknown>;

export function createServer(apiRequest: ApiRequestFn): McpServer {
  const server = new McpServer({
    name: 'blindfold',
    version: '1.0.0',
  });

  server.tool(
    'blindfold_detect',
    `Detect PII in text without modifying it.
Returns only the detected entities with their types, positions, and confidence scores.
The original text is not transformed or returned.

Example: "John Doe, john@example.com" → [{"entity_type": "person", "text": "John Doe", ...}, {"entity_type": "email address", ...}]`,
    {
      text: z.string().describe('Text to analyze for PII'),
      policy: policyParam,
      entities: entitiesParam,
      score_threshold: thresholdParam,
    },
    async ({ text, policy, entities, score_threshold }) => {
      const body: Record<string, unknown> = { text };
      if (policy) body.policy = policy;
      if (entities) body.entities = entities;
      if (score_threshold !== undefined) body.score_threshold = score_threshold;

      const result = await apiRequest('/detect', body);
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    'blindfold_tokenize',
    `Detect and replace PII (personal data) in text with reversible tokens.
Use this BEFORE sending text containing sensitive information to an AI model.
Returns tokenized text and a mapping to restore original values later.

Example: "John Doe, john@example.com" → "<Person_1>, <Email Address_1>"`,
    {
      text: z.string().describe('Text containing sensitive data to tokenize'),
      policy: policyParam,
      entities: entitiesParam,
      score_threshold: thresholdParam,
    },
    async ({ text, policy, entities, score_threshold }) => {
      const body: Record<string, unknown> = { text };
      if (policy) body.policy = policy;
      if (entities) body.entities = entities;
      if (score_threshold !== undefined) body.score_threshold = score_threshold;

      const result = await apiRequest('/tokenize', body);
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    'blindfold_detokenize',
    `Restore original values in text by replacing tokens with real data.
Use this AFTER receiving an AI response that contains Blindfold tokens.
Requires the mapping object returned by tokenize.

Example: "<Person_1>, <Email Address_1>" → "John Doe, john@example.com"`,
    {
      text: z.string().describe('Text containing Blindfold tokens to restore'),
      mapping: z
        .record(z.string(), z.string())
        .describe('Token-to-original mapping from a previous tokenize call'),
    },
    async ({ text, mapping }) => {
      const result = await apiRequest('/detokenize', { text, mapping });
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    'blindfold_mask',
    `Partially hide PII in text with masking characters.
Useful when you need to show data format but hide actual values.

Example: "4532-7562-9102-3456" → "****-****-****-3456"`,
    {
      text: z.string().describe('Text containing sensitive data to mask'),
      policy: policyParam,
      entities: entitiesParam,
      score_threshold: thresholdParam,
      masking_char: z.string().max(1).optional().describe('Character used for masking (default: "*")'),
      chars_to_show: z.number().optional().describe('Number of characters to leave visible'),
      from_end: z
        .boolean()
        .optional()
        .describe('Show visible characters from end instead of start (default: true)'),
    },
    async ({ text, policy, entities, score_threshold, masking_char, chars_to_show, from_end }) => {
      const body: Record<string, unknown> = { text };
      if (policy) body.policy = policy;
      if (entities) body.entities = entities;
      if (score_threshold !== undefined) body.score_threshold = score_threshold;
      if (masking_char) body.masking_char = masking_char;
      if (chars_to_show !== undefined) body.chars_to_show = chars_to_show;
      if (from_end !== undefined) body.from_end = from_end;

      const result = await apiRequest('/mask', body);
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    'blindfold_redact',
    `Permanently remove PII from text by replacing with [REDACTED] markers.
Use when sensitive data should be completely removed with no way to recover it.

Example: "Call John at 555-1234" → "Call [REDACTED] at [REDACTED]"`,
    {
      text: z.string().describe('Text containing sensitive data to redact'),
      policy: policyParam,
      entities: entitiesParam,
      score_threshold: thresholdParam,
    },
    async ({ text, policy, entities, score_threshold }) => {
      const body: Record<string, unknown> = { text };
      if (policy) body.policy = policy;
      if (entities) body.entities = entities;
      if (score_threshold !== undefined) body.score_threshold = score_threshold;

      const result = await apiRequest('/redact', body);
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    'blindfold_synthesize',
    `Replace PII with realistic fake data that preserves text structure.
Useful for creating test data or anonymized datasets.
Supports 8 languages: en, cs, de, fr, es, it, pl, sk.

Example: "John Doe, john@acme.com" → "Maria Garcia, maria@example.net"`,
    {
      text: z.string().describe('Text containing sensitive data to synthesize'),
      policy: policyParam,
      entities: entitiesParam,
      score_threshold: thresholdParam,
      language: z
        .string()
        .optional()
        .describe('Language for synthetic data (en, cs, de, fr, es, it, pl, sk)'),
    },
    async ({ text, policy, entities, score_threshold, language }) => {
      const body: Record<string, unknown> = { text };
      if (policy) body.policy = policy;
      if (entities) body.entities = entities;
      if (score_threshold !== undefined) body.score_threshold = score_threshold;
      if (language) body.language = language;

      const result = await apiRequest('/synthesize', body);
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    'blindfold_hash',
    `Replace PII with deterministic one-way hashes.
Same input always produces same hash, but original cannot be recovered.
Useful for consistent anonymization across datasets.

Example: "john@example.com" → "HASH_a3f8b9c2d4"`,
    {
      text: z.string().describe('Text containing sensitive data to hash'),
      policy: policyParam,
      entities: entitiesParam,
      score_threshold: thresholdParam,
      hash_type: z.string().optional().describe('Hash algorithm: "md5", "sha1", "sha256" (default)'),
      hash_length: z.number().optional().describe('Truncate hash to this many characters'),
    },
    async ({ text, policy, entities, score_threshold, hash_type, hash_length }) => {
      const body: Record<string, unknown> = { text };
      if (policy) body.policy = policy;
      if (entities) body.entities = entities;
      if (score_threshold !== undefined) body.score_threshold = score_threshold;
      if (hash_type) body.hash_type = hash_type;
      if (hash_length !== undefined) body.hash_length = hash_length;

      const result = await apiRequest('/hash', body);
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    'blindfold_encrypt',
    `Encrypt PII in text using AES encryption with a password.
Encrypted values can be decrypted later with the same password.

Example: "John Doe" → "ENC_gAAAAABl..."`,
    {
      text: z.string().describe('Text containing sensitive data to encrypt'),
      policy: policyParam,
      entities: entitiesParam,
      score_threshold: thresholdParam,
      encryption_key: z.string().optional().describe('Encryption password (server generates one if omitted)'),
    },
    async ({ text, policy, entities, score_threshold, encryption_key }) => {
      const body: Record<string, unknown> = { text };
      if (policy) body.policy = policy;
      if (entities) body.entities = entities;
      if (score_threshold !== undefined) body.score_threshold = score_threshold;
      if (encryption_key) body.encryption_key = encryption_key;

      const result = await apiRequest('/encrypt', body);
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    'blindfold_discover',
    `Analyze text samples to discover what types of PII they contain.
Useful for understanding your data before choosing a detection policy.
Accepts multiple samples for comprehensive analysis.`,
    {
      samples: z
        .array(z.string())
        .min(1)
        .describe('Array of text samples to analyze for PII'),
      threshold: z.number().min(0).max(1).optional().describe('Detection confidence threshold'),
    },
    async ({ samples, threshold }) => {
      const body: Record<string, unknown> = { samples };
      if (threshold !== undefined) body.threshold = threshold;

      const result = await apiRequest('/discover', body);
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  return server;
}
