import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const utility = import.meta.dirname;
const root = process.env.DOCS_ROOT ? resolve(process.env.DOCS_ROOT) : resolve(utility, '..');
await mkdir(resolve(utility, 'public'), { recursive: true });
const cli = resolve(utility, 'node_modules/@redocly/cli/bin/cli.js');
const result = spawnSync(process.execPath, [cli, 'build-docs',
  resolve(root, 'SolutionArchitecture/api-contract/openapi.yaml'),
  '--config', resolve(utility, 'redocly.yaml'), '--inlineBundle',
  '--title', 'Marketplace API — UC-01 to UC-10',
  '--output', resolve(utility, 'public/redoc.html'),
], { cwd: utility, stdio: 'inherit', env: { ...process.env, REDOCLY_TELEMETRY: 'off' } });
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
