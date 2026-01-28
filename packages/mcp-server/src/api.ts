/**
 * HTTP helper for Blindfold API requests.
 */
export function createApiRequest(apiKey: string, baseUrl: string) {
  const apiPrefix = `${baseUrl}/api/public/v1`;

  return async function apiRequest(
    endpoint: string,
    body: Record<string, unknown>
  ): Promise<unknown> {
    const response = await fetch(`${apiPrefix}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Blindfold API error (${response.status}): ${error}`);
    }

    return response.json();
  };
}
