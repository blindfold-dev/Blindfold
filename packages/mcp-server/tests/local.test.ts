import { describe, test, expect, vi, beforeEach } from 'vitest';

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

beforeEach(() => {
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
});

describe('createLocalRequest', () => {
  test('creates Blindfold client with mode: local', () => {
    createLocalRequest();
    expect(MockBlindfold).toHaveBeenCalledWith({ mode: 'local', locales: undefined });
  });

  test('passes locales', () => {
    createLocalRequest(['us', 'eu']);
    expect(MockBlindfold).toHaveBeenCalledWith({ mode: 'local', locales: ['us', 'eu'] });
  });
});

describe('detect', () => {
  test('calls client.detect with text', async () => {
    const expected = { detected_entities: [{ type: 'email address', text: 'a@b.com', start: 0, end: 7, score: 1 }], entities_count: 1 };
    mockDetect.mockResolvedValue(expected);
    const request = createLocalRequest();

    const result = await request('/detect', { text: 'a@b.com' });

    expect(mockDetect).toHaveBeenCalledWith('a@b.com', {});
    expect(result).toEqual(expected);
  });

  test('forwards config params', async () => {
    mockDetect.mockResolvedValue({ detected_entities: [], entities_count: 0 });
    const request = createLocalRequest();

    await request('/detect', { text: 'test', policy: 'gdpr_eu', entities: ['person'], score_threshold: 0.8 });

    expect(mockDetect).toHaveBeenCalledWith('test', { policy: 'gdpr_eu', entities: ['person'], score_threshold: 0.8 });
  });
});

describe('tokenize', () => {
  test('calls client.tokenize', async () => {
    const expected = { text: '<Email Address_1>', mapping: { '<Email Address_1>': 'a@b.com' }, detected_entities: [], entities_count: 1 };
    mockTokenize.mockResolvedValue(expected);
    const request = createLocalRequest();

    const result = await request('/tokenize', { text: 'a@b.com' });

    expect(mockTokenize).toHaveBeenCalledWith('a@b.com', {});
    expect(result).toEqual(expected);
  });
});

describe('detokenize', () => {
  test('calls client.detokenize with text and mapping', async () => {
    mockDetokenize.mockReturnValue({ text: 'a@b.com', replacements_made: 1 });
    const request = createLocalRequest();

    const result = await request('/detokenize', {
      text: '<Email Address_1>',
      mapping: { '<Email Address_1>': 'a@b.com' },
    });

    expect(mockDetokenize).toHaveBeenCalledWith('<Email Address_1>', { '<Email Address_1>': 'a@b.com' });
    expect(result).toEqual({ text: 'a@b.com', replacements_made: 1 });
  });
});

describe('redact', () => {
  test('calls client.redact', async () => {
    mockRedact.mockResolvedValue({ text: '', detected_entities: [], entities_count: 1 });
    const request = createLocalRequest();

    await request('/redact', { text: 'a@b.com' });

    expect(mockRedact).toHaveBeenCalledWith('a@b.com', {});
  });
});

describe('mask', () => {
  test('passes mask options in config', async () => {
    mockMask.mockResolvedValue({ text: '*@b.com', detected_entities: [], entities_count: 1 });
    const request = createLocalRequest();

    await request('/mask', { text: 'a@b.com', masking_char: '#', chars_to_show: 2, from_end: true });

    expect(mockMask).toHaveBeenCalledWith('a@b.com', { masking_char: '#', chars_to_show: 2, from_end: true });
  });
});

describe('synthesize', () => {
  test('passes language in config', async () => {
    mockSynthesize.mockResolvedValue({ text: 'fake@example.com', detected_entities: [], entities_count: 1 });
    const request = createLocalRequest();

    await request('/synthesize', { text: 'a@b.com', language: 'de' });

    expect(mockSynthesize).toHaveBeenCalledWith('a@b.com', { language: 'de' });
  });
});

describe('hash', () => {
  test('passes hash options', async () => {
    mockHash.mockResolvedValue({ text: 'HASH_abc', detected_entities: [], entities_count: 1 });
    const request = createLocalRequest();

    await request('/hash', { text: 'a@b.com', hash_type: 'sha1', hash_length: 12 });

    expect(mockHash).toHaveBeenCalledWith('a@b.com', { hash_type: 'sha1', hash_length: 12 });
  });
});

describe('encrypt', () => {
  test('passes encryption_key', async () => {
    mockEncrypt.mockResolvedValue({ text: 'ENC_abc', detected_entities: [], entities_count: 1 });
    const request = createLocalRequest();

    await request('/encrypt', { text: 'a@b.com', encryption_key: 'my-secret-key-16' });

    expect(mockEncrypt).toHaveBeenCalledWith('a@b.com', { encryption_key: 'my-secret-key-16' });
  });
});

describe('batch processing', () => {
  test('iterates over texts array', async () => {
    mockRedact
      .mockResolvedValueOnce({ text: '', detected_entities: [], entities_count: 1 })
      .mockResolvedValueOnce({ text: 'hello', detected_entities: [], entities_count: 0 });

    const request = createLocalRequest();
    const result = await request('/redact', { texts: ['a@b.com', 'hello'] });

    expect(mockRedact).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      results: [
        { text: '', detected_entities: [], entities_count: 1 },
        { text: 'hello', detected_entities: [], entities_count: 0 },
      ],
      total: 2,
      succeeded: 2,
      failed: 0,
    });
  });

  test('captures errors per batch item', async () => {
    mockDetect
      .mockResolvedValueOnce({ detected_entities: [], entities_count: 0 })
      .mockRejectedValueOnce(new Error('Failed'));

    const request = createLocalRequest();
    const result = await request('/detect', { texts: ['ok', 'bad'] });

    expect(result).toEqual({
      results: [
        { detected_entities: [], entities_count: 0 },
        { error: 'Failed' },
      ],
      total: 2,
      succeeded: 1,
      failed: 1,
    });
  });
});

describe('error cases', () => {
  test('throws for /discover', async () => {
    const request = createLocalRequest();
    await expect(request('/discover', { samples: ['test'] })).rejects.toThrow(
      'Discover is not available in local mode'
    );
  });

  test('throws for unknown endpoint', async () => {
    const request = createLocalRequest();
    await expect(request('/unknown', { text: 'test' })).rejects.toThrow('Unknown endpoint');
  });

  test('throws when text is missing', async () => {
    const request = createLocalRequest();
    await expect(request('/detect', {})).rejects.toThrow('text is required');
  });
});
