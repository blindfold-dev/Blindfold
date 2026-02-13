import { Command } from 'commander';
import {
  saveConfig,
  loadConfig,
  clearConfig,
  getConfigPath,
} from '../lib/config.js';
import { c } from '../lib/output.js';

export function registerConfigCommand(program: Command): void {
  const config = program
    .command('config')
    .description('manage CLI configuration');

  config
    .command('set-key <api-key>')
    .description('save your Blindfold API key')
    .action((apiKey: string) => {
      const existing = loadConfig();
      saveConfig({ ...existing, apiKey });
      console.log(c.green('API key saved.'));
    });

  config
    .command('set-region <region>')
    .description('save default region (eu or us)')
    .action((region: string) => {
      const valid = ['eu', 'us'];
      const lower = region.toLowerCase();
      if (!valid.includes(lower)) {
        console.error(c.red(`Invalid region '${region}'. Must be one of: ${valid.join(', ')}`));
        process.exit(2);
      }
      const existing = loadConfig();
      saveConfig({ ...existing, region: lower });
      console.log(c.green(`Region set to '${lower}'.`));
    });

  config
    .command('show')
    .description('show current configuration')
    .action(() => {
      const cfg = loadConfig();
      const configPath = getConfigPath();
      console.log(c.bold('Config file:'), configPath);
      if (cfg.apiKey) {
        const masked = cfg.apiKey.slice(0, 3) + '...' + cfg.apiKey.slice(-4);
        console.log(c.bold('API key:    '), masked);
      } else {
        console.log(c.bold('API key:    '), c.dim('not set'));
      }
      if (cfg.region) {
        console.log(c.bold('Region:     '), cfg.region);
      }
      if (cfg.baseUrl) {
        console.log(c.bold('Base URL:   '), cfg.baseUrl);
      }
    });

  config
    .command('clear')
    .description('remove saved configuration')
    .action(() => {
      clearConfig();
      console.log(c.green('Configuration cleared.'));
    });

  config
    .command('path')
    .description('print config file path')
    .action(() => {
      console.log(getConfigPath());
    });
}
