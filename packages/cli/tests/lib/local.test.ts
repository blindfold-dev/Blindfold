import { describe, it, expect, vi, beforeEach } from 'vitest';

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

import { createLocalRequest } from '../../src/lib/local.js';

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
  it('creates Blindfold client with mode: local', () => {
    createLocalRequest();
    expect(MockBlindfold).toHaveBeenCalledWith({ mode: 'local', locales: undefined });
  });

  it('passes locales to Blindfold client', () => {
    createLocalRequest(['us', 'eu', 'de']);
    expect(MockBlindfold).toHaveBeenCalledWith({ mode: 'local', locales: ['us', 'eu', 'de'] });
  });

  it('returns a function', () => {
    const request = createLocalRequest();
    expect(typeof request).toBe('function');
  });
});

describe('local detect', () => {
  it('calls client.detect with text and config', async () => {
    const expected = { detected_entities: [{ type: 'email address', text: 'test@example.com', start: 0, end: 16, score: 1 }], entities_count: 1 };
    mockDetect.mockResolvedValue(expected);
    const request = createLocalRequest();

    const result = await request('/detect', { text: 'test@example.com' });

    expect(mockDetect).toHaveBeenCalledWith('test@example.com', {});
    expect(result).toEqual(expected);
  });

  it('passes policy and entities in config', async () => {
    mockDetect.mockResolvedValue({ detected_entities: [], entities_count: 0 });
    const request = createLocalRequest();

    await request('/detect', { text: 'hello', policy: 'gdpr_eu', entities: ['person'], score_threshold: 0.8 });

    expect(mockDetect).toHaveBeenCalledWith('hello', { policy: 'gdpr_eu', entities: ['person'], score_threshold: 0.8 });
  });
});

describe('local tokenize', () => {
  it('calls client.tokenize', async () => {
    const expected = { text: '<Email Address_1>', mapping: { '<Email Address_1>': 'test@example.com' }, detected_entities: [], entities_count: 1 };
    mockTokenize.mockResolvedValue(expected);
    const request = createLocalRequest();

    const result = await request('/tokenize', { text: 'test@example.com' });

    expect(mockTokenize).toHaveBeenCalledWith('test@example.com', {});
    expect(result).toEqual(expected);
  });
});

describe('local detokenize', () => {
  it('calls client.detokenize with text and mapping', async () => {
    const expected = { text: 'test@example.com', replacements_made: 1 };
    mockDetokenize.mockReturnValue(expected);
    const request = createLocalRequest();

    const result = await request('/detokenize', {
      text: '<Email Address_1>',
      mapping: { '<Email Address_1>': 'test@example.com' },
    });

    expect(mockDetokenize).toHaveBeenCalledWith('<Email Address_1>', { '<Email Address_1>': 'test@example.com' });
    expect(result).toEqual(expected);
  });
});

describe('local redact', () => {
  it('calls client.redact', async () => {
    const expected = { text: '', detected_entities: [], entities_count: 1 };
    mockRedact.mockResolvedValue(expected);
    const request = createLocalRequest();

    await request('/redact', { text: 'test@example.com' });

    expect(mockRedact).toHaveBeenCalledWith('test@example.com', {});
  });
});

describe('local mask', () => {
  it('calls client.mask with config', async () => {
    const expected = { text: '***@example.com', detected_entities: [], entities_count: 1 };
    mockMask.mockResolvedValue(expected);
    const request = createLocalRequest();

    await request('/mask', { text: 'test@example.com', masking_char: '#', chars_to_show: 3, from_end: true });

    expect(mockMask).toHaveBeenCalledWith('test@example.com', { masking_char: '#', chars_to_show: 3, from_end: true });
  });
});

describe('local synthesize', () => {
  it('calls client.synthesize', async () => {
    mockSynthesize.mockResolvedValue({ text: 'fake@example.com', detected_entities: [], entities_count: 1 });
    const request = createLocalRequest();

    await request('/synthesize', { text: 'test@example.com', language: 'de' });

    expect(mockSynthesize).toHaveBeenCalledWith('test@example.com', { language: 'de' });
  });
});

describe('local hash', () => {
  it('calls client.hash with config', async () => {
    mockHash.mockResolvedValue({ text: 'HASH_abc123', detected_entities: [], entities_count: 1 });
    const request = createLocalRequest();

    await request('/hash', { text: 'test@example.com', hash_type: 'md5', hash_length: 8 });

    expect(mockHash).toHaveBeenCalledWith('test@example.com', { hash_type: 'md5', hash_length: 8 });
  });
});

describe('local encrypt', () => {
  it('calls client.encrypt with config', async () => {
    mockEncrypt.mockResolvedValue({ text: 'ENC_abc', detected_entities: [], entities_count: 1 });
    const request = createLocalRequest();

    await request('/encrypt', { text: 'test@example.com', encryption_key: 'my-secret-key-16chars' });

    expect(mockEncrypt).toHaveBeenCalledWith('test@example.com', { encryption_key: 'my-secret-key-16chars' });
  });
});

describe('local batch', () => {
  it('processes batch by iterating over texts', async () => {
    mockDetect
      .mockResolvedValueOnce({ detected_entities: [{ type: 'email address', text: 'a@b.com', start: 0, end: 7, score: 1 }], entities_count: 1 })
      .mockResolvedValueOnce({ detected_entities: [], entities_count: 0 });

    const request = createLocalRequest();
    const result = await request('/detect', { texts: ['a@b.com', 'hello'] });

    expect(mockDetect).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      results: [
        { detected_entities: [{ type: 'email address', text: 'a@b.com', start: 0, end: 7, score: 1 }], entities_count: 1 },
        { detected_entities: [], entities_count: 0 },
      ],
      total: 2,
      succeeded: 2,
      failed: 0,
    });
  });

  it('handles errors in batch items', async () => {
    mockTokenize
      .mockResolvedValueOnce({ text: '<Email Address_1>', mapping: {}, detected_entities: [], entities_count: 1 })
      .mockRejectedValueOnce(new Error('Something went wrong'));

    const request = createLocalRequest();
    const result = await request('/tokenize', { texts: ['a@b.com', 'fail'] });

    expect(result).toEqual({
      results: [
        { text: '<Email Address_1>', mapping: {}, detected_entities: [], entities_count: 1 },
        { error: 'Something went wrong' },
      ],
      total: 2,
      succeeded: 1,
      failed: 1,
    });
  });
});

describe('local discover', () => {
  it('throws error for discover endpoint', async () => {
    const request = createLocalRequest();
    await expect(request('/discover', { samples: ['test'] })).rejects.toThrow(
      'Discover is not available in local mode'
    );
  });
});

describe('unknown endpoint', () => {
  it('throws error for unknown endpoint', async () => {
    const request = createLocalRequest();
    await expect(request('/unknown', { text: 'test' })).rejects.toThrow('Unknown endpoint');
  });
});

describe('missing text', () => {
  it('throws when text is missing for non-batch non-detokenize', async () => {
    const request = createLocalRequest();
    await expect(request('/detect', {})).rejects.toThrow('text is required');
  });
});
