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

function skillWrapper(slug, target) {
  return `# gos-${slug}\n\nFonte canonica: \`${target}\`\n\nLeia e siga a skill em \`${target}\`.\nEste arquivo existe apenas como adapter fino para a IDE.`;
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
  }

  for (const skill of skills) {
    const skillTargetPath = skill.skillFile || skill.path;
    const canonicalPath = path.join(root, '.gos', skillTargetPath);
    const claudeSkill = path.join(root, '.claude', 'commands', 'gos', 'skills', `${skill.slug}.md`);
    const codexSkill = path.join(root, '.agents', 'skills', `gos-${skill.slug}`, 'SKILL.md');
    const antigravitySkill = path.join(root, '.antigravity', 'skills', `gos-${skill.slug}`, 'SKILL.md');
    const geminiSkill = path.join(root, '.gemini', 'skills', `gos-${skill.slug}`, 'SKILL.md');
    const opencodeSkill = path.join(root, '.opencode', 'skills', `gos-${skill.slug}`, 'SKILL.md');
    const qwenSkill = path.join(root, '.qwen', 'skills', `gos-${skill.slug}`, 'SKILL.md');

    const qwenCmd = path.join(root, '.qwen', 'commands', 'gos', 'skills', `${skill.slug}.md`);

    writeFile(claudeSkill, skillWrapper(skill.slug, relativeTarget(claudeSkill, canonicalPath)));
    writeFile(codexSkill, skillWrapper(skill.slug, relativeTarget(codexSkill, canonicalPath)));
    writeFile(antigravitySkill, skillWrapper(skill.slug, relativeTarget(antigravitySkill, canonicalPath)));
    writeFile(geminiSkill, skillWrapper(skill.slug, relativeTarget(geminiSkill, canonicalPath)));
    writeFile(opencodeSkill, skillWrapper(skill.slug, relativeTarget(opencodeSkill, canonicalPath)));
    writeFile(qwenSkill, skillWrapper(skill.slug, relativeTarget(qwenSkill, canonicalPath)));
    const skillFm = parseFrontmatter(canonicalPath);
    const skillDesc = skillFm.description || skill.description || skill.name || skill.slug;
    const skillArgHint = skillFm['argument-hint'] || '';
    writeFile(qwenCmd, qwenCommandWrapper(`gos-${skill.slug}`, skillDesc, relativeTarget(qwenCmd, canonicalPath)));
    // Overwrite Claude skill with frontmatter version
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

  console.log(`Adapters generated for ${agents.length} agents and ${skills.length} skills.`);
}

main();
