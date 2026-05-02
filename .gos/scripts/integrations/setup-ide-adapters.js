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

function agentWrapper(agentId, target) {
  return `# ${agentId}\n\nFonte canonica: \`${target}\`\n\nLeia e siga o perfil em \`${target}\`.\nEste arquivo existe apenas como adapter fino para a IDE.`;
}

function skillWrapper(slug, target, description) {
  const body = `# gos-${slug}\n\nFonte canonica: \`${target}\`\n\nLeia e siga a skill em \`${target}\`.\nEste arquivo existe apenas como adapter fino para a IDE.`;
  if (!description) return body;
  const desc = String(description).replace(/"/g, '\\"').replace(/\n/g, ' ').slice(0, 200);
  return `---\nname: "gos-${slug}"\ndescription: "${desc}"\n---\n\n${body}`;
}

function qwenCommandWrapper(name, description, target) {
  const desc = (description || name).replace(/"/g, '\\"').replace(/\n/g, ' ').slice(0, 200);
  return `---\ndescription: "${desc}"\n---\n\n# ${name} (Qwen Command Adapter)\n\n> Adapter para Qwen Code. Fonte canonica: \`${target}\`.\n\nCANONICAL-SOURCE: ${target}\n\n## Adapter Contract\n\n1. Leia o arquivo canonico em **CANONICAL-SOURCE** por completo.\n2. Execute as instrucoes desse arquivo como fonte primaria.\n3. Argumentos do usuario: {{args}}`;
}

function claudeCommandWrapper(name, description, target, argumentHint) {
  const desc = (description || name).replace(/"/g, '\\"').replace(/\n/g, ' ').slice(0, 200);
  const hint = argumentHint ? `\nargument-hint: "${argumentHint.replace(/"/g, '\\"')}"` : '\nargument-hint: "[argumentos opcionais]"';
  return `---\ndescription: "${desc}"${hint}\n---\n\n# ${name} (Claude Adapter)\n\n> Adapter fino para Claude. Fonte canonica: \`${target}\`.\n\nCANONICAL-SOURCE: ${target}\n\n## Adapter Contract\n\n1. Leia o arquivo canonico indicado em **CANONICAL-SOURCE** por completo.\n2. Execute as instrucoes desse arquivo como fonte primaria.\n3. Argumentos do usuario: $ARGUMENTS`;
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

  for (const agent of agents) {
    const agentProfilePath = path.join(root, '.gos', 'agents', 'profiles', agent.path);
    const agentDesc = extractAgentDescription(agentProfilePath) || `${agent.id} agent`;

    // Claude commands (requires YAML frontmatter with description)
    const claudeFile = path.join(root, '.claude', 'commands', 'gos', 'agents', `${agent.id}.md`);
    writeFile(claudeFile, claudeCommandWrapper(`gos-${agent.id}`, agentDesc, relativeTarget(claudeFile, agentProfilePath)));

    // Qwen commands (requires YAML frontmatter with description)
    const qwenCmd = path.join(root, '.qwen', 'commands', 'gos', 'agents', `${agent.id}.md`);
    writeFile(qwenCmd, qwenCommandWrapper(`gos-${agent.id}`, agentDesc, relativeTarget(qwenCmd, agentProfilePath)));

    // Qwen sub-agents
    const qwenAgent = path.join(root, '.qwen', 'agents', `gos-${agent.id}.md`);
    const agentTarget = relativeTarget(qwenAgent, agentProfilePath);
    const safeDesc = agentDesc.replace(/"/g, '\\"').replace(/\n/g, ' ').slice(0, 200);
    writeFile(qwenAgent, `---\nname: "gos-${agent.id}"\ndescription: "${safeDesc}"\nmodel: inherit\ntools:\n  - Read\n  - Glob\n  - Grep\n  - Bash\n  - Edit\n  - Write\n---\n\nFonte canonica: \`${agentTarget}\`\nLeia e siga o perfil em \`${agentTarget}\`.`);

    // Codex commands (slash commands no Codex IDE Extension)
    const codexCmd = path.join(root, '.codex', 'commands', 'gos', 'agents', `${agent.id}.md`);
    writeFile(codexCmd, claudeCommandWrapper(`gos-${agent.id}`, agentDesc, relativeTarget(codexCmd, agentProfilePath)));

    // Codex sub-agents (Codex IDE espera .codex/agents/<id>.md)
    const codexAgent = path.join(root, '.codex', 'agents', `gos-${agent.id}.md`);
    const codexAgentTarget = relativeTarget(codexAgent, agentProfilePath);
    writeFile(codexAgent, `---\nname: "gos-${agent.id}"\ndescription: "${safeDesc}"\nmodel: inherit\ntools:\n  - Read\n  - Glob\n  - Grep\n  - Bash\n  - Edit\n  - Write\n---\n\nFonte canonica: \`${codexAgentTarget}\`\nLeia e siga o perfil em \`${codexAgentTarget}\`.`);
  }

  for (const skill of skills) {
    const skillTargetPath = skill.skillFile || skill.path;
    const canonicalPath = path.join(root, '.gos', skillTargetPath);
    const claudeSkill = path.join(root, '.claude', 'commands', 'gos', 'skills', `${skill.slug}.md`);
    const codexSkill = path.join(root, '.codex', 'skills', `gos-${skill.slug}`, 'SKILL.md');
    const codexSkillCmd = path.join(root, '.codex', 'commands', 'gos', 'skills', `${skill.slug}.md`);
    const antigravitySkill = path.join(root, '.antigravity', 'skills', `gos-${skill.slug}`, 'SKILL.md');
    const geminiSkill = path.join(root, '.gemini', 'skills', `gos-${skill.slug}`, 'SKILL.md');
    const opencodeSkill = path.join(root, '.opencode', 'skills', `gos-${skill.slug}`, 'SKILL.md');
    const qwenSkill = path.join(root, '.qwen', 'skills', `gos-${skill.slug}`, 'SKILL.md');

    const qwenCmd = path.join(root, '.qwen', 'commands', 'gos', 'skills', `${skill.slug}.md`);

    const skillFm = parseFrontmatter(canonicalPath);
    const skillDesc = skillFm.description || skill.description || skill.name || skill.slug;
    const skillArgHint = skillFm['argument-hint'] || '';

    writeFile(claudeSkill, skillWrapper(skill.slug, relativeTarget(claudeSkill, canonicalPath), skillDesc));
    writeFile(codexSkill, skillWrapper(skill.slug, relativeTarget(codexSkill, canonicalPath), skillDesc));
    writeFile(antigravitySkill, skillWrapper(skill.slug, relativeTarget(antigravitySkill, canonicalPath), skillDesc));
    writeFile(geminiSkill, skillWrapper(skill.slug, relativeTarget(geminiSkill, canonicalPath), skillDesc));
    writeFile(opencodeSkill, skillWrapper(skill.slug, relativeTarget(opencodeSkill, canonicalPath), skillDesc));
    writeFile(qwenSkill, skillWrapper(skill.slug, relativeTarget(qwenSkill, canonicalPath), skillDesc));

    writeFile(qwenCmd, qwenCommandWrapper(`gos-${skill.slug}`, skillDesc, relativeTarget(qwenCmd, canonicalPath)));
    writeFile(codexSkillCmd, claudeCommandWrapper(`gos-${skill.slug}`, skillDesc, relativeTarget(codexSkillCmd, canonicalPath), skillArgHint));
    writeFile(claudeSkill, claudeCommandWrapper(`gos-${skill.slug}`, skillDesc, relativeTarget(claudeSkill, canonicalPath), skillArgHint));
  }

  const antigravityInstructions = [
    '# G-OS Antigravity Instructions',
    '',
    'Leia sempre:',
    '- `AGENTS.md`',
    '- `CLAUDE.md`',
    '- `.gos/docs/toolchain-map.md`',
    '',
    'Agentes disponiveis:',
    ...agents.map((agent) => `- ${agent.id}`),
    '',
    'Skills curadas:',
    ...skills.map((skill) => `- ${skill.slug}`),
    '',
    '## Como invocar Skills',
    '',
    'Para usar uma skill, leia o arquivo canonico e siga suas instrucoes.',
    'Skills tambem disponiveis como adapters em `.antigravity/skills/`.',
    '',
    '| Skill | Arquivo canonico |',
    '|-------|-----------------|',
    ...skills.map((skill) => `| \`gos-${skill.slug}\` | \`.gos/${skill.skillFile || skill.path}\` |`)
  ].join('\n');

  writeFile(path.join(root, '.antigravity', 'instructions.md'), antigravityInstructions);
  writeFile(
    path.join(root, '.antigravity', 'config.json'),
    JSON.stringify(
      {
        project: 'g-os',
        instructions: ['instructions.md', '../AGENTS.md', '../CLAUDE.md']
      },
      null,
      2
    )
  );

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
    '## Agents disponiveis',
    '',
    ...agents.map((agent) => `- \`gos-${agent.id}\` -> \`../.gos/agents/profiles/${agent.path}\``),
    '',
    '## Skills curadas',
    '',
    '| Slug | Arquivo canonico |',
    '|------|------------------|',
    ...skills.map((skill) => `| \`gos-${skill.slug}\` | \`../.gos/${skill.skillFile || skill.path}\` |`),
    '',
    '## Como o Codex consome',
    '',
    '- Slash commands em `.codex/commands/gos/{agents,skills}/<id>.md` -> Codex carrega o canonico apontado em CANONICAL-SOURCE e executa.',
    '- Subagents em `.codex/agents/gos-<id>.md` -> referencia o profile em `.gos/agents/profiles/`.',
    '- Skills em `.codex/skills/gos-<slug>/SKILL.md` -> wrapper fino que aponta para `.gos/skills/<slug>/SKILL.md`.',
    ''
  ].join('\n');
  writeFile(path.join(root, '.codex', 'AGENTS.md'), codexAgentsMd);

  const codexConfigToml = [
    '# G-OS Codex IDE Extension config (auto-gerado por npm run sync:ides).',
    '# Edite os arquivos canonicos em .gos/ ao inves deste.',
    '',
    'project = "g-os"',
    '',
    '[instructions]',
    'files = [',
    '  "AGENTS.md",',
    '  "../AGENTS.md",',
    '  "../CLAUDE.md",',
    '  "../.gos/docs/toolchain-map.md",',
    ']',
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
    const expectedAgent = path.join(root, '.codex', 'agents', `gos-${agent.id}.md`);
    const expectedCmd = path.join(root, '.codex', 'commands', 'gos', 'agents', `${agent.id}.md`);
    if (!fs.existsSync(expectedAgent)) codexFailures.push(expectedAgent);
    if (!fs.existsSync(expectedCmd)) codexFailures.push(expectedCmd);
  }
  for (const skill of skills) {
    const expectedSkill = path.join(root, '.codex', 'skills', `gos-${skill.slug}`, 'SKILL.md');
    const expectedCmd = path.join(root, '.codex', 'commands', 'gos', 'skills', `${skill.slug}.md`);
    if (!fs.existsSync(expectedSkill)) codexFailures.push(expectedSkill);
    if (!fs.existsSync(expectedCmd)) codexFailures.push(expectedCmd);
  }
  if (!fs.existsSync(path.join(root, '.codex', 'AGENTS.md'))) codexFailures.push('.codex/AGENTS.md');
  if (!fs.existsSync(path.join(root, '.codex', 'config.toml'))) codexFailures.push('.codex/config.toml');
  if (codexFailures.length > 0) {
    console.error(`[sync:ides] Codex IDE adapters incompletos. Faltando ${codexFailures.length} arquivos:`);
    for (const f of codexFailures) console.error(`  - ${path.relative(root, f)}`);
    process.exit(1);
  }

  console.log(`Adapters generated for ${agents.length} agents and ${skills.length} skills.`);
  console.log(`Codex IDE: ${agents.length} agents + ${skills.length} skills + AGENTS.md + config.toml.`);
}

main();
