export const SAMPLE_ENTITY = {
  entity_type: 'person',
  text: 'John Doe',
  start: 0,
  end: 8,
  score: 0.95,
}

interface MockResponse {
  ok: boolean
  status: number
  statusText?: string
  json: () => Promise<unknown>
}

export function mockFetchSuccess(data: unknown) {
  return jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
  } satisfies MockResponse)
}

export function mockFetchError(status: number, body?: unknown) {
  return jest.fn().mockResolvedValue({
    ok: false,
    status,
    statusText: 'Error',
    json: () => Promise.resolve(body ?? {}),
  } satisfies MockResponse)
}

export function mockFetchNetworkError() {
  return jest.fn().mockRejectedValue(new TypeError('fetch failed'))
}

export const originalFetch = global.fetch

export function restoreFetch() {
  global.fetch = originalFetch
}

/**
 * Extract the parsed JSON body from the most recent fetch mock call.
 */
export function getFetchBody(fetchMock: jest.Mock): Record<string, unknown> {
  const calls = fetchMock.mock.calls
  const lastCall = calls[calls.length - 1] as [string, RequestInit]
  return JSON.parse(lastCall[1].body as string) as Record<string, unknown>
}
