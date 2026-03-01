/**
 * Integration test: MCP server with local/offline mode.
 *
 * Tests that the MCP server works end-to-end with createLocalRequest
 * wired in as the request function (instead of the API client).
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';

const {
  MockBlindfold,
  mockDetect,
  mockTokenize,
  mockDetokenize,
  mockRedact,
  mockMask,
  mockSynthesize,
  mockHash,
  mockEncrypt,
} = vi.hoisted(() => {
  const mockDetect = vi.fn();
  const mockTokenize = vi.fn();
  const mockDetokenize = vi.fn();
  const mockRedact = vi.fn();
  const mockMask = vi.fn();
  const mockSynthesize = vi.fn();
  const mockHash = vi.fn();
  const mockEncrypt = vi.fn();
  const MockBlindfold = vi.fn();
  return {
    MockBlindfold,
    mockDetect,
    mockTokenize,
    mockDetokenize,
    mockRedact,
    mockMask,
    mockSynthesize,
    mockHash,
    mockEncrypt,
  };
});

vi.mock('@blindfold/sdk', () => ({
  Blindfold: MockBlindfold,
}));

import { createLocalRequest } from '../src/local.js';
import { createServer } from '../src/server.js';

let client: Client;

beforeEach(async () => {
  vi.clearAllMocks();
  MockBlindfold.mockImplementation(function (this: any) {
    this.detect = mockDetect;
    this.tokenize = mockTokenize;
    this.detokenize = mockDetokenize;
    this.redact = mockRedact;
    this.mask = mockMask;
    this.synthesize = mockSynthesize;
    this.hash = mockHash;
    this.encrypt = mockEncrypt;
  });

  const localRequest = createLocalRequest();
  const server = createServer(localRequest);
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

describe('local mode: detect', () => {
  test('routes to local detect', async () => {
    const expected = {
      detected_entities: [{ type: 'email address', text: 'a@b.com', start: 0, end: 7, score: 1 }],
      entities_count: 1,
    };
    mockDetect.mockResolvedValue(expected);

    const result = await callTool('blindfold_detect', { text: 'a@b.com' });
    expect(parseResult(result)).toEqual(expected);
    expect(mockDetect).toHaveBeenCalledWith('a@b.com', {});
  });

  test('passes policy and entities to local detect', async () => {
    mockDetect.mockResolvedValue({ detected_entities: [], entities_count: 0 });

    await callTool('blindfold_detect', {
      text: 'test',
      policy: 'gdpr_eu',
      entities: ['person'],
      score_threshold: 0.8,
    });

    expect(mockDetect).toHaveBeenCalledWith('test', {
      policy: 'gdpr_eu',
      entities: ['person'],
      score_threshold: 0.8,
    });
  });
});

describe('local mode: tokenize', () => {
  test('routes to local tokenize', async () => {
    const expected = {
      text: '<Email Address_1>',
      mapping: { '<Email Address_1>': 'a@b.com' },
      detected_entities: [],
      entities_count: 1,
    };
    mockTokenize.mockResolvedValue(expected);

    const result = await callTool('blindfold_tokenize', { text: 'a@b.com' });
    expect(parseResult(result)).toEqual(expected);
  });
});

describe('local mode: detokenize', () => {
  test('routes to local detokenize', async () => {
    mockDetokenize.mockReturnValue({ text: 'a@b.com', replacements_made: 1 });

    const result = await callTool('blindfold_detokenize', {
      text: '<Email Address_1>',
      mapping: { '<Email Address_1>': 'a@b.com' },
    });

    expect(parseResult(result)).toEqual({ text: 'a@b.com', replacements_made: 1 });
  });
});

describe('local mode: redact', () => {
  test('routes to local redact', async () => {
    mockRedact.mockResolvedValue({ text: '', detected_entities: [], entities_count: 1 });

    const result = await callTool('blindfold_redact', { text: 'a@b.com' });
    expect(parseResult(result)).toEqual({ text: '', detected_entities: [], entities_count: 1 });
  });
});

describe('local mode: mask', () => {
  test('passes mask config to local mask', async () => {
    mockMask.mockResolvedValue({ text: '***@b.com', detected_entities: [], entities_count: 1 });

    await callTool('blindfold_mask', {
      text: 'a@b.com',
      masking_char: '#',
      chars_to_show: 2,
      from_end: true,
    });

    expect(mockMask).toHaveBeenCalledWith('a@b.com', {
      masking_char: '#',
      chars_to_show: 2,
      from_end: true,
    });
  });
});

describe('local mode: synthesize', () => {
  test('passes language to local synthesize', async () => {
    mockSynthesize.mockResolvedValue({ text: 'fake@test.de', detected_entities: [], entities_count: 1 });

    await callTool('blindfold_synthesize', { text: 'a@b.com', language: 'de' });

    expect(mockSynthesize).toHaveBeenCalledWith('a@b.com', { language: 'de' });
  });
});

describe('local mode: hash', () => {
  test('passes hash config to local hash', async () => {
    mockHash.mockResolvedValue({ text: 'HASH_abc', detected_entities: [], entities_count: 1 });

    await callTool('blindfold_hash', { text: 'a@b.com', hash_type: 'md5', hash_length: 8 });

    expect(mockHash).toHaveBeenCalledWith('a@b.com', { hash_type: 'md5', hash_length: 8 });
  });
});

describe('local mode: encrypt', () => {
  test('passes encryption_key to local encrypt', async () => {
    mockEncrypt.mockResolvedValue({ text: 'ENC_abc', detected_entities: [], entities_count: 1 });

    await callTool('blindfold_encrypt', { text: 'a@b.com', encryption_key: 'my-key-16-chars!' });

    expect(mockEncrypt).toHaveBeenCalledWith('a@b.com', { encryption_key: 'my-key-16-chars!' });
  });
});

describe('local mode: discover', () => {
  test('returns error for discover in local mode', async () => {
    const result = await callTool('blindfold_discover', { samples: ['test data'] });
    const content = result.content as Array<{ type: string; text: string }>;
    expect(content[0].text).toContain('not available in local mode');
  });
});

describe('local mode: batch', () => {
  test('handles batch detect via texts array', async () => {
    mockDetect
      .mockResolvedValueOnce({ detected_entities: [{ type: 'email address', text: 'a@b.com', start: 0, end: 7, score: 1 }], entities_count: 1 })
      .mockResolvedValueOnce({ detected_entities: [], entities_count: 0 });

    const result = await callTool('blindfold_detect', { texts: ['a@b.com', 'hello'] });
    const parsed = parseResult(result) as any;

    expect(parsed.total).toBe(2);
    expect(parsed.succeeded).toBe(2);
    expect(parsed.results).toHaveLength(2);
  });
});
