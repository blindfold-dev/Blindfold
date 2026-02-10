import { AuthenticationError, APIError, NetworkError } from './errors.js';

export function createApiRequest(apiKey: string, baseUrl: string) {
  const apiPrefix = `${baseUrl}/api/public/v1`;

  return async function apiRequest<T = unknown>(
    endpoint: string,
    body: Record<string, unknown>
  ): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${apiPrefix}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify(body),
      });
    } catch (err) {
      throw new NetworkError(
        err instanceof Error ? err.message : 'Network request failed.'
      );
    }

    if (response.status === 401 || response.status === 403) {
      throw new AuthenticationError();
    }

    if (!response.ok) {
      const text = await response.text();
      let detail = text;
      try {
        const json = JSON.parse(text);
        detail = json.detail || json.message || text;
      } catch {
        // Use raw text
      }
      throw new APIError(
        typeof detail === 'string' ? detail : JSON.stringify(detail),
        response.status
      );
    }

    return response.json() as Promise<T>;
  };
}
