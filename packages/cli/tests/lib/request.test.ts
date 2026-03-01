import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const { mockLocalRequestFn, mockApiRequestFn } = vi.hoisted(() => ({
  mockLocalRequestFn: vi.fn(),
  mockApiRequestFn: vi.fn(),
}));

vi.mock('../../src/lib/local.js', () => ({
  createLocalRequest: vi.fn().mockReturnValue(mockLocalRequestFn),
}));

vi.mock('../../src/lib/api.js', () => ({
  createApiRequest: vi.fn().mockReturnValue(mockApiRequestFn),
}));

import { createRequestFn } from '../../src/lib/request.js';
import { createLocalRequest } from '../../src/lib/local.js';
import { createApiRequest } from '../../src/lib/api.js';

let tmpDir: string;

beforeEach(() => {
  vi.clearAllMocks();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blindfold-cli-request-'));
  vi.stubEnv('XDG_CONFIG_HOME', tmpDir);
  vi.stubEnv('BLINDFOLD_API_KEY', '');
  vi.stubEnv('BLINDFOLD_BASE_URL', '');
  vi.stubEnv('BLINDFOLD_REGION', '');
});

afterEach(() => {
  vi.unstubAllEnvs();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('createRequestFn', () => {
  describe('--local flag', () => {
    it('creates local request when --local flag is set', () => {
      createRequestFn({ local: true } as any);
      expect(createLocalRequest).toHaveBeenCalledWith(undefined);
    });

    it('passes locales when --local and --locales are set', () => {
      createRequestFn({ local: true, locales: 'us,eu,de' } as any);
      expect(createLocalRequest).toHaveBeenCalledWith(['us', 'eu', 'de']);
    });

    it('trims locale codes', () => {
      createRequestFn({ local: true, locales: ' us , eu ' } as any);
      expect(createLocalRequest).toHaveBeenCalledWith(['us', 'eu']);
    });

    it('ignores API key when --local is set', () => {
      vi.stubEnv('BLINDFOLD_API_KEY', 'bf_test');
      createRequestFn({ local: true } as any);
      expect(createLocalRequest).toHaveBeenCalled();
      expect(createApiRequest).not.toHaveBeenCalled();
    });

    it('returns the local request function', () => {
      const result = createRequestFn({ local: true } as any);
      expect(result).toBe(mockLocalRequestFn);
    });
  });

  describe('auto-local mode (no API key)', () => {
    it('falls back to local when no API key is available', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      createRequestFn({} as any);
      expect(createLocalRequest).toHaveBeenCalled();
      expect(createApiRequest).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it('prints info message when auto-switching to local mode', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      createRequestFn({} as any);
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('local/offline mode'));
      spy.mockRestore();
    });

    it('passes locales in auto-local mode', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      createRequestFn({ locales: 'us,eu' } as any);
      expect(createLocalRequest).toHaveBeenCalledWith(['us', 'eu']);
      spy.mockRestore();
    });
  });

  describe('API mode', () => {
    it('creates API request when API key is in env', () => {
      vi.stubEnv('BLINDFOLD_API_KEY', 'bf_test');
      createRequestFn({} as any);
      expect(createApiRequest).toHaveBeenCalledWith('bf_test', 'https://api.blindfold.dev');
      expect(createLocalRequest).not.toHaveBeenCalled();
    });

    it('returns the API request function', () => {
      vi.stubEnv('BLINDFOLD_API_KEY', 'bf_test');
      const result = createRequestFn({} as any);
      expect(result).toBe(mockApiRequestFn);
    });

    it('prefers flag API key over env var', () => {
      vi.stubEnv('BLINDFOLD_API_KEY', 'bf_env');
      createRequestFn({ apiKey: 'bf_flag' } as any);
      expect(createApiRequest).toHaveBeenCalledWith('bf_flag', expect.any(String));
    });

    it('uses API key from config file', () => {
      const dir = path.join(tmpDir, 'blindfold');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'config.json'), JSON.stringify({ apiKey: 'bf_config' }));

      createRequestFn({} as any);
      expect(createApiRequest).toHaveBeenCalledWith('bf_config', expect.any(String));
    });

    it('resolves region-based URL', () => {
      vi.stubEnv('BLINDFOLD_API_KEY', 'bf_test');
      createRequestFn({ region: 'eu' } as any);
      expect(createApiRequest).toHaveBeenCalledWith('bf_test', 'https://eu-api.blindfold.dev');
    });

    it('uses custom base URL', () => {
      vi.stubEnv('BLINDFOLD_API_KEY', 'bf_test');
      createRequestFn({ apiKey: 'bf_test', baseUrl: 'https://custom.dev' } as any);
      expect(createApiRequest).toHaveBeenCalledWith('bf_test', 'https://custom.dev');
    });
  });
});
