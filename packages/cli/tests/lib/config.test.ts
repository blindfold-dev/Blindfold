import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { saveConfig, loadConfig, clearConfig, getConfigPath, resolveApiKey, resolveBaseUrl } from '../../src/lib/config.js';
import { ConfigError } from '../../src/lib/errors.js';

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blindfold-cli-test-'));
  vi.stubEnv('XDG_CONFIG_HOME', tmpDir);
  vi.stubEnv('BLINDFOLD_API_KEY', '');
  vi.stubEnv('BLINDFOLD_BASE_URL', '');
});

afterEach(() => {
  vi.unstubAllEnvs();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('config', () => {
  it('saves and loads config', () => {
    saveConfig({ apiKey: 'bf_abc123' });
    const cfg = loadConfig();
    expect(cfg.apiKey).toBe('bf_abc123');
  });

  it('returns empty object when no config exists', () => {
    const cfg = loadConfig();
    expect(cfg).toEqual({});
  });

  it('clears config', () => {
    saveConfig({ apiKey: 'bf_test' });
    clearConfig();
    const cfg = loadConfig();
    expect(cfg).toEqual({});
  });

  it('config path uses XDG_CONFIG_HOME', () => {
    expect(getConfigPath()).toBe(path.join(tmpDir, 'blindfold', 'config.json'));
  });

  it('sets file permissions to 0600', () => {
    saveConfig({ apiKey: 'bf_secret' });
    const stat = fs.statSync(getConfigPath());
    expect(stat.mode & 0o777).toBe(0o600);
  });
});

describe('resolveApiKey', () => {
  it('prefers flag value', () => {
    vi.stubEnv('BLINDFOLD_API_KEY', 'bf_env');
    saveConfig({ apiKey: 'bf_config' });
    expect(resolveApiKey('bf_flag')).toBe('bf_flag');
  });

  it('falls back to env var', () => {
    vi.stubEnv('BLINDFOLD_API_KEY', 'bf_env');
    expect(resolveApiKey()).toBe('bf_env');
  });

  it('falls back to config', () => {
    saveConfig({ apiKey: 'bf_config' });
    expect(resolveApiKey()).toBe('bf_config');
  });

  it('throws ConfigError when no key available', () => {
    expect(() => resolveApiKey()).toThrow(ConfigError);
  });
});

describe('resolveBaseUrl', () => {
  it('returns default when nothing set', () => {
    expect(resolveBaseUrl()).toBe('https://api.blindfold.dev');
  });

  it('prefers flag value', () => {
    expect(resolveBaseUrl('https://custom.dev')).toBe('https://custom.dev');
  });
});
