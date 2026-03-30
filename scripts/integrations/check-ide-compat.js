#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const required = [
  'AGENTS.md',
  'CLAUDE.md',
  'GEMINI.md',
  'prompts/01-search.md',
  'prompts/02-spec.md',
  'prompts/03-tasks.md',
  'prompts/04-code.md',
  'prompts/05-reviews.md',
  'integrations/registry.json',
  'integrations/claude/command-map.json',
  'integrations/codex/command-map.json',
  'integrations/opencode/command-map.json',
  'integrations/antigravity/command-map.json',
  'integrations/gemini/command-map.json',
  'integrations/cursor/command-map.json',
  'integrations/kilo-code/command-map.json',
  '.claude/commands/a8z/agents/dev.md',
  '.claude/commands/a8z/skills/design-to-code.md',
  '.codex/skills/a8z-design-to-code.md',
  '.gemini/skills/a8z-design-to-code/SKILL.md',
  '.opencode/skills/a8z-design-to-code/SKILL.md',
  '.antigravity/instructions.md',
  '.cursor/rules/g-os.mdc',
  '.kilocode/rules/g-os.md'
];

const missing = required.filter((entry) => !fs.existsSync(path.join(root, entry)));

if (missing.length > 0) {
  console.error('Missing compatibility artifacts:');
  for (const entry of missing) {
    console.error(`- ${entry}`);
  }
  process.exit(1);
}

console.log('All IDE compatibility artifacts are present.');
