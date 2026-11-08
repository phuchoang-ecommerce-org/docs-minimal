import { readdir, readFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { JSDOM } from 'jsdom';
import { marked } from 'marked';

// Mermaid flowchart/class/ER parsers use DOMPurify even during syntax checks.
const dom = new JSDOM('<!doctype html><html><body></body></html>');
globalThis.window = dom.window;
globalThis.document = dom.window.document;
const { default: mermaid } = await import('mermaid');
mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' });
const root = resolve(import.meta.dirname, '..');
const folders = ['BusinessAnalyst', 'SolutionArchitecture', 'ProductManager'];
let count = 0;
let failures = 0;
const types = new Map();
async function scan(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) { await scan(path); continue; }
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
    const tokens = marked.lexer(await readFile(path, 'utf8'));
    const diagrams = [];
    marked.walkTokens(tokens, token => {
      if (token.type === 'code' && token.lang?.trim().split(/\s+/)[0] === 'mermaid') {
        diagrams.push(token.text);
      }
    });
    for (const [index, source] of diagrams.entries()) {
      count += 1;
      try {
        const result = await mermaid.parse(source);
        if (!result) throw new Error('Parser returned no diagram');
        types.set(result.diagramType, (types.get(result.diagramType) || 0) + 1);
      } catch (error) {
        failures += 1;
        console.error(`${relative(root, path)} diagram ${index + 1}: ${error.message}`);
      }
    }
  }
}
try {
  for (const folder of folders) await scan(resolve(root, folder));
  console.log(`Validated ${count - failures}/${count} Mermaid blocks; skipped 0`);
  for (const [type, total] of types) console.log(`  ${type}: ${total}`);
  if (failures || count === 0) process.exitCode = 1;
} finally { dom.window.close(); }
