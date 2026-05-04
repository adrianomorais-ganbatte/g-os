#!/usr/bin/env node
/**
 * check-plan.js — barreira deterministica de criacao de plano.
 *
 * Roda como ULTIMA acao obrigatoria do *plan (apos plan-blueprint +
 * plan-to-tasks). Valida que o plano e usavel pelo *execute-plan e
 * *validate-plan. Falha = *plan nao terminou — usuario ve erro, nao
 * "plano criado" ilusorio.
 *
 * Uso:
 *   node check-plan.js <plan-dir>
 *
 * Verificacoes:
 * 1. plan.md existe e tem frontmatter YAML.
 * 2. context.md existe.
 * 3. tasks/ existe e contem >= 1 T-NN*.md.
 * 4. Cada T-NN*.md: head -1 == "---" E frontmatter contem `status: pendente`
 *    E `id:`, `plan_id:`, `seq:`, `title:`.
 * 5. Nenhum T-NN*.md tem secao `## Status` no body (formato bugado legado).
 *
 * Exit code:
 *   0 = plano valido, usavel pelo pipeline
 *   1 = falha — mensagem aponta exatamente o que esta errado
 */

const fs = require('node:fs');
const path = require('node:path');

const planDir = process.argv[2];

if (!planDir) {
  console.error('uso: check-plan.js <plan-dir>');
  process.exit(1);
}

if (!fs.existsSync(planDir)) {
  console.error(`[check-plan] FALHA: plan-dir nao existe: ${planDir}`);
  process.exit(1);
}

const errors = [];
const warnings = [];

const planFile = path.join(planDir, 'plan.md');
const contextFile = path.join(planDir, 'context.md');
const tasksDir = path.join(planDir, 'tasks');

if (!fs.existsSync(planFile)) {
  errors.push(`plan.md ausente em ${planDir}`);
} else {
  const plan = fs.readFileSync(planFile, 'utf8');
  if (!plan.startsWith('---\n')) {
    errors.push(`plan.md sem frontmatter YAML (head -1 != "---")`);
  }
}

if (!fs.existsSync(contextFile)) {
  warnings.push(`context.md ausente — recomendado, nao bloqueia`);
}

if (!fs.existsSync(tasksDir)) {
  errors.push(`tasks/ ausente em ${planDir} — *plan deve invocar plan-to-tasks`);
} else {
  const taskFiles = fs.readdirSync(tasksDir)
    .filter((f) => /^T-\d+.*\.md$/.test(f))
    .map((f) => path.join(tasksDir, f));

  if (taskFiles.length === 0) {
    errors.push(`tasks/ vazio — nenhum T-NN*.md encontrado`);
  }

  for (const file of taskFiles) {
    const rel = path.relative(planDir, file);
    const raw = fs.readFileSync(file, 'utf8');

    if (!raw.startsWith('---\n')) {
      errors.push(`${rel}: sem frontmatter YAML (head -1 != "---")`);
      continue;
    }

    const fmEnd = raw.indexOf('\n---', 4);
    if (fmEnd === -1) {
      errors.push(`${rel}: frontmatter aberto sem fechar ("---" final ausente)`);
      continue;
    }
    const frontmatter = raw.slice(4, fmEnd);
    const body = raw.slice(fmEnd + 4);

    const required = ['id', 'plan_id', 'seq', 'title', 'status'];
    for (const key of required) {
      if (!new RegExp(`^${key}:\\s*\\S`, 'm').test(frontmatter)) {
        errors.push(`${rel}: frontmatter sem campo \`${key}:\``);
      }
    }

    if (!/^status:\s*pendente\s*$/m.test(frontmatter)) {
      errors.push(`${rel}: frontmatter status: deve ser exatamente "pendente" no plano recem-criado`);
    }

    if (/^## Status\s*$/m.test(body)) {
      errors.push(`${rel}: contem secao "## Status" no body (formato legado bugado) — rodar migrate-task-status.js`);
    }
  }
}

if (warnings.length) {
  for (const w of warnings) console.error(`[check-plan] aviso: ${w}`);
}

if (errors.length) {
  console.error(`\n[check-plan] FALHA — plano NAO usavel pelo *execute-plan:\n`);
  for (const e of errors) console.error(`  - ${e}`);
  console.error(`\nproximo passo: regerar tasks via plan-to-tasks OU rodar migrate-task-status.js ${planDir}`);
  process.exit(1);
}

const taskCount = fs.readdirSync(tasksDir)
  .filter((f) => /^T-\d+.*\.md$/.test(f)).length;
console.log(`[check-plan] OK — ${planDir}: plan.md + context.md + ${taskCount} tasks (todas com frontmatter status: pendente).`);
process.exit(0);
