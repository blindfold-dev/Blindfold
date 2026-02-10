import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApiRequest } from '../../src/lib/api.js';
import { AuthenticationError, APIError, NetworkError } from '../../src/lib/errors.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  vi.clearAllMocks();
});

function jsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  };
}

describe('createApiRequest', () => {
  const api = createApiRequest('bf_test', 'https://api.example.com');

  it('sends POST with correct headers', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ ok: true }));
    await api('/detect', { text: 'hello' });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/api/public/v1/detect',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'bf_test',
        },
        body: JSON.stringify({ text: 'hello' }),
      })
    );
  });

  it('returns parsed JSON on success', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ text: 'result' }));
    const result = await api('/tokenize', { text: 'test' });
    expect(result).toEqual({ text: 'result' });
  });

  it('throws AuthenticationError on 401', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ detail: 'Unauthorized' }, 401));
    await expect(api('/detect', { text: 'x' })).rejects.toThrow(AuthenticationError);
  });

  it('throws AuthenticationError on 403', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ detail: 'Forbidden' }, 403));
    await expect(api('/detect', { text: 'x' })).rejects.toThrow(AuthenticationError);
  });

  it('throws APIError on 500', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ detail: 'Internal error' }, 500));
    await expect(api('/detect', { text: 'x' })).rejects.toThrow(APIError);
  });

  it('throws APIError with detail from response', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ detail: 'Rate limited' }, 429));
    try {
      await api('/detect', { text: 'x' });
    } catch (err) {
      expect(err).toBeInstanceOf(APIError);
      expect((err as APIError).message).toBe('Rate limited');
      expect((err as APIError).statusCode).toBe(429);
    }
  });

  it('throws NetworkError on fetch failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));
    await expect(api('/detect', { text: 'x' })).rejects.toThrow(NetworkError);
  });
});
