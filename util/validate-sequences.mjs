import { readdir, readFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import mermaid from 'mermaid';

const root = resolve(import.meta.dirname, '..');
const documentFolders = ['BusinessAnalyst', 'SolutionArchitecture', 'TestingBenchmark'];
let count = 0;
let skipped = 0;
let failures = 0;

async function scan(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      await scan(path);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
    const markdown = await readFile(path, 'utf8');
    const diagrams = [...markdown.matchAll(/```mermaid\n([\s\S]*?)\n```/g)];
    for (const [index, match] of diagrams.entries()) {
      if (!/^\s*sequenceDiagram\b/.test(match[1])) {
        skipped += 1;
        continue;
      }
      count += 1;
      try {
        await mermaid.parse(match[1]);
      } catch (error) {
        failures += 1;
        console.error(`${relative(root, path)} diagram ${index + 1}: ${error.message}`);
      }
    }
  }
}

for (const folder of documentFolders) await scan(resolve(root, folder));
if (failures) {
  console.error(`Mermaid sequence validation failed: ${failures}/${count} diagrams`);
  process.exitCode = 1;
} else {
  console.log(`Validated ${count} Mermaid sequence diagrams (skipped ${skipped} other Mermaid blocks)`);
}
