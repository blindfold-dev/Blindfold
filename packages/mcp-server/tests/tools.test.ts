import { describe, test, expect, vi, beforeEach } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../src/server.js';

const mockApiRequest = vi.fn();

let client: Client;

beforeEach(async () => {
  mockApiRequest.mockReset();

  const server = createServer(mockApiRequest);
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  client = new Client({ name: 'test-client', version: '1.0.0' });

  await Promise.all([
    client.connect(clientTransport),
    server.connect(serverTransport),
  ]);
});

function callTool(name: string, args: Record<string, unknown>) {
  return client.callTool({ name, arguments: args });
}

function parseResult(result: Awaited<ReturnType<typeof callTool>>): unknown {
  const content = result.content as Array<{ type: string; text: string }>;
  return JSON.parse(content[0].text) as unknown;
}

// --- detect ---

describe('blindfold_detect', () => {
  test('should call /detect with text', async () => {
    mockApiRequest.mockResolvedValue({ detected_entities: [], entities_count: 0 });

    await callTool('blindfold_detect', { text: 'Hello world' });

    expect(mockApiRequest).toHaveBeenCalledWith('/detect', { text: 'Hello world' });
  });

  test('should pass optional params when provided', async () => {
    mockApiRequest.mockResolvedValue({ detected_entities: [], entities_count: 0 });

    await callTool('blindfold_detect', {
      text: 'test',
      policy: 'gdpr_eu',
      entities: ['person'],
      score_threshold: 0.8,
    });

    expect(mockApiRequest).toHaveBeenCalledWith('/detect', {
      text: 'test',
      policy: 'gdpr_eu',
      entities: ['person'],
      score_threshold: 0.8,
    });
  });

  test('should omit undefined optional params', async () => {
    mockApiRequest.mockResolvedValue({ detected_entities: [], entities_count: 0 });

    await callTool('blindfold_detect', { text: 'test' });

    expect(mockApiRequest).toHaveBeenCalledWith('/detect', { text: 'test' });
  });

  test('should return API result as JSON', async () => {
    const apiResult = {
      detected_entities: [{ entity_type: 'person', text: 'John', start: 0, end: 4, score: 0.95 }],
      entities_count: 1,
    };
    mockApiRequest.mockResolvedValue(apiResult);

    const result = await callTool('blindfold_detect', { text: 'John called' });
    expect(parseResult(result)).toEqual(apiResult);
  });
});

// --- tokenize ---

describe('blindfold_tokenize', () => {
  test('should call /tokenize with text', async () => {
    mockApiRequest.mockResolvedValue({ text: '', mapping: {}, detected_entities: [], entities_count: 0 });

    await callTool('blindfold_tokenize', { text: 'John Doe' });

    expect(mockApiRequest).toHaveBeenCalledWith('/tokenize', { text: 'John Doe' });
  });

  test('should pass optional params', async () => {
    mockApiRequest.mockResolvedValue({ text: '', mapping: {}, detected_entities: [], entities_count: 0 });

    await callTool('blindfold_tokenize', {
      text: 'test',
      entities: ['email address'],
      score_threshold: 0.5,
      policy: 'hipaa_us',
    });

    expect(mockApiRequest).toHaveBeenCalledWith('/tokenize', {
      text: 'test',
      entities: ['email address'],
      score_threshold: 0.5,
      policy: 'hipaa_us',
    });
  });

  test('should return tokenized result', async () => {
    const apiResult = {
      text: '<Person_1> called',
      mapping: { '<Person_1>': 'John Doe' },
      detected_entities: [],
      entities_count: 1,
    };
    mockApiRequest.mockResolvedValue(apiResult);

    const result = await callTool('blindfold_tokenize', { text: 'John Doe called' });
    expect(parseResult(result)).toEqual(apiResult);
  });
});

// --- detokenize ---

describe('blindfold_detokenize', () => {
  test('should call /detokenize with text and mapping', async () => {
    mockApiRequest.mockResolvedValue({ text: 'John Doe called', replacements_made: 1 });

    await callTool('blindfold_detokenize', {
      text: '<Person_1> called',
      mapping: { '<Person_1>': 'John Doe' },
    });

    expect(mockApiRequest).toHaveBeenCalledWith('/detokenize', {
      text: '<Person_1> called',
      mapping: { '<Person_1>': 'John Doe' },
    });
  });
});

// --- mask ---

describe('blindfold_mask', () => {
  test('should call /mask with text', async () => {
    mockApiRequest.mockResolvedValue({ text: '***', detected_entities: [], entities_count: 0 });

    await callTool('blindfold_mask', { text: 'John Doe' });

    expect(mockApiRequest).toHaveBeenCalledWith('/mask', { text: 'John Doe' });
  });

  test('should pass all mask options', async () => {
    mockApiRequest.mockResolvedValue({ text: '', detected_entities: [], entities_count: 0 });

    await callTool('blindfold_mask', {
      text: 'test',
      masking_char: '#',
      chars_to_show: 3,
      from_end: true,
      policy: 'basic',
      entities: ['person'],
      score_threshold: 0.9,
    });

    expect(mockApiRequest).toHaveBeenCalledWith('/mask', {
      text: 'test',
      masking_char: '#',
      chars_to_show: 3,
      from_end: true,
      policy: 'basic',
      entities: ['person'],
      score_threshold: 0.9,
    });
  });
});

