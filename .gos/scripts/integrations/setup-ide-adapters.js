#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content.replace(/\r?\n/g, '\n') + '\n');
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function relativeTarget(fromFile, targetFile) {
  return path.relative(path.dirname(fromFile), targetFile).replace(/\\/g, '/');
}

function agentSlug(id) {
  return id.startsWith('gos-') ? id : `gos-${id}`;
}

// IDEs alvo do G-OS (adapters gerados para estas).
// Claude Code, Codex, Qwen, Opencode, Gemini CLI, Antigravity (.agent).
const TARGET_IDES = ['.claude', '.codex', '.qwen', '.opencode', '.gemini', '.agent'];
// Entrypoints user-facing (slash/workflow). O master roteia o resto internamente (item 10).
const CMD_WHITELIST = new Set(['gos-master', 'ux-design-expert']);

function removeGosPrefixed(dir) {
  // Remove apenas entradas G-OS (prefixo gos-), preservando skills/agents/workflows
  // proprios do usuario que coexistem no mesmo diretorio (contrato do prefixo gos-).
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    if (/^gos-/.test(entry)) {
      fs.rmSync(path.join(dir, entry), { recursive: true, force: true });
    }
  }
}

function cleanupStaleAdapters() {
  for (const ide of TARGET_IDES) {
    removeGosPrefixed(path.join(root, ide, 'skills'));   // gos-<slug>/
    removeGosPrefixed(path.join(root, ide, 'agents'));   // gos-<id>.md
    // Commands sao namespaced sob gos/ — seguro remover o namespace inteiro.
    const cmdGos = path.join(root, ide, 'commands', 'gos');
    if (fs.existsSync(cmdGos)) fs.rmSync(cmdGos, { recursive: true, force: true });
  }
  // Antigravity: workflows dos entrypoints (gos-*) — limpar apenas os do G-OS.
  removeGosPrefixed(path.join(root, '.agent', 'workflows'));
  // .antigravity/ e o diretorio errado (Antigravity usa .agent/) — remover legado.
  const legacyAntigravity = path.join(root, '.antigravity');
  if (fs.existsSync(legacyAntigravity)) fs.rmSync(legacyAntigravity, { recursive: true, force: true });
}

function agentWrapper(agentId, target) {
  return `# ${agentId}\n\nFonte canonica: \`${target}\`\n\nLeia e siga o perfil em \`${target}\`.\nEste arquivo existe apenas como adapter fino para a IDE.`;
}

