#!/usr/bin/env node
/**
 * migrate-task-status.js
 *
 * Migra task files do formato bugado (`## Status` no body, sem frontmatter)
 * para o formato canonico (frontmatter YAML com `status:`).
 *
 * Origem do bug: plan-to-tasks/SKILL.md tinha template inline obsoleto sem
 * `status:`. Tasks geradas ficavam travadas em `pendente` mesmo apos
 * *execute-plan rodar codigo, porque progress-tracker procura no frontmatter
 * e nao acha. Corrigido em commit subsequente; este script reabilita planos
 * preexistentes.
 *
 * Uso:
 *   node migrate-task-status.js <plan-dir>
 *   node migrate-task-status.js <plan-dir> --infer-from-diff
 */

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const args = process.argv.slice(2);
const planDir = args[0];
const inferFromDiff = args.includes('--infer-from-diff');

if (!planDir || !fs.existsSync(planDir)) {
  console.error('uso: migrate-task-status.js <plan-dir> [--infer-from-diff]');
  process.exit(1);
}

const tasksDir = path.join(planDir, 'tasks');
if (!fs.existsSync(tasksDir)) {
  console.error(`tasks dir nao encontrado: ${tasksDir}`);
  process.exit(1);
}

const planFile = path.join(planDir, 'plan.md');
const planSlug = path.basename(planDir);
const planId = planSlug.split('-').slice(0, 2).join('-');

function gitLog(args) {
  try {
    return execFileSync('git', args, { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

const taskFiles = fs.readdirSync(tasksDir)
  .filter((f) => /^T-\d+.*\.md$/.test(f))
  .map((f) => path.join(tasksDir, f));

let migrated = 0;
let skipped = 0;
let failed = 0;

for (const file of taskFiles) {
  const raw = fs.readFileSync(file, 'utf8');

  if (raw.startsWith('---\n')) {
    skipped++;
    continue;
  }

  const titleMatch = raw.match(/^# (T-\d+(?:-\d+)?)[ —-]+(.+?)$/m);
  const statusMatch = raw.match(/^## Status\s*\n+`?(\w[\w-]*)`?/m);

  if (!titleMatch) {
    console.error(`falha: ${file} — sem heading T-NN`);
    failed++;
    continue;
  }

  const taskId = titleMatch[1];
  const title = titleMatch[2].trim();
  const seqRaw = (taskId.match(/T-(\d+)(?:-(\d+))?/) || [])[2] || taskId.split('-')[1];
  const bodyStatus = statusMatch ? statusMatch[1] : 'pendente';

  let finalStatus = bodyStatus;
  if (inferFromDiff && bodyStatus === 'pendente') {
    const addCommit = gitLog(['log', '--diff-filter=A', '--format=%H', '--', planFile]);
    const sinceCommit = addCommit ? addCommit.split('\n').pop() : '';
    if (sinceCommit) {
      const diff = gitLog(['log', `${sinceCommit}..HEAD`, '--name-only', '--pretty=format:']);
      if (diff) finalStatus = 'validacao';
    }
  }

  const bodyWithoutStatus = raw
    .replace(/^## Status\s*\n+`?\w[\w-]*`?\s*\n+/m, '')
    .replace(/^# T-\d+.*?\n+/m, '');

  const frontmatter = `---
id: ${taskId}
plan_id: ${planId}
seq: ${parseInt(seqRaw, 10)}
title: ${title}
area: frontend
labels: [agent:dev]
priority: P1
estimate: "4h"
status: ${finalStatus}
valida_em: ""
depends_on_backend: []
interaction_target: []
override_target: []
assignees: []
links: []
---

# ${taskId} — ${title}

`;

  fs.writeFileSync(file, frontmatter + bodyWithoutStatus);
  migrated++;
  console.log(`migrado: ${path.basename(file)} → status=${finalStatus}`);
}

console.log(`\n[migrate-task-status] ${migrated} migrados | ${skipped} ja-validos | ${failed} falhas`);
process.exit(failed > 0 ? 1 : 0);
