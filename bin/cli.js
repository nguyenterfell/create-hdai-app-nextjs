#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use tsx to run TypeScript directly, or dist if built
const cliPath = join(__dirname, '..', 'src', 'cli.ts');

spawn('npx', ['-y', 'tsx', cliPath, ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: true
}).on('exit', (code) => {
  process.exit(code || 0);
});


