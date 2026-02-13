import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { resolveBaseUrl, resolveRegion } from '../../src/lib/config.js';
import { ConfigError } from '../../src/lib/errors.js';

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blindfold-cli-region-'));
  vi.stubEnv('XDG_CONFIG_HOME', tmpDir);
  vi.stubEnv('BLINDFOLD_API_KEY', '');
  vi.stubEnv('BLINDFOLD_BASE_URL', '');
  vi.stubEnv('BLINDFOLD_REGION', '');
});

afterEach(() => {
  vi.unstubAllEnvs();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('resolveRegion', () => {
  it('returns undefined when nothing set', () => {
    expect(resolveRegion()).toBeUndefined();
  });

  it('prefers flag value over env var', () => {
    vi.stubEnv('BLINDFOLD_REGION', 'us');
    expect(resolveRegion('eu')).toBe('eu');
  });

  it('falls back to BLINDFOLD_REGION env var', () => {
    vi.stubEnv('BLINDFOLD_REGION', 'us');
    expect(resolveRegion()).toBe('us');
  });
});

describe('resolveBaseUrl with region', () => {
  it('returns EU URL when region is eu', () => {
    expect(resolveBaseUrl(undefined, 'eu')).toBe('https://eu-api.blindfold.dev');
  });

  it('returns US URL when region is us', () => {
    expect(resolveBaseUrl(undefined, 'us')).toBe('https://us-api.blindfold.dev');
  });

  it('throws ConfigError on invalid region', () => {
    expect(() => resolveBaseUrl(undefined, 'ap')).toThrow(ConfigError);
  });

  it('base URL flag takes precedence over region', () => {
    expect(resolveBaseUrl('https://custom.dev', 'eu')).toBe('https://custom.dev');
  });

  it('BLINDFOLD_BASE_URL env takes precedence over region', () => {
    vi.stubEnv('BLINDFOLD_BASE_URL', 'https://env.dev');
    expect(resolveBaseUrl(undefined, 'eu')).toBe('https://env.dev');
  });

  it('BLINDFOLD_REGION env is used when no flag', () => {
    vi.stubEnv('BLINDFOLD_REGION', 'us');
    expect(resolveBaseUrl()).toBe('https://us-api.blindfold.dev');
  });

  it('returns default when no region and no base URL', () => {
    expect(resolveBaseUrl()).toBe('https://api.blindfold.dev');
  });
});
