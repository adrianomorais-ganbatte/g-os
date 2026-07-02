#!/usr/bin/env node
/**
 * model-router — resolve modelo/provider por etapa do pipeline.
 *
 * Regra do framework: Junior executa, Senior audita.
 *   - plan     -> Senior cria plano + tasks + spec
 *   - execute  -> Junior (modelo mais barato adequado) implementa
 *   - validate -> Senior audita e corrige gaps
 *
 * Precedência: .gos-local/models.json (override local, por dev/projeto)
 *              -> .gos/config.json "stageModels" (default versionado).
 *
 * Uso (CLI):
 *   node model-router.js                 # imprime o mapa resolvido das 3 etapas
 *   node model-router.js get <stage>     # imprime JSON da etapa (plan|execute|validate)
 *   node model-router.js model <stage>   # imprime só o model da etapa
 *   node model-router.js init            # cria .gos-local/models.json com os defaults
 *
 * Uso (módulo):
 *   const { resolveStage, resolveAll } = require('./model-router');
 *   const { provider, model, role } = resolveStage('plan');
 */

'use strict';

const fs = require('fs');
const path = require('path');

const STAGES = ['plan', 'execute', 'validate'];
const LOCAL_FILE = '.gos-local/models.json';

// Fallback embutido — usado se config.json não tiver stageModels (ex.: instalação antiga).
const HARD_DEFAULTS = {
  plan: { provider: 'anthropic', model: 'claude-opus-4-8', role: 'senior' },
  execute: {
    provider: 'any',
    model: 'claude-sonnet-5',
    role: 'junior',
    allow: ['claude-sonnet-5', 'codex', 'claude-haiku-4-5', 'cheapest-capable'],
  },
  validate: { provider: 'anthropic', model: 'claude-opus-4-8', role: 'senior' },
};

function findRoot(start) {
  let dir = start || process.cwd();
  for (let i = 0; i < 8; i++) {
    if (fs.existsSync(path.join(dir, '.gos', 'config.json'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function defaultsFromConfig(root) {
  const cfg = readJson(path.join(root, '.gos', 'config.json'));
  const sm = cfg && cfg.stageModels;
  if (!sm) return { ...HARD_DEFAULTS };
  const out = {};
  for (const stage of STAGES) out[stage] = sm[stage] || HARD_DEFAULTS[stage];
  return out;
}

function resolveAll(root) {
  root = root || findRoot();
  const base = defaultsFromConfig(root);
  const local = readJson(path.join(root, LOCAL_FILE));
  const overrides = local && local.stageModels ? local.stageModels : {};
  const out = {};
  for (const stage of STAGES) {
    out[stage] = { ...base[stage], ...(overrides[stage] || {}) };
  }
  return out;
}

function resolveStage(stage, root) {
  if (!STAGES.includes(stage)) {
    throw new Error(`Etapa desconhecida: ${stage}. Use: ${STAGES.join(', ')}`);
  }
  return resolveAll(root)[stage];
}

function writeLocalDefaults(root) {
  root = root || findRoot();
  const target = path.join(root, LOCAL_FILE);
  if (fs.existsSync(target)) return { created: false, path: target };
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const payload = {
    schema: 'gos.models.v1',
    stageModels: defaultsFromConfig(root),
  };
  fs.writeFileSync(target, JSON.stringify(payload, null, 2) + '\n');
  return { created: true, path: target };
}

module.exports = { STAGES, resolveStage, resolveAll, writeLocalDefaults };

// --- CLI ---------------------------------------------------------------------
if (require.main === module) {
  const [cmd, arg] = process.argv.slice(2);
  const root = findRoot();
  if (cmd === 'get') {
    process.stdout.write(JSON.stringify(resolveStage(arg, root), null, 2) + '\n');
  } else if (cmd === 'model') {
    process.stdout.write((resolveStage(arg, root).model || '') + '\n');
  } else if (cmd === 'init') {
    const r = writeLocalDefaults(root);
    process.stdout.write(
      (r.created ? 'Criado: ' : 'Ja existe: ') + r.path + '\n'
    );
  } else {
    process.stdout.write(JSON.stringify(resolveAll(root), null, 2) + '\n');
  }
}
