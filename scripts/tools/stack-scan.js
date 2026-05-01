#!/usr/bin/env node
/**
 * stack-scan — auxilia stack-profiler inferindo a stack a partir de arquivos canônicos.
 * NÃO escreve stack.md (responsabilidade da skill); apenas devolve JSON com fatos coletados.
 *
 * Uso:
 *   node stack-scan.js          # imprime JSON com fatos detectados
 *   node stack-scan.js --hash   # também devolve sha256 dos arquivos lidos (para lock)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { loadPlanPaths } = require('./plan-paths');

function readJsonSafe(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

function sha256(p) {
  if (!fs.existsSync(p) || !fs.statSync(p).isFile()) return null;
  return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
}

function detectFramework(pkg) {
  if (!pkg?.dependencies && !pkg?.devDependencies) return null;
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  if (deps.next) return { name: 'next', version: deps.next };
  if (deps['react-router-dom']) return { name: 'react-router', version: deps['react-router-dom'] };
  if (deps.vite) return { name: 'vite', version: deps.vite };
  if (deps.astro) return { name: 'astro', version: deps.astro };
  return null;
}

function detectORM(pkg) {
  const deps = { ...(pkg?.dependencies || {}), ...(pkg?.devDependencies || {}) };
  if (deps.prisma || deps['@prisma/client']) return 'prisma';
  if (deps['drizzle-orm']) return 'drizzle';
  if (deps['@supabase/supabase-js']) return 'supabase-js';
  return null;
}

function detectAuth(pkg) {
  const deps = { ...(pkg?.dependencies || {}), ...(pkg?.devDependencies || {}) };
  if (deps['@clerk/nextjs'] || deps['@clerk/clerk-react']) return 'clerk';
  if (deps['next-auth']) return 'next-auth';
  if (deps['@supabase/auth-helpers-nextjs'] || deps['@supabase/ssr']) return 'supabase-auth';
  if (deps['better-auth']) return 'better-auth';
  return null;
}

function scan(opts = {}) {
  const { root, config } = loadPlanPaths();
  const want = (rel) => path.join(root, rel);

  const files = [
    'package.json', 'tsconfig.json', 'next.config.js', 'next.config.mjs', 'next.config.ts',
    'vite.config.ts', 'vite.config.js', 'tailwind.config.js', 'tailwind.config.ts',
    'prisma/schema.prisma', 'drizzle.config.ts', 'README.md', 'CLAUDE.md',
  ];

  const present = files.filter(f => fs.existsSync(want(f)));
  const pkg = readJsonSafe(want('package.json')) || {};

  const facts = {
    root,
    framework: detectFramework(pkg),
    orm: detectORM(pkg),
    auth: detectAuth(pkg),
    typescript: present.includes('tsconfig.json'),
    has_tailwind: present.some(f => f.startsWith('tailwind.config')),
    has_prisma: present.includes('prisma/schema.prisma'),
    has_supabase_dir: fs.existsSync(want('supabase')),
    package_name: pkg.name || null,
    package_version: pkg.version || null,
    config_files_present: present,
    knowledge_sources: (config?.knowledge_sources || []).map(s => ({
      ...s,
      exists: fs.existsSync(want(s.path)),
    })),
  };

  if (opts.hash) {
    const toHash = [
      ...present,
      ...(config?.knowledge_sources || [])
        .filter(s => fs.existsSync(want(s.path)) && fs.statSync(want(s.path)).isFile())
        .map(s => s.path),
    ];
    facts.sources = toHash.map(p => ({ path: p, sha256: sha256(want(p)) }));
  }

  return facts;
}

function main() {
  const opts = { hash: process.argv.includes('--hash') };
  console.log(JSON.stringify(scan(opts), null, 2));
}

if (require.main === module) main();

module.exports = { scan, sha256 };
