import { describe, test, expect, vi, beforeEach } from 'vitest';
import { createApiRequest } from '../src/api.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe('createApiRequest', () => {
  const apiRequest = createApiRequest('test-api-key', 'https://api.example.com');

  test('should POST to correct URL', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ text: 'result' }),
    });

    await apiRequest('/tokenize', { text: 'hello' });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/api/public/v1/tokenize',
      expect.objectContaining({ method: 'POST' })
    );
  });

  test('should send API key in X-API-Key header', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await apiRequest('/detect', { text: 'test' });

    const callArgs = mockFetch.mock.calls[0] as [string, RequestInit];
    const headers = callArgs[1].headers as Record<string, string>;
    expect(headers['X-API-Key']).toBe('test-api-key');
  });

  test('should send Content-Type application/json', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await apiRequest('/detect', { text: 'test' });

    const callArgs = mockFetch.mock.calls[0] as [string, RequestInit];
    const headers = callArgs[1].headers as Record<string, string>;
    expect(headers['Content-Type']).toBe('application/json');
  });

  test('should serialize body as JSON', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await apiRequest('/tokenize', { text: 'hello', policy: 'gdpr_eu' });

    const callArgs = mockFetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(callArgs[1].body as string) as Record<string, unknown>;
    expect(body).toEqual({ text: 'hello', policy: 'gdpr_eu' });
  });

  test('should return parsed JSON on success', async () => {
    const mockResponse = { text: '<Person_1> called', entities_count: 1 };
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await apiRequest('/tokenize', { text: 'John called' });
    expect(result).toEqual(mockResponse);
  });

  test('should throw on non-OK response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal Server Error'),
    });

    await expect(apiRequest('/tokenize', { text: 'test' }))
      .rejects.toThrow('Blindfold API error (500): Internal Server Error');
  });

  test('should throw on 401 unauthorized', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve('Unauthorized'),
    });

    await expect(apiRequest('/detect', { text: 'test' }))
      .rejects.toThrow('Blindfold API error (401): Unauthorized');
  });

  test('should throw on 429 rate limit', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 429,
      text: () => Promise.resolve('Rate limit exceeded'),
    });

    await expect(apiRequest('/tokenize', { text: 'test' }))
      .rejects.toThrow('Blindfold API error (429): Rate limit exceeded');
  });

  test('should use custom base URL', async () => {
    const customRequest = createApiRequest('key', 'https://custom.api.dev');
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await customRequest('/detect', { text: 'test' });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://custom.api.dev/api/public/v1/detect',
      expect.anything()
    );
  });
});
