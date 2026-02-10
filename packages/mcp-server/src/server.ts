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

/** Build body with text or texts, plus optional config fields. */
function buildBody(
  text: string | undefined,
  texts: string[] | undefined,
  extra: Record<string, unknown>
): Record<string, unknown> {
  if (texts && texts.length > 0) {
    return { texts, ...extra };
  }
  return { text, ...extra };
}

/** Validate that exactly one of text/texts is provided. */
function validateInput(text: string | undefined, texts: string[] | undefined): void {
  if (text && texts && texts.length > 0) {
    throw new Error("Provide 'text' or 'texts', not both");
  }
  if (!text && (!texts || texts.length === 0)) {
    throw new Error("Provide 'text' or 'texts'");
  }
}

/** Strip undefined values from an object. */
function optionals(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) result[k] = v;
  }
  return result;
}

export function createServer(apiRequest: ApiRequestFn): McpServer {
  const server = new McpServer({
    name: 'blindfold',
    version: '1.2.0',
  });

  // --- detect ---
  server.tool(
    'blindfold_detect',
    `Detect PII in text without modifying it.
Returns only the detected entities with their types, positions, and confidence scores.
The original text is not transformed or returned.

Supports batch: pass "texts" array (max 100) instead of "text" to process multiple texts in one call.

Example: "John Doe, john@example.com" → [{"type": "person", "text": "John Doe", ...}, {"type": "email address", ...}]`,
    {
      text: z.string().optional().describe('Text to analyze for PII'),
      texts: z.array(z.string()).max(100).optional().describe('Array of texts for batch processing (max 100). Use text OR texts, not both.'),
      policy: policyParam,
      entities: entitiesParam,
      score_threshold: thresholdParam,
    },
    async ({ text, texts, policy, entities, score_threshold }) => {
      validateInput(text, texts);
      const body = buildBody(text, texts, optionals({ policy, entities, score_threshold }));
      const result = await apiRequest('/detect', body);
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- tokenize ---
  server.tool(
    'blindfold_tokenize',
    `Detect and replace PII (personal data) in text with reversible tokens.
Use this BEFORE sending text containing sensitive information to an AI model.
Returns tokenized text and a mapping to restore original values later.

Supports batch: pass "texts" array (max 100) instead of "text" to process multiple texts in one call.

Example: "John Doe, john@example.com" → "<Person_1>, <Email Address_1>"`,
    {
      text: z.string().optional().describe('Text containing sensitive data to tokenize'),
      texts: z.array(z.string()).max(100).optional().describe('Array of texts for batch processing (max 100). Use text OR texts, not both.'),
      policy: policyParam,
      entities: entitiesParam,
      score_threshold: thresholdParam,
    },
    async ({ text, texts, policy, entities, score_threshold }) => {
      validateInput(text, texts);
      const body = buildBody(text, texts, optionals({ policy, entities, score_threshold }));
      const result = await apiRequest('/tokenize', body);
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- detokenize (no batch — client-side operation) ---
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

  // --- mask ---
  server.tool(
    'blindfold_mask',
    `Partially hide PII in text with masking characters.
Useful when you need to show data format but hide actual values.

Supports batch: pass "texts" array (max 100) instead of "text" to process multiple texts in one call.

Example: "4532-7562-9102-3456" → "****-****-****-3456"`,
    {
      text: z.string().optional().describe('Text containing sensitive data to mask'),
      texts: z.array(z.string()).max(100).optional().describe('Array of texts for batch processing (max 100). Use text OR texts, not both.'),
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
    async ({ text, texts, policy, entities, score_threshold, masking_char, chars_to_show, from_end }) => {
      validateInput(text, texts);
      const body = buildBody(text, texts, optionals({ policy, entities, score_threshold, masking_char, chars_to_show, from_end }));
      const result = await apiRequest('/mask', body);
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- redact ---
  server.tool(
    'blindfold_redact',
    `Permanently remove PII from text by replacing with [REDACTED] markers.
Use when sensitive data should be completely removed with no way to recover it.

Supports batch: pass "texts" array (max 100) instead of "text" to process multiple texts in one call.

Example: "Call John at 555-1234" → "Call [REDACTED] at [REDACTED]"`,
    {
      text: z.string().optional().describe('Text containing sensitive data to redact'),
      texts: z.array(z.string()).max(100).optional().describe('Array of texts for batch processing (max 100). Use text OR texts, not both.'),
      policy: policyParam,
      entities: entitiesParam,
      score_threshold: thresholdParam,
    },
    async ({ text, texts, policy, entities, score_threshold }) => {
      validateInput(text, texts);
      const body = buildBody(text, texts, optionals({ policy, entities, score_threshold }));
      const result = await apiRequest('/redact', body);
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- synthesize ---
  server.tool(
    'blindfold_synthesize',
    `Replace PII with realistic fake data that preserves text structure.
Useful for creating test data or anonymized datasets.
Supports 8 languages: en, cs, de, fr, es, it, pl, sk.

Supports batch: pass "texts" array (max 100) instead of "text" to process multiple texts in one call.

Example: "John Doe, john@acme.com" → "Maria Garcia, maria@example.net"`,
    {
      text: z.string().optional().describe('Text containing sensitive data to synthesize'),
      texts: z.array(z.string()).max(100).optional().describe('Array of texts for batch processing (max 100). Use text OR texts, not both.'),
      policy: policyParam,
      entities: entitiesParam,
      score_threshold: thresholdParam,
      language: z
        .string()
        .optional()
        .describe('Language for synthetic data (en, cs, de, fr, es, it, pl, sk)'),
    },
    async ({ text, texts, policy, entities, score_threshold, language }) => {
      validateInput(text, texts);
      const body = buildBody(text, texts, optionals({ policy, entities, score_threshold, language }));
      const result = await apiRequest('/synthesize', body);
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- hash ---
  server.tool(
    'blindfold_hash',
    `Replace PII with deterministic one-way hashes.
Same input always produces same hash, but original cannot be recovered.
Useful for consistent anonymization across datasets.

Supports batch: pass "texts" array (max 100) instead of "text" to process multiple texts in one call.

Example: "john@example.com" → "HASH_a3f8b9c2d4"`,
    {
      text: z.string().optional().describe('Text containing sensitive data to hash'),
      texts: z.array(z.string()).max(100).optional().describe('Array of texts for batch processing (max 100). Use text OR texts, not both.'),
      policy: policyParam,
      entities: entitiesParam,
      score_threshold: thresholdParam,
      hash_type: z.string().optional().describe('Hash algorithm: "md5", "sha1", "sha256" (default)'),
      hash_length: z.number().optional().describe('Truncate hash to this many characters'),
    },
    async ({ text, texts, policy, entities, score_threshold, hash_type, hash_length }) => {
      validateInput(text, texts);
      const body = buildBody(text, texts, optionals({ policy, entities, score_threshold, hash_type, hash_length }));
      const result = await apiRequest('/hash', body);
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- encrypt ---
  server.tool(
    'blindfold_encrypt',
    `Encrypt PII in text using AES encryption with a password.
Encrypted values can be decrypted later with the same password.

Supports batch: pass "texts" array (max 100) instead of "text" to process multiple texts in one call.

Example: "John Doe" → "ENC_gAAAAABl..."`,
    {
      text: z.string().optional().describe('Text containing sensitive data to encrypt'),
      texts: z.array(z.string()).max(100).optional().describe('Array of texts for batch processing (max 100). Use text OR texts, not both.'),
      policy: policyParam,
      entities: entitiesParam,
      score_threshold: thresholdParam,
      encryption_key: z.string().optional().describe('Encryption password (server generates one if omitted)'),
    },
    async ({ text, texts, policy, entities, score_threshold, encryption_key }) => {
      validateInput(text, texts);
      const body = buildBody(text, texts, optionals({ policy, entities, score_threshold, encryption_key }));
      const result = await apiRequest('/encrypt', body);
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- discover ---
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
