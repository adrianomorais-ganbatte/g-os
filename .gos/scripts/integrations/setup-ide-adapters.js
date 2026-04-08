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

function main() {
  const agents = readJson(path.join(root, '.gos', 'agents', 'profiles', 'index.json')).profiles;
  const skills = readJson(path.join(root, '.gos', 'skills', 'registry.json')).skills;

  for (const agent of agents) {
    const claudeFile = path.join(root, '.claude', 'commands', 'gos', 'agents', `${agent.id}.md`);
    const target = relativeTarget(claudeFile, path.join(root, '.gos', 'agents', 'profiles', agent.path));
    writeFile(claudeFile, agentWrapper(agent.id, target));
  }

  for (const skill of skills) {
    const skillTargetPath = skill.skillFile || skill.path;
    const claudeSkill = path.join(root, '.claude', 'commands', 'gos', 'skills', `${skill.slug}.md`);
    const codexSkill = path.join(root, '.codex', 'skills', `gos-${skill.slug}.md`);
    const geminiSkill = path.join(root, '.gemini', 'skills', `gos-${skill.slug}`, 'SKILL.md');
    const opencodeSkill = path.join(root, '.opencode', 'skills', `gos-${skill.slug}`, 'SKILL.md');
    const qwenSkill = path.join(root, '.qwen', 'skills', `gos-${skill.slug}`, 'SKILL.md');

    writeFile(claudeSkill, skillWrapper(skill.slug, relativeTarget(claudeSkill, path.join(root, '.gos', skillTargetPath))));
    writeFile(codexSkill, skillWrapper(skill.slug, relativeTarget(codexSkill, path.join(root, '.gos', skillTargetPath))));
    writeFile(geminiSkill, skillWrapper(skill.slug, relativeTarget(geminiSkill, path.join(root, '.gos', skillTargetPath))));
    writeFile(opencodeSkill, skillWrapper(skill.slug, relativeTarget(opencodeSkill, path.join(root, '.gos', skillTargetPath))));
    ensureDir(path.dirname(qwenSkill));
    writeFile(qwenSkill, skillWrapper(skill.slug, relativeTarget(qwenSkill, path.join(root, '.gos', skillTargetPath))));
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
    ...skills.map((skill) => `- ${skill.slug}`)
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
