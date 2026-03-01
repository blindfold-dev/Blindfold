import { Blindfold } from '@blindfold/sdk';

const METHODS = ['detect', 'tokenize', 'redact', 'mask', 'synthesize', 'hash', 'encrypt'] as const;
type Method = (typeof METHODS)[number];

const ENDPOINT_MAP: Record<string, Method> = {};
for (const m of METHODS) ENDPOINT_MAP[`/${m}`] = m;

export function createLocalRequest(locales?: string[]) {
  const client = new Blindfold({ mode: 'local', locales });

  return async function localRequest(
    endpoint: string,
    body: Record<string, unknown>
  ): Promise<unknown> {
    if (endpoint === '/detokenize') {
      return client.detokenize(
        body.text as string,
        body.mapping as Record<string, string>
      );
    }

    if (endpoint === '/discover') {
      throw new Error(
        'Discover is not available in local mode. Set BLINDFOLD_API_KEY for cloud-based discovery.'
      );
    }

    const method = ENDPOINT_MAP[endpoint];
    if (!method) throw new Error(`Unknown endpoint: ${endpoint}`);

    const text = body.text as string | undefined;
    const texts = body.texts as string[] | undefined;
    const config: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(body)) {
      if (k !== 'text' && k !== 'texts') config[k] = v;
    }

    // Handle batch
    if (texts && texts.length > 0) {
      const results: Record<string, unknown>[] = [];
      let succeeded = 0;
      let failed = 0;

      for (const t of texts) {
        try {
          const result = await (client[method] as Function).call(client, t, config);
          results.push(result as Record<string, unknown>);
          succeeded++;
        } catch (err) {
          results.push({ error: err instanceof Error ? err.message : 'Unknown error' });
          failed++;
        }
      }

      return { results, total: texts.length, succeeded, failed };
    }

    if (!text) throw new Error('text is required');

    return (client[method] as Function).call(client, text, config);
  };
}