function skillWrapper(slug, target, description) {
  const fullSlug = slug.startsWith('gos-') ? slug : `gos-${slug}`;
  const body = `# ${fullSlug}\n\nFonte canonica: \`${target}\`\n\nLeia e siga a skill em \`${target}\`.\nEste arquivo existe apenas como adapter fino para a IDE.`;
  if (!description) return body;
  const desc = String(description).replace(/"/g, '\\"').replace(/\n/g, ' ').slice(0, 200);
  return `---\nname: "${fullSlug}"\ndescription: "${desc}"\n---\n\n${body}`;
}

function qwenCommandWrapper(name, description, target) {
  const desc = (description || name).replace(/"/g, '\\"').replace(/\n/g, ' ').slice(0, 200);
  return `---\ndescription: "${desc}"\n---\n\n# ${name} (Qwen Command Adapter)\n\n> Adapter para Qwen Code. Fonte canonica: \`${target}\`.\n\nCANONICAL-SOURCE: ${target}\n\n## Adapter Contract\n\n1. Leia o arquivo canonico em **CANONICAL-SOURCE** por completo.\n2. Execute as instrucoes desse arquivo como fonte primaria.\n3. Argumentos do usuario: {{args}}`;
}

function claudeCommandWrapper(name, description, target, argumentHint, ideLabel) {
  const desc = (description || name).replace(/"/g, '\\"').replace(/\n/g, ' ').slice(0, 200);
  const hint = argumentHint ? `\nargument-hint: "${argumentHint.replace(/"/g, '\\"')}"` : '\nargument-hint: "[argumentos opcionais]"';
  const label = ideLabel || 'Claude';
  return `---\ndescription: "${desc}"${hint}\n---\n\n# ${name} (${label} Adapter)\n\n> Adapter fino para ${label}. Fonte canonica: \`${target}\`.\n\nCANONICAL-SOURCE: ${target}\n\n## Adapter Contract\n\n1. Leia o arquivo canonico indicado em **CANONICAL-SOURCE** por completo.\n2. Execute as instrucoes desse arquivo como fonte primaria.\n3. Argumentos do usuario: $ARGUMENTS`;
}

function extractAgentDescription(filePath) {
  if (!fs.existsSync(filePath)) return '';
  const content = fs.readFileSync(filePath, 'utf8');
  const topBlock = content.split(/\n\s+persona:/)[0];
  for (const field of ['role', 'title', 'description']) {
    const re = new RegExp(`^\\s{2,4}${field}:\\s*(.+)`, 'm');
    const match = topBlock.match(re);
    if (match) return match[1].trim().replace(/^['"]|['"]$/g, '');
  }
  const useForMatch = content.match(/Use para:\s*\n+\s*-\s*(.+)/);
  if (useForMatch) return `Agent para ${useForMatch[1].trim()}`;
  return '';
}

function parseFrontmatter(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm = {};
  const lines = match[1].split('\n');
  for (let i = 0; i < lines.length; i++) {
    const kv = lines[i].match(/^(\w[\w-]*):\s*(.*)/);
    if (!kv) continue;
    let val = kv[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val === '>' || val === '|' || val === '>-' || val === '|-') {
      const parts = [];
      while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1])) {
        parts.push(lines[++i].trim());
      }
      val = parts.join(' ');
    }
    fm[kv[1]] = val;
  }
  return fm;
}

function main() {
  const agents = readJson(path.join(root, '.gos', 'agents', 'profiles', 'index.json')).profiles;
  const skills = readJson(path.join(root, '.gos', 'skills', 'registry.json')).skills;

  cleanupStaleAdapters();

  for (const agent of agents) {
    const agentProfilePath = path.join(root, '.gos', 'agents', 'profiles', agent.path);
    const agentDesc = extractAgentDescription(agentProfilePath) || `${agent.id} agent`;
    const aSlug = agentSlug(agent.id);
    const safeDesc = agentDesc.replace(/"/g, '\\"').replace(/\n/g, ' ').slice(0, 200);
    const isEntrypoint = CMD_WHITELIST.has(agent.id);

    // Subagents (delegacao interna do master) — para TODOS os agents.
    const qwenAgent = path.join(root, '.qwen', 'agents', `${aSlug}.md`);
    const qwenAgentTarget = relativeTarget(qwenAgent, agentProfilePath);
    writeFile(qwenAgent, `---\nname: "${aSlug}"\ndescription: "${safeDesc}"\nmodel: inherit\ntools:\n  - Read\n  - Glob\n  - Grep\n  - Bash\n  - Edit\n  - Write\n---\n\nFonte canonica: \`${qwenAgentTarget}\`\nLeia e siga o perfil em \`${qwenAgentTarget}\`.`);

    const codexAgent = path.join(root, '.codex', 'agents', `${aSlug}.md`);
    const codexAgentTarget = relativeTarget(codexAgent, agentProfilePath);
    writeFile(codexAgent, `---\nname: "${aSlug}"\ndescription: "${safeDesc}"\nmodel: inherit\ntools:\n  - Read\n  - Glob\n  - Grep\n  - Bash\n  - Edit\n  - Write\n---\n\nFonte canonica: \`${codexAgentTarget}\`\nLeia e siga o perfil em \`${codexAgentTarget}\`.`);

    // Slash commands / picker (user-facing) — APENAS entrypoints (item 10).
    if (!isEntrypoint) continue;

    const claudeFile = path.join(root, '.claude', 'commands', 'gos', 'agents', `${agent.id}.md`);
    writeFile(claudeFile, claudeCommandWrapper(aSlug, agentDesc, relativeTarget(claudeFile, agentProfilePath), '', 'Claude'));

    const qwenCmd = path.join(root, '.qwen', 'commands', 'gos', 'agents', `${agent.id}.md`);
    writeFile(qwenCmd, qwenCommandWrapper(aSlug, agentDesc, relativeTarget(qwenCmd, agentProfilePath)));

    const codexCmd = path.join(root, '.codex', 'commands', 'gos', 'agents', `${agent.id}.md`);
    writeFile(codexCmd, claudeCommandWrapper(aSlug, agentDesc, relativeTarget(codexCmd, agentProfilePath), '', 'Codex'));

    // Codex/Opencode/Gemini/Antigravity populam o picker a partir de <ide>/skills/<slug>/SKILL.md.
    // Emitir o entrypoint tambem como skill garante que aparece no picker de cada uma.
    for (const ide of ['.codex', '.opencode', '.gemini', '.agent']) {
      const ideAgentSkill = path.join(root, ide, 'skills', aSlug, 'SKILL.md');
      writeFile(ideAgentSkill, skillWrapper(agent.id, relativeTarget(ideAgentSkill, agentProfilePath), agentDesc));
    }

    // Antigravity: workflow (slash command no picker) — nome prefixado gos- p/ coexistencia.
    const antigravityWorkflow = path.join(root, '.agent', 'workflows', `${aSlug}.md`);
    const workflowTarget = relativeTarget(antigravityWorkflow, agentProfilePath);
    writeFile(
      antigravityWorkflow,
      `---\ndescription: "${safeDesc}"\n---\n\n# /${aSlug} (Antigravity Workflow)\n\nFonte canonica: \`${workflowTarget}\`\n\nLeia o arquivo canonico apontado em CANONICAL-SOURCE e execute as instrucoes como fonte primaria.\n\nCANONICAL-SOURCE: ${workflowTarget}\n\nArgumentos do usuario seguem o prompt do agente.`
    );
  }

  // Skills: auto-discoveraveis (o master as invoca internamente), NAO slash commands.
  for (const skill of skills) {
    const skillTargetPath = skill.skillFile || skill.path;
    const canonicalPath = path.join(root, '.gos', skillTargetPath);
    const skillFm = parseFrontmatter(canonicalPath);
    const skillDesc = skillFm.description || skill.description || skill.name || skill.slug;

    for (const ide of TARGET_IDES) {
      const t = path.join(root, ide, 'skills', `gos-${skill.slug}`, 'SKILL.md');
      writeFile(t, skillWrapper(skill.slug, relativeTarget(t, canonicalPath), skillDesc));
    }
  }

  // Antigravity le AGENTS.md no root do workspace (ja existe no projeto).
  // Skills vivem em .agent/skills/<slug>/SKILL.md (workspace scope, registrado acima no loop).
  // Workflows (.agent/workflows/<id>.md) sao slash commands no picker da IDE.
  // Rules opcionais em .agent/rules/ — nao geramos automaticamente (regras vivem no AGENTS.md).

  // Codex IDE Extension — AGENTS.md + config.toml
  // Codex e o ambiente de EXECUCAO (Opus planeja, Codex executa). Bloco abaixo garante
  // que slash commands e subagents estao disponiveis ao abrir o projeto no Codex.
  const codexAgentsMd = [
    '# G-OS no Codex IDE Extension',
    '',
    'Este arquivo e auto-gerado por `npm run sync:ides`. Nao edite a mao.',
    '',
    'Codex IDE Extension e o ambiente de EXECUCAO do G-OS. Opus 4.7 planeja em outra IDE/sessao;',
    'Codex executa task-a-task com `*execute-plan`.',
    '',
    'Leia sempre:',
    '- `../AGENTS.md` (raiz do projeto)',
    '- `../CLAUDE.md`',
    '- `../.gos/docs/toolchain-map.md`',
    '',
    '## Execucao de planos (comando primario do Codex)',
    '',
    '```',
    '*execute-plan PLAN-NNN-<slug>',
    '```',
    '',
    'Ciclo: pre-flight visual -> loop por task com state machine -> visual gate -> validacao -> humano marca concluido.',
    'Detalhes: `../.gos/skills/execute-plan/SKILL.md`.',
    '',
    '## Entrypoints (slash commands user-facing)',
    '',
    'Apenas 2 comandos: o master roteia o resto internamente (skills, subagents, squads).',
    '',
    ...agents.filter((a) => CMD_WHITELIST.has(a.id)).map((agent) => `- \`/gos:agents:${agent.id}\` -> \`../.gos/agents/profiles/${agent.path}\``),
    '',
    '## Subagents (delegacao interna do master)',
    '',
    ...agents.map((agent) => `- \`gos-${agent.id}\` -> \`../.gos/agents/profiles/${agent.path}\``),
    '',
    '## Skills curadas (auto-discoveraveis, invocadas pelo master)',
    '',
    '| Slug | Arquivo canonico |',
    '|------|------------------|',
    ...skills.map((skill) => `| \`gos-${skill.slug}\` | \`../.gos/${skill.skillFile || skill.path}\` |`),
    '',
    '## Como o Codex consome',
    '',
    '- Slash commands (`.codex/commands/gos/agents/`) apenas para os 2 entrypoints. O `gos-master` analisa o input e decide quais skills, agents, subagents e squads acionar.',
    '- Subagents em `.codex/agents/gos-<id>.md` -> delegacao interna (Task tool).',
    '- Skills em `.codex/skills/gos-<slug>/SKILL.md` -> auto-discoveraveis; o master as invoca, o usuario nao digita.',
    '- Para comecar, digite `/gos:agents:gos-master` no picker.',
    ''
  ].join('\n');
  writeFile(path.join(root, '.codex', 'AGENTS.md'), codexAgentsMd);

  const codexConfigToml = [
    '# G-OS Codex IDE Extension config (auto-gerado por npm run sync:ides).',
    '# Edite os arquivos canonicos em .gos/ ao inves deste.',
    '',
    'project = "g-os"',
    'instructions = "AGENTS.md"',
    '',
    '[execution]',
    'primary_command = "*execute-plan"',
    'planning_command = "*plan"',
    'progress_command = "*progress"',
    'stack_command = "*stack"',
    ''
  ].join('\n');
  writeFile(path.join(root, '.codex', 'config.toml'), codexConfigToml);

  // Validacao final: garantir que os arquivos do Codex foram gerados.
  // Evita regressoes silenciosas que ja quebraram a IDE no passado.
  const codexFailures = [];
  for (const agent of agents) {
    // Subagent (delegacao) para TODOS os agents.
    const expectedAgent = path.join(root, '.codex', 'agents', `${agentSlug(agent.id)}.md`);
    if (!fs.existsSync(expectedAgent)) codexFailures.push(expectedAgent);
    // Slash command apenas para entrypoints.
    if (CMD_WHITELIST.has(agent.id)) {
      const expectedCmd = path.join(root, '.codex', 'commands', 'gos', 'agents', `${agent.id}.md`);
      if (!fs.existsSync(expectedCmd)) codexFailures.push(expectedCmd);
    }
  }
  for (const skill of skills) {
    const expectedSkill = path.join(root, '.codex', 'skills', `gos-${skill.slug}`, 'SKILL.md');
    if (!fs.existsSync(expectedSkill)) codexFailures.push(expectedSkill);
  }
  if (!fs.existsSync(path.join(root, '.codex', 'AGENTS.md'))) codexFailures.push('.codex/AGENTS.md');
  if (!fs.existsSync(path.join(root, '.codex', 'config.toml'))) codexFailures.push('.codex/config.toml');
  if (codexFailures.length > 0) {
    console.error(`[sync:ides] Codex IDE adapters incompletos. Faltando ${codexFailures.length} arquivos:`);
    for (const f of codexFailures) console.error(`  - ${path.relative(root, f)}`);
    process.exit(1);
  }

  const entrypoints = agents.filter((a) => CMD_WHITELIST.has(a.id)).length;
  console.log(`Adapters gerados: ${entrypoints} entrypoints (slash), ${agents.length} subagents, ${skills.length} skills.`);
  console.log(`IDEs alvo: ${TARGET_IDES.join(', ')}.`);
}

main();
