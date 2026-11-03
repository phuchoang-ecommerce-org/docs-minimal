#!/usr/bin/env node
/**
 * Generate SVG beside each PlantUML (.puml) and BPMN 2.0 (.bpmn) source.
 * Run from util/ via npm run diagrams:build; the Astro build calls that script.
 */
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const SKIP = new Set(['node_modules', '.git', '.github', 'dist', 'public', '.astro']);
const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
})[c]);
const decode = s => String(s).replace(/&(amp|lt|gt|quot|apos);/g, (_, n) => ({
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'"
})[n]);

function findSources(dir, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory() && !SKIP.has(entry.name)) findSources(file, found);
    else if (entry.isFile() && /\.(puml|bpmn)$/i.test(entry.name)) found.push(file);
  }
  return found;
}

// Small, strict XML reader for the BPMN 2.0 + BPMN-DI subset authored here.
// It checks balanced tags, duplicate IDs and source/target/DI references.
function parseXml(xml) {
  const tokens = xml.match(/<\?[^>]*\?>|<!--[\s\S]*?-->|<[^>]+>|[^<]+/g) || [];
  const root = { tag: '#document', attrs: {}, children: [], text: '' };
  const stack = [root];
  for (const token of tokens) {
    if (token.startsWith('<?') || token.startsWith('<!--')) continue;
    if (token.startsWith('</')) {
      const name = token.slice(2, -1).trim();
      const open = stack.pop();
      if (!open || open.tag !== name) throw new Error('Unbalanced XML closing tag: ' + name);
    } else if (token.startsWith('<')) {
      const selfClosing = token.endsWith('/>');
      const tag = /^<([^\s/>]+)/.exec(token)?.[1];
      if (!tag) throw new Error('Invalid XML opening tag');
      const attrs = {};
      const body = token.slice(tag.length + 1, selfClosing ? -2 : -1);
      const attr = /([\w:.-]+)\s*=\s*(["'])(.*?)\2/g;
      for (const match of body.matchAll(attr)) attrs[match[1]] = decode(match[3]);
      const node = { tag, attrs, children: [], text: '' };
      stack.at(-1).children.push(node);
      if (!selfClosing) stack.push(node);
    } else if (stack.length > 1) {
      stack.at(-1).text += decode(token);
    }
  }
  if (stack.length !== 1 || root.children.length !== 1) throw new Error('Malformed BPMN XML document');
  return root.children[0];
}
const children = (node, tag) => node.children.filter(c => c.tag === tag);
const first = (node, tag) => children(node, tag)[0];
function all(node, result = []) {
  result.push(node);
  for (const child of node.children) all(child, result);
  return result;
}
function bounds(shape) {
  const b = first(shape, 'dc:Bounds');
  if (!b) throw new Error('BPMN shape has no Bounds');
  const values = ['x', 'y', 'width', 'height'].map(k => Number(b.attrs[k]));
  if (values.some(v => !Number.isFinite(v))) throw new Error('Invalid BPMN-DI bounds');
  return values;
}
function textLines(text, width = 18) {
  const words = text.split(/\s+/);
  const lines = [];
  for (const word of words) {
    if (!word) continue;
    if (!lines.length || (lines.at(-1) + ' ' + word).length > width) lines.push(word);
    else lines[lines.length - 1] += ' ' + word;
  }
  return lines.length ? lines : [''];
}
function renderBpmn(file) {
  const root = parseXml(fs.readFileSync(file, 'utf8'));
  if (root.tag !== 'bpmn:definitions' ||
      root.attrs['xmlns:bpmn'] !== 'http://www.omg.org/spec/BPMN/20100524/MODEL' ||
      root.attrs['xmlns:bpmndi'] !== 'http://www.omg.org/spec/BPMN/20100524/DI') {
    throw new Error('Expected BPMN 2.0 definitions and BPMN-DI namespaces');
  }
  const items = all(root);
  const byId = new Map();
  for (const item of items) {
    if (!item.attrs.id) continue;
    if (byId.has(item.attrs.id)) throw new Error('Duplicate BPMN ID: ' + item.attrs.id);
    byId.set(item.attrs.id, item);
  }
  const process = first(root, 'bpmn:process');
  const plane = items.find(x => x.tag === 'bpmndi:BPMNPlane');
  if (!process || !plane || plane.attrs.bpmnElement !== process.attrs.id) {
    throw new Error('Missing process or matching BPMN-DI plane');
  }
  const shapes = new Map(), edges = new Map();
  for (const item of plane.children) {
    const id = item.attrs.bpmnElement;
    if (!byId.has(id)) throw new Error('DI references missing element: ' + id);
    if (item.tag === 'bpmndi:BPMNShape') shapes.set(id, bounds(item));
    if (item.tag === 'bpmndi:BPMNEdge') {
      const points = children(item, 'di:waypoint').map(w => [Number(w.attrs.x), Number(w.attrs.y)]);
      if (points.length < 2 || points.flat().some(x => !Number.isFinite(x))) {
        throw new Error('Invalid BPMN-DI edge: ' + id);
      }
      edges.set(id, points);
    }
  }
  const flows = children(process, 'bpmn:sequenceFlow');
  for (const flow of flows) {
    if (!byId.has(flow.attrs.sourceRef) || !byId.has(flow.attrs.targetRef) || !edges.has(flow.attrs.id)) {
      throw new Error('Broken BPMN sequence flow: ' + flow.attrs.id);
    }
  }
  const extents = [...shapes.values()];
  if (!extents.length) throw new Error('No BPMN-DI shapes');
  const width = Math.max(...extents.map(([x, , w]) => x + w)) + 40;
  const height = Math.max(...extents.map(([, y, , h]) => y + h)) + 35;
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(process.attrs.name || 'BPMN process')}">`,
    '<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#334155"/></marker></defs>',
    '<rect width="100%" height="100%" fill="white"/>',
    `<text x="24" y="36" font-family="Arial,sans-serif" font-size="22" font-weight="700" fill="#0f172a">${esc(process.attrs.name)}</text>`,
  ];
  for (const lane of all(process).filter(x => x.tag === 'bpmn:lane')) {
    const b = shapes.get(lane.attrs.id);
    if (!b) throw new Error('Lane has no shape: ' + lane.attrs.id);
    const [x, y, w, h] = b;
    svg.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#f8fafc" stroke="#94a3b8"/>`);
    svg.push(`<text x="${x + 14}" y="${y + 25}" font-family="Arial,sans-serif" font-size="14" font-weight="700" fill="#334155">${esc(lane.attrs.name)}</text>`);
    svg.push(`<line x1="${x + 120}" y1="${y}" x2="${x + 120}" y2="${y + h}" stroke="#94a3b8"/>`);
  }
  for (const flow of flows) {
    const points = edges.get(flow.attrs.id);
    svg.push(`<polyline points="${points.map(p => p.join(',')).join(' ')}" fill="none" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/>`);
    if (flow.attrs.name) {
      const [x, y] = points[0];
      svg.push(`<text x="${x + 8}" y="${y - 9}" font-family="Arial,sans-serif" font-size="12" fill="#334155">${esc(flow.attrs.name)}</text>`);
    }
  }
  for (const node of process.children) {
    const b = shapes.get(node.attrs.id);
    if (!b || node.tag === 'bpmn:laneSet' || node.tag === 'bpmn:sequenceFlow') continue;
    const [x, y, w, h] = b;
    const kind = node.tag.split(':').at(-1);
    if (kind === 'exclusiveGateway') {
      svg.push(`<polygon points="${x + w/2},${y} ${x + w},${y + h/2} ${x + w/2},${y + h} ${x},${y + h/2}" fill="#fff7ed" stroke="#b45309" stroke-width="2"/>`);
      svg.push(`<text x="${x + w/2}" y="${y + h/2 + 7}" text-anchor="middle" font-size="22" font-family="Arial,sans-serif" fill="#92400e">×</text>`);
    } else if (kind === 'startEvent' || kind === 'endEvent') {
      svg.push(`<circle cx="${x + w/2}" cy="${y + h/2}" r="${w/2}" fill="#eff6ff" stroke="#2563eb" stroke-width="${kind === 'endEvent' ? 3 : 2}"/>`);
    } else {
      svg.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>`);
    }
    const label = node.attrs.name || '';
    if (['startEvent', 'endEvent', 'exclusiveGateway'].includes(kind)) {
      svg.push(`<text x="${x + w/2}" y="${y + h + 18}" text-anchor="middle" font-size="12" font-family="Arial,sans-serif" fill="#0f172a">${esc(label)}</text>`);
    } else {
      const lines = textLines(label);
      lines.forEach((line, i) => {
        const ty = y + h/2 - (lines.length - 1)*8 + i*16 + 5;
        svg.push(`<text x="${x + w/2}" y="${ty}" text-anchor="middle" font-size="12" font-family="Arial,sans-serif" fill="#0f172a">${esc(line)}</text>`);
      });
    }
  }
  svg.push('</svg>');
  const output = file.replace(/\.bpmn$/i, '.svg');
  fs.writeFileSync(output, svg.join('\n') + '\n');
  console.log(`${path.relative(ROOT, file)} -> ${path.relative(ROOT, output)}`);
}
function renderPlantUml(files) {
  if (!files.length) return;
  const env = { ...process.env, JAVA_TOOL_OPTIONS: '-Djava.awt.headless=true ' + (process.env.JAVA_TOOL_OPTIONS || '') };
  const probe = spawnSync('plantuml', ['-version'], { encoding: 'utf8', env });
  if (probe.error || probe.status !== 0) throw new Error('PlantUML CLI is unavailable');
  for (const file of files) {
    const output = file.replace(/\.puml$/i, '.svg');
    const result = spawnSync('plantuml', ['-tsvg', '-nometadata', '-o', path.dirname(file), file], { encoding: 'utf8', env });
    if (result.status !== 0 || !fs.existsSync(output)) {
      throw new Error(`PlantUML failed for ${file}: ${result.stderr || result.stdout || result.error}`);
    }
    console.log(`${path.relative(ROOT, file)} -> ${path.relative(ROOT, output)}`);
  }
}
function main() {
  const args = process.argv.slice(2);
  const files = args.length ? args.map(p => path.resolve(process.cwd(), p)) : findSources(ROOT);
  const puml = files.filter(x => /\.puml$/i.test(x));
  const bpmn = files.filter(x => /\.bpmn$/i.test(x));
  renderPlantUml(puml);
  bpmn.forEach(renderBpmn);
  console.log(`Generated ${puml.length} PlantUML and ${bpmn.length} BPMN SVG diagrams`);
}
try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
