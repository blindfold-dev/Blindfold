import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { ConfigError } from './errors.js';

interface Config {
  apiKey?: string;
  baseUrl?: string;
  region?: string;
}

const REGION_URLS: Record<string, string> = {
  eu: 'https://eu-api.blindfold.dev',
  us: 'https://us-api.blindfold.dev',
};

function getConfigDir(): string {
  const xdg = process.env.XDG_CONFIG_HOME;
  const base = xdg || path.join(os.homedir(), '.config');
  return path.join(base, 'blindfold');
}

export function getConfigPath(): string {
  return path.join(getConfigDir(), 'config.json');
}

export function loadConfig(): Config {
  const configPath = getConfigPath();
  try {
    const data = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(data) as Config;
  } catch {
    return {};
  }
}

export function saveConfig(config: Config): void {
  const dir = getConfigDir();
  fs.mkdirSync(dir, { recursive: true });
  const configPath = path.join(dir, 'config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', {
    mode: 0o600,
  });
}

export function clearConfig(): void {
  const configPath = getConfigPath();
  try {
    fs.unlinkSync(configPath);
  } catch {
    // Already gone
  }
}

export function resolveApiKey(flagValue?: string): string {
  const key = flagValue || process.env.BLINDFOLD_API_KEY || loadConfig().apiKey;
  if (!key) {
    throw new ConfigError(
      'No API key found. Run "blindfold config set-key <key>" or set BLINDFOLD_API_KEY.'
    );
  }
  return key;
}

export function resolveRegion(flagValue?: string): string | undefined {
  return flagValue || process.env.BLINDFOLD_REGION || loadConfig().region;
}

export function resolveBaseUrl(flagValue?: string, regionFlag?: string): string {
  if (flagValue) return flagValue;
  if (process.env.BLINDFOLD_BASE_URL) return process.env.BLINDFOLD_BASE_URL;
  const config = loadConfig();
  if (config.baseUrl) return config.baseUrl;

  const region = resolveRegion(regionFlag);
  if (region) {
    const url = REGION_URLS[region.toLowerCase()];
    if (!url) {
      throw new ConfigError(
        `Invalid region '${region}'. Must be one of: ${Object.keys(REGION_URLS).join(', ')}`
      );
    }
    return url;
  }

  return 'https://api.blindfold.dev';
}