// --- redact ---

describe('blindfold_redact', () => {
  test('should call /redact with text', async () => {
    mockApiRequest.mockResolvedValue({ text: '[REDACTED]', detected_entities: [], entities_count: 0 });

    await callTool('blindfold_redact', { text: 'John Doe' });

    expect(mockApiRequest).toHaveBeenCalledWith('/redact', { text: 'John Doe' });
  });

  test('should pass optional params', async () => {
    mockApiRequest.mockResolvedValue({ text: '', detected_entities: [], entities_count: 0 });

    await callTool('blindfold_redact', {
      text: 'test',
      policy: 'pci_dss',
      entities: ['credit card'],
      score_threshold: 0.7,
    });

    expect(mockApiRequest).toHaveBeenCalledWith('/redact', {
      text: 'test',
      policy: 'pci_dss',
      entities: ['credit card'],
      score_threshold: 0.7,
    });
  });
});

// --- synthesize ---

describe('blindfold_synthesize', () => {
  test('should call /synthesize with text', async () => {
    mockApiRequest.mockResolvedValue({ text: 'Jane Smith', detected_entities: [], entities_count: 0 });

    await callTool('blindfold_synthesize', { text: 'John Doe' });

    expect(mockApiRequest).toHaveBeenCalledWith('/synthesize', { text: 'John Doe' });
  });

  test('should pass language and other options', async () => {
    mockApiRequest.mockResolvedValue({ text: '', detected_entities: [], entities_count: 0 });

    await callTool('blindfold_synthesize', {
      text: 'test',
      language: 'de',
      policy: 'gdpr_eu',
      entities: ['person'],
      score_threshold: 0.6,
    });

    expect(mockApiRequest).toHaveBeenCalledWith('/synthesize', {
      text: 'test',
      language: 'de',
      policy: 'gdpr_eu',
      entities: ['person'],
      score_threshold: 0.6,
    });
  });
});

// --- hash ---

describe('blindfold_hash', () => {
  test('should call /hash with text', async () => {
    mockApiRequest.mockResolvedValue({ text: 'HASH_abc', detected_entities: [], entities_count: 0 });

    await callTool('blindfold_hash', { text: 'John Doe' });

    expect(mockApiRequest).toHaveBeenCalledWith('/hash', { text: 'John Doe' });
  });

  test('should pass hash options', async () => {
    mockApiRequest.mockResolvedValue({ text: '', detected_entities: [], entities_count: 0 });

    await callTool('blindfold_hash', {
      text: 'test',
      hash_type: 'md5',
      hash_length: 8,
      entities: ['email address'],
      score_threshold: 0.5,
    });

    expect(mockApiRequest).toHaveBeenCalledWith('/hash', {
      text: 'test',
      hash_type: 'md5',
      hash_length: 8,
      entities: ['email address'],
      score_threshold: 0.5,
    });
  });
});

// --- encrypt ---

describe('blindfold_encrypt', () => {
  test('should call /encrypt with text', async () => {
    mockApiRequest.mockResolvedValue({ text: 'ENC(...)', detected_entities: [], entities_count: 0 });

    await callTool('blindfold_encrypt', { text: 'John Doe' });

    expect(mockApiRequest).toHaveBeenCalledWith('/encrypt', { text: 'John Doe' });
  });

  test('should pass encryption_key', async () => {
    mockApiRequest.mockResolvedValue({ text: '', detected_entities: [], entities_count: 0 });

    await callTool('blindfold_encrypt', {
      text: 'test',
      encryption_key: 'my-secret',
      policy: 'hipaa_us',
    });

    expect(mockApiRequest).toHaveBeenCalledWith('/encrypt', {
      text: 'test',
      encryption_key: 'my-secret',
      policy: 'hipaa_us',
    });
  });

  test('should omit encryption_key when not provided', async () => {
    mockApiRequest.mockResolvedValue({ text: '', detected_entities: [], entities_count: 0 });

    await callTool('blindfold_encrypt', { text: 'test' });

    expect(mockApiRequest).toHaveBeenCalledWith('/encrypt', { text: 'test' });
  });
});

// --- discover ---

describe('blindfold_discover', () => {
  test('should call /discover with samples', async () => {
    mockApiRequest.mockResolvedValue({ detected_entities: [] });

    await callTool('blindfold_discover', {
      samples: ['John Doe called', 'Email: test@example.com'],
    });

    expect(mockApiRequest).toHaveBeenCalledWith('/discover', {
      samples: ['John Doe called', 'Email: test@example.com'],
    });
  });

  test('should pass threshold', async () => {
    mockApiRequest.mockResolvedValue({ detected_entities: [] });

    await callTool('blindfold_discover', {
      samples: ['test data'],
      threshold: 0.7,
    });

    expect(mockApiRequest).toHaveBeenCalledWith('/discover', {
      samples: ['test data'],
      threshold: 0.7,
    });
  });
});

// --- Error handling ---

describe('Error handling', () => {
  test('should propagate API errors through tool response', async () => {
    mockApiRequest.mockRejectedValue(new Error('Blindfold API error (500): Internal Server Error'));

    const result = await callTool('blindfold_detect', { text: 'test' });

    const content = result.content as Array<{ type: string; text: string }>;
    expect(content[0].text).toContain('Internal Server Error');
  });
});
