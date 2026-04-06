#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const required = [
  'AGENTS.md',
  'CLAUDE.md',
  'GEMINI.md',
  '.gos/prompts/01-search.md',
  '.gos/prompts/02-spec.md',
  '.gos/prompts/03-tasks.md',
  '.gos/prompts/04-code.md',
  '.gos/prompts/05-reviews.md',
  '.gos/integrations/registry.json',
  '.gos/integrations/claude/command-map.json',
  '.gos/integrations/codex/command-map.json',
  '.gos/integrations/opencode/command-map.json',
  '.gos/integrations/antigravity/command-map.json',
  '.gos/integrations/gemini/command-map.json',
  '.gos/integrations/cursor/command-map.json',
  '.gos/integrations/kilo-code/command-map.json'
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
