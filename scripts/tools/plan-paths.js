#!/usr/bin/env node
/**
 * plan-paths — resolve caminhos do projeto-cliente para o pipeline de planos.
 * Lê .gos-local/plan-paths.json. Se ausente, cria com defaults e devolve.
 *
 * Uso (CLI):
 *   node plan-paths.js              # imprime config completa
 *   node plan-paths.js get <key>    # imprime path específico
 *   node plan-paths.js init         # cria arquivo com defaults se não existir
 *
 * Uso (módulo):
 *   const { loadPlanPaths, resolvePath } = require('./plan-paths');
 */

const fs = require('fs');
const path = require('path');

const CONFIG_FILE = '.gos-local/plan-paths.json';

const DEFAULTS = {
  schema: 'gos.plan-paths.v1',
  dirs: {
    projeto: 'src/',
    storybook: '.referencia-storybook/',
    design_system_doc: '.referencia-storybook/docs/DESIGN_SYSTEM_REFERENCE.md',
    components: '.referencia-storybook/components/',
    stories: '.referencia-storybook/stories/',
    planos: 'docs/plans/',
    tasks: 'docs/plans/{plan}/tasks/',
    contexto: 'docs/plans/{plan}/context.md',
    progress: 'progress.txt',
    stack: 'docs/stack.md',
    adr: 'docs/adr/',
    postman: null,
    regras_negocio: null,
    api_contracts: null,
    fluxos: null,
  },
  knowledge_sources: [
    { kind: 'design-system', path: '.referencia-storybook/docs/DESIGN_SYSTEM_REFERENCE.md', required: true },
  ],
  naming: { plan_prefix: 'PLAN', task_prefix: 'T', seq_padding: 3 },
  figma: { mcp_enabled: true, default_file_url: null },
};

function findRoot(startDir) {
  let dir = path.resolve(startDir);
  while (true) {
    if (fs.existsSync(path.join(dir, '.gos-local')) || fs.existsSync(path.join(dir, '.gos'))) return dir;
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return path.resolve(startDir);
    dir = parent;
  }
}

function loadPlanPaths(cwd = process.cwd()) {
  const root = findRoot(cwd);
  const file = path.join(root, CONFIG_FILE);
  if (!fs.existsSync(file)) return { root, file, config: null };
  try {
    return { root, file, config: JSON.parse(fs.readFileSync(file, 'utf8')) };
  } catch (err) {
    throw new Error(`plan-paths: invalid JSON em ${file}: ${err.message}`);
  }
}

function initIfMissing(cwd = process.cwd()) {
  const { root, file, config } = loadPlanPaths(cwd);
  if (config) return { root, file, config, created: false };
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(DEFAULTS, null, 2) + '\n', 'utf8');
  return { root, file, config: DEFAULTS, created: true };
}

function resolvePath(key, ctx = {}, cwd = process.cwd()) {
  const { root, config } = loadPlanPaths(cwd);
  if (!config) throw new Error('plan-paths: config ausente. Rode `node plan-paths.js init`.');
  const raw = (config.dirs && config.dirs[key]) ?? null;
  if (raw == null) return null;
  const interpolated = raw.replace(/\{(\w+)\}/g, (_, k) => ctx[k] ?? `{${k}}`);
  return path.resolve(root, interpolated);
}

function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  if (!cmd || cmd === 'show') {
    const { config, file } = loadPlanPaths();
    if (!config) {
      console.error(`plan-paths: ausente em ${file}. Use \`init\`.`);
      process.exit(1);
    }
    console.log(JSON.stringify(config, null, 2));
    return;
  }
  if (cmd === 'init') {
    const { file, created } = initIfMissing();
    console.log(created ? `created: ${file}` : `exists:  ${file}`);
    return;
  }
  if (cmd === 'get') {
    const key = rest[0];
    if (!key) { console.error('uso: get <key> [--ctx plan=PLAN-001]'); process.exit(2); }
    const ctxPair = rest.find(a => a.includes('='));
    const ctx = ctxPair ? Object.fromEntries([ctxPair.split('=')]) : {};
    const p = resolvePath(key, ctx);
    if (p == null) { console.error(`null: ${key}`); process.exit(3); }
    console.log(p);
    return;
  }
  console.error(`uso: plan-paths.js [show|init|get <key>]`);
  process.exit(2);
}

if (require.main === module) main();

module.exports = { loadPlanPaths, initIfMissing, resolvePath, DEFAULTS };
