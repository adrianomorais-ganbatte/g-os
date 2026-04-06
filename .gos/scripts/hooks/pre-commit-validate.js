#!/usr/bin/env node

/**
 * pre-commit-validate.js
 *
 * Validacao pre-commit: roda tsc --noEmit e testes antes do commit.
 * Zero-dependency. Usa execFileSync para seguranca (sem shell injection).
 *
 * Uso:
 *   node scripts/hooks/pre-commit-validate.js [--json] [--skip-tests] [--skip-tsc]
 *
 * Exit codes:
 *   0 — todos os checks passaram
 *   1 — um ou mais checks falharam
 */

const { execFileSync } = require('child_process');
const { existsSync, readFileSync } = require('fs');
const { join } = require('path');

// ---------------------------------------------------------------------------
// Flags
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const jsonOutput = args.includes('--json');
const skipTests = args.includes('--skip-tests');
const skipTsc = args.includes('--skip-tsc');

// ---------------------------------------------------------------------------
// Detectar diretorio do projeto
// ---------------------------------------------------------------------------
// Se chamado de dentro de um workspace, usar cwd.
// Se chamado via scripts/hooks/, subir ate a raiz do projeto.
function findProjectRoot() {
  let dir = process.cwd();
  // Procurar package.json subindo no maximo 5 niveis
  for (let i = 0; i < 5; i++) {
    if (existsSync(join(dir, 'package.json'))) return dir;
    const parent = join(dir, '..');
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

const PROJECT_ROOT = findProjectRoot();

// ---------------------------------------------------------------------------
// Detectar package manager
// ---------------------------------------------------------------------------
function detectPackageManager() {
  if (existsSync(join(PROJECT_ROOT, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(join(PROJECT_ROOT, 'bun.lockb')) || existsSync(join(PROJECT_ROOT, 'bun.lock'))) return 'bun';
  if (existsSync(join(PROJECT_ROOT, 'yarn.lock'))) return 'yarn';
  return 'npm';
}

// ---------------------------------------------------------------------------
// Ler package.json
// ---------------------------------------------------------------------------
function readPkg() {
  const pkgPath = join(PROJECT_ROOT, 'package.json');
  if (!existsSync(pkgPath)) return {};
  try {
    return JSON.parse(readFileSync(pkgPath, 'utf8'));
  } catch {
    return {};
  }
}

// ---------------------------------------------------------------------------
// Rodar comando com execFileSync
// ---------------------------------------------------------------------------
function runCheck(name, cmd, cmdArgs, opts = {}) {
  const start = Date.now();
  try {
    const output = execFileSync(cmd, cmdArgs, {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 300_000, // 5 min max
      ...opts
    });
    return {
      name,
      status: 'pass',
      output: output.trim().slice(0, 2000),
      duration: Date.now() - start
    };
  } catch (err) {
    const stderr = err.stderr ? err.stderr.toString().trim() : '';
    const stdout = err.stdout ? err.stdout.toString().trim() : '';
    return {
      name,
      status: 'fail',
      output: (stderr || stdout || err.message).slice(0, 4000),
      duration: Date.now() - start
    };
  }
}

// ---------------------------------------------------------------------------
// Detectar script de teste disponivel
// ---------------------------------------------------------------------------
function detectTestScript(pkg) {
  const scripts = pkg.scripts || {};
  // Prioridade: test:run (vitest --run) > test:e2e > test
  if (scripts['test:run']) return 'test:run';
  if (scripts['test:e2e']) return 'test:e2e';
  if (scripts['test']) {
    // Se o script test e apenas "vitest" (sem --run), adicionar --run
    // para evitar watch mode
    return 'test';
  }
  return null;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  const pm = detectPackageManager();
  const pkg = readPkg();
  const checks = [];

  // Check 1: TypeScript (tsc --noEmit)
  if (!skipTsc) {
    const hasTsConfig = existsSync(join(PROJECT_ROOT, 'tsconfig.json'));
    if (hasTsConfig) {
      // Tentar usar npx para garantir que tsc esta disponivel
      const check = runCheck('tsc --noEmit', 'npx', ['tsc', '--noEmit']);
      checks.push(check);
    } else {
      checks.push({
        name: 'tsc --noEmit',
        status: 'skip',
        output: 'tsconfig.json nao encontrado',
        duration: 0
      });
    }
  }

  // Check 2: Testes
  if (!skipTests) {
    const testScript = detectTestScript(pkg);
    if (testScript) {
      // Construir comando: <pm> run <script> -- --run (para vitest)
      const cmdArgs = ['run', testScript];

      // Se o script e "test" e usa vitest, adicionar --run para evitar watch
      const scriptCmd = (pkg.scripts || {})[testScript] || '';
      if (scriptCmd.includes('vitest') && !scriptCmd.includes('--run')) {
        cmdArgs.push('--', '--run');
      }

      const check = runCheck(`${pm} run ${testScript}`, pm, cmdArgs);
      checks.push(check);
    } else {
      checks.push({
        name: 'tests',
        status: 'skip',
        output: 'Nenhum script de teste encontrado no package.json',
        duration: 0
      });
    }
  }

  // Resultado
  const passed = checks.every(c => c.status === 'pass' || c.status === 'skip');
  const result = {
    passed,
    packageManager: pm,
    projectRoot: PROJECT_ROOT,
    checks,
    timestamp: new Date().toISOString()
  };

  if (jsonOutput) {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } else {
    // Output legivel
    const icon = passed ? '\u2705' : '\u274C';
    console.log(`\n${icon} Pre-Commit Validation\n`);
    for (const c of checks) {
      const statusIcon = c.status === 'pass' ? '\u2705' : c.status === 'skip' ? '\u23ED' : '\u274C';
      console.log(`  ${statusIcon} ${c.name} (${c.duration}ms)`);
      if (c.status === 'fail') {
        // Mostrar primeiras linhas do output de erro
        const lines = c.output.split('\n').slice(0, 15);
        for (const line of lines) {
          console.log(`     ${line}`);
        }
      }
    }
    console.log(`\n${passed ? 'Todos os checks passaram.' : 'Checks falharam. Corrija os erros antes do commit.'}\n`);
  }

  process.exit(passed ? 0 : 1);
}

main();
