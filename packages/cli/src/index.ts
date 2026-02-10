import { Command } from 'commander';
import { registerConfigCommand } from './commands/config.js';
import { registerDetectCommand } from './commands/detect.js';
import { registerTokenizeCommand } from './commands/tokenize.js';
import { registerDetokenizeCommand } from './commands/detokenize.js';
import { registerRedactCommand } from './commands/redact.js';
import { registerMaskCommand } from './commands/mask.js';
import { registerSynthesizeCommand } from './commands/synthesize.js';
import { registerHashCommand } from './commands/hash.js';
import { registerEncryptCommand } from './commands/encrypt.js';
import { registerDiscoverCommand } from './commands/discover.js';
import { AuthenticationError, ConfigError, InputError } from './lib/errors.js';

const program = new Command();

program
  .name('blindfold')
  .description('Blindfold CLI — detect and protect PII from the terminal')
  .version('1.2.1')
  .option('--api-key <key>', 'API key (overrides BLINDFOLD_API_KEY env var)')
  .option('--base-url <url>', 'API base URL')
  .option('--json', 'output raw JSON')
  .option('--quiet', 'output only the transformed text');

registerConfigCommand(program);
registerDetectCommand(program);
registerTokenizeCommand(program);
registerDetokenizeCommand(program);
registerRedactCommand(program);
registerMaskCommand(program);
registerSynthesizeCommand(program);
registerHashCommand(program);
registerEncryptCommand(program);
registerDiscoverCommand(program);

program.parseAsync(process.argv).catch((err) => {
  if (err instanceof AuthenticationError) {
    console.error(
      'Error: Authentication failed. Run "blindfold config set-key <key>" or set BLINDFOLD_API_KEY.'
    );
    process.exit(1);
  }
  if (err instanceof ConfigError || err instanceof InputError) {
    console.error(`Error: ${err.message}`);
    process.exit(2);
  }
  console.error(`Error: ${err.message || err}`);
  process.exit(1);
});
