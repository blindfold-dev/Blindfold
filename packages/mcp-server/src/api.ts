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

/**
 * HTTP helper for multipart/form-data requests (image upload).
 */
export function createApiMultipartRequest(apiKey: string, baseUrl: string) {
  const apiPrefix = `${baseUrl}/api/public/v1`;

  return async function apiMultipartRequest(
    endpoint: string,
    formData: FormData
  ): Promise<unknown> {
    const response = await fetch(`${apiPrefix}${endpoint}`, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Blindfold API error (${response.status}): ${error}`);
    }

    return response.json();
  };
}

/**
 * Result from image processing endpoints (binary PNG + metadata headers).
 */
export interface ImageProcessResult {
  image: Buffer;
  entities_count: number;
  detected_entities: unknown[];
  mapping: Record<string, string>;
  ocr_confidence: number | null;
}

/**
 * HTTP helper for multipart requests that return binary image responses.
 */
export function createApiMultipartImageRequest(apiKey: string, baseUrl: string) {
  const apiPrefix = `${baseUrl}/api/public/v1`;

  return async function apiMultipartImageRequest(
    endpoint: string,
    formData: FormData
  ): Promise<ImageProcessResult> {
    const response = await fetch(`${apiPrefix}${endpoint}`, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Blindfold API error (${response.status}): ${error}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.startsWith('image/')) {
      const arrayBuffer = await response.arrayBuffer();
      const confidenceRaw = response.headers.get('x-ocr-confidence') || '';

      let detectedEntities: unknown[] = [];
      try { detectedEntities = JSON.parse(response.headers.get('x-detected-entities') || '[]'); } catch { /* empty */ }

      let mapping: Record<string, string> = {};
      try { mapping = JSON.parse(response.headers.get('x-mapping') || '{}'); } catch { /* empty */ }

      return {
        image: Buffer.from(arrayBuffer),
        entities_count: parseInt(response.headers.get('x-entities-count') || '0', 10),
        detected_entities: detectedEntities,
        mapping,
        ocr_confidence: confidenceRaw ? parseFloat(confidenceRaw) : null,
      };
    }

    // Fallback: if response is JSON (shouldn't happen for image endpoints)
    const data = (await response.json()) as Record<string, unknown>;
    return {
      image: Buffer.alloc(0),
      entities_count: (data.entities_count || 0) as number,
      detected_entities: (data.detected_entities || []) as unknown[],
      mapping: (data.mapping || {}) as Record<string, string>,
      ocr_confidence: (data.ocr_confidence ?? null) as number | null,
    };
  };
}
