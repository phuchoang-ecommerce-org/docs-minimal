import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import YAML from 'yaml';

const root = process.env.DOCS_ROOT ? resolve(process.env.DOCS_ROOT) : resolve(import.meta.dirname, '..');
const directory = resolve(root, 'SolutionArchitecture/api-contract');
const spec = YAML.parse(await readFile(resolve(directory, 'openapi.yaml'), 'utf8'), { uniqueKeys: true });
const inventory = await readFile(resolve(directory, 'http-api.md'), 'utf8');
const useCases = await readFile(resolve(root, 'BusinessAnalyst/use-cases.md'), 'utf8');
const allowed = new Map([...inventory.matchAll(/^\| (GET|POST|PUT|PATCH|DELETE) \| `([^`]+)` \| (UC-\d{2}) \|/gm)]
  .map(([, method, path, uc]) => [`${method} ${path}`, uc]));
assert(allowed.size > 0, 'No scope inventory found');
const ids = new Set();
const covered = new Set();
const reachable = new Set();
function scan(value) {
  if (!value || typeof value !== 'object') return;
  if (value.$ref) {
    assert(value.$ref.startsWith('#/'), `Only local refs allowed: ${value.$ref}`);
    let target = spec;
    for (const key of value.$ref.slice(2).split('/').map(s => s.replaceAll('~1', '/').replaceAll('~0', '~'))) {
      assert(target && Object.hasOwn(target, key), `Dangling ref ${value.$ref}`);
      target = target[key];
    }
    if (!reachable.has(value.$ref)) { reachable.add(value.$ref); scan(target); }
  }
  for (const child of Object.values(value)) scan(child);
}
const schemaOf = response => response?.content?.['application/json']?.schema?.$ref?.split('/').at(-1);
const problemCodes = new Set(spec.components.schemas.Problem.properties.code.enum);
for (const [path, methods] of Object.entries(spec.paths)) {
  for (const [method, op] of Object.entries(methods)) {
    const key = `${method.toUpperCase()} ${path}`;
    assert.equal(op['x-use-case'], allowed.get(key), `Out-of-scope or mismatched UC: ${key}`);
    assert(useCases.includes(`| ${op['x-use-case']} |`), `Unknown UC: ${key}`);
    assert(!ids.has(op.operationId), `Duplicate operationId: ${op.operationId}`);
    ids.add(op.operationId); covered.add(op['x-use-case']); allowed.delete(key);
    assert(Array.isArray(op.security), `Explicit security required: ${key}`);
    assert(op['x-roles']?.length, `Missing roles: ${key}`);
    assert(!op.parameters?.some(p => p.name === 'page'), `Offset pagination: ${key}`);
    for (const [status, codes] of Object.entries(op['x-error-codes'] ?? {})) {
      assert(op.responses[status], `Undeclared status ${key} ${status}`);
      for (const code of codes) assert(problemCodes.has(code), `Unknown code ${code}`);
    }
    for (const status of Object.keys(op.responses).filter(s => Number(s) >= 400)) {
      assert(op['x-error-codes']?.[status]?.length, `No stable codes ${key} ${status}`);
    }
    const responseSchema = schemaOf(op.responses['200']);
    if (responseSchema?.endsWith('List')) {
      for (const name of ['cursor', 'limit']) assert(op.parameters?.some(p => p.name === name), `${key} missing ${name}`);
      for (const name of ['items', 'nextCursor', 'hasNext']) assert(spec.components.schemas[responseSchema].required.includes(name), `${responseSchema} missing ${name}`);
    }
    if (method === 'patch' || (method === 'put' && path.startsWith('/cart'))) {
      const name = op.requestBody.content['application/json'].schema.$ref.split('/').at(-1);
      assert(spec.components.schemas[name].required.includes('expectedVersion'), `${key} missing edit precondition`);
    }
    scan(op);
  }
}
assert.equal(allowed.size, 0, `Inventory operations absent from OpenAPI: ${[...allowed.keys()]}`);
assert.equal(covered.size, 10, 'All UC-01 through UC-10 must be covered');
for (const name of Object.keys(spec.components.schemas)) assert(reachable.has(`#/components/schemas/${name}`), `Unused schema: ${name}`);
for (const name of ['ProductWrite', 'ProductUpdate', 'CreateOrder', 'ReviewCreate', 'SellerStatusUpdate']) {
  assert.equal(spec.components.schemas[name].additionalProperties, false, `Unsafe request allowlist: ${name}`);
}
assert(spec.components.schemas.Product.properties.variants, 'Product must expose purchasable variant IDs');
assert(spec.components.schemas.CreateOrder.required.includes('cartVersion'), 'Checkout needs an explicit cart intent');
assert.equal(spec.components.schemas.ProductImage.oneOf.length, 2, 'Image branch exclusivity missing');
console.log(`API checks passed: ${ids.size} operations, ${covered.size} use cases, ${Object.keys(spec.components.schemas).length} reachable schemas.`);
