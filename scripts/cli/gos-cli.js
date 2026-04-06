#!/usr/bin/env node

/**
 * gos-cli.js — CLI do G-OS para setup, update e validacao de workspace.
 * Zero dependencies externas. Usa apenas modulos nativos do Node.js.
 *
 * Comandos:
 *   gos init     Setup pos-clone (remote, dirs, IDEs)
 *   gos update   Fetch + merge de upstream/main
 *   gos doctor   Validar integridade do workspace
 *   gos version  Mostrar versao e checar atualizacoes
 */

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync, execSync } = require('node:child_process');

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const VERSION = '0.2.0';
const UPSTREAM_REMOTE = 'upstream';
const UPSTREAM_BRANCH = 'main';
const LOCAL_DIR = '.gos-local';
const MANIFEST_PATH = 'manifests/gos-install-manifest.json';

// ---------------------------------------------------------------------------
// Utilitarios
// ---------------------------------------------------------------------------

const log   = (msg) => console.log(`[G-OS] ${msg}`);
const info  = (msg) => console.log(`  i  ${msg}`);
const ok    = (msg) => console.log(`  v  ${msg}`);
const warn  = (msg) => console.log(`  !  ${msg}`);
const fail  = (msg) => console.error(`  x  ${msg}`);

function pathExists(p) { return fs.existsSync(p); }

function ensureDir(p) {
  if (!pathExists(p)) fs.mkdirSync(p, { recursive: true });
}

function readJson(filePath, fallback = null) {
  if (!pathExists(filePath)) return fallback;
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch { return fallback; }
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n');
}

/**
 * Executa comando git via execFileSync (sem shell injection).
 * Retorna stdout como string. Em caso de erro, retorna '' se ignoreError=true.
 */
function git(args, opts = {}) {
  const options = { encoding: 'utf8', cwd: opts.cwd, stdio: opts.quiet ? 'pipe' : 'inherit' };
  try {
    return execFileSync('git', args, options);
  } catch (e) {
    if (opts.ignoreError) return (e.stdout || '').toString();
    throw e;
  }
}

/** Executa git e captura stdout silenciosamente. */
function gitCapture(args, opts = {}) {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: 'pipe', cwd: opts.cwd }).trim();
  } catch {
    return '';
  }
}

/** Executa node script via execFileSync. */
function runNode(scriptPath, opts = {}) {
  const options = { encoding: 'utf8', cwd: opts.cwd, stdio: opts.quiet ? 'pipe' : 'inherit' };
  try {
    return execFileSync(process.execPath, [scriptPath], options);
  } catch (e) {
    if (opts.ignoreError) return '';
    throw e;
  }
}

function getFlagValue(args, flag) {
  const prefix = `--${flag}=`;
  const found = args.find(a => a.startsWith(prefix));
  if (found) return found.slice(prefix.length);
  const idx = args.indexOf(`--${flag}`);
  if (idx !== -1 && idx + 1 < args.length) return args[idx + 1];
  return null;
}

function getRoot() {
  return path.resolve(__dirname, '..', '..');
}

/** 
 * Copia recursiva de diretórios (zero dependencies). 
 */
function copyDirRecursive(source, target, options = {}) {
  const { exclude = [] } = options;
  if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });

  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(source, entry.name);
    const destPath = path.join(target, entry.name);

    // Skip excluded names
    if (exclude.includes(entry.name)) continue;

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath, options);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function getManifest(root) {
  const manifestFile = path.join(root, MANIFEST_PATH);
  const manifest = readJson(manifestFile);
  if (!manifest) {
    fail(`Manifest nao encontrado: ${MANIFEST_PATH}`);
    process.exit(1);
  }
  return manifest;
}

// ---------------------------------------------------------------------------
// Merge .gitignore
// ---------------------------------------------------------------------------

function mergeGitignore(root, entries) {
  const gitignorePath = path.join(root, '.gitignore');
  let content = '';
  if (pathExists(gitignorePath)) {
    content = fs.readFileSync(gitignorePath, 'utf8');
  }

  const missing = entries.filter(e => !content.includes(e.trim()));
  if (missing.length === 0) return false;

  const block = '\n# G-OS managed entries\n' + missing.join('\n') + '\n';
  fs.writeFileSync(gitignorePath, content.trimEnd() + '\n' + block);
  return true;
}

// ---------------------------------------------------------------------------
// gos init
// ---------------------------------------------------------------------------

function cmdInit(root, args) {
  const force = args.includes('--force');

  log('Inicializando workspace G-OS...');

  // 1. Validar Node >= 18
  const nodeVersion = parseInt(process.version.slice(1), 10);
  if (nodeVersion < 18) {
    fail(`Node.js >= 18 necessario. Versao atual: ${process.version}`);
    process.exit(1);
  }

  // 2. Checar se ja inicializado
  const installLog = path.join(root, LOCAL_DIR, 'install-log.json');
  if (pathExists(installLog) && !force) {
    warn('Workspace ja inicializado.');
    info('Use --force para reinicializar.');
    return;
  }

  // 3. Renomear remote origin -> upstream (se origin existir)
  const remotes = gitCapture(['remote'], { cwd: root });
  if (remotes.includes('origin') && !remotes.includes(UPSTREAM_REMOTE)) {
    log('Renomeando remote origin -> upstream...');
    git(['remote', 'rename', 'origin', UPSTREAM_REMOTE], { cwd: root });
    ok('Remote renomeado: origin -> upstream');
    info('Agora voce pode adicionar seu proprio origin com: git remote add origin <url>');
  } else if (remotes.includes(UPSTREAM_REMOTE)) {
    ok('Remote upstream ja existe.');
  } else {
    warn('Nenhum remote origin encontrado. Configure manualmente:');
    info(`  git remote add ${UPSTREAM_REMOTE} https://github.com/adrianomorais-ganbatte/g-os.git`);
  }

  // 4. Criar diretorios locais
  const localDirs = ['worktrees', 'outputs', 'task-queue'];
  for (const dir of localDirs) {
    ensureDir(path.join(root, LOCAL_DIR, dir));
  }
  ok(`Diretorio ${LOCAL_DIR}/ criado com subdirs.`);

  // 5. Criar packages/ com .gitkeep
  const packagesDir = path.join(root, 'packages');
  if (!pathExists(packagesDir)) {
    ensureDir(packagesDir);
    fs.writeFileSync(path.join(packagesDir, '.gitkeep'), '');
    ok('Diretorio packages/ criado.');
  }

  // 6. Sync IDE adapters
  const ideSetupScript = path.join(root, 'scripts', 'integrations', 'setup-ide-adapters.js');
  if (pathExists(ideSetupScript)) {
    log('Sincronizando IDE adapters...');
    runNode(ideSetupScript, { cwd: root });
    ok('IDE adapters sincronizados.');
  } else {
    warn('setup-ide-adapters.js nao encontrado. Pulando sync de IDEs.');
  }

  // 7. Validar IDEs
  const ideCheckScript = path.join(root, 'scripts', 'integrations', 'check-ide-compat.js');
  if (pathExists(ideCheckScript)) {
    runNode(ideCheckScript, { cwd: root, ignoreError: true });
  }

  // 8. Merge .gitignore
  const manifest = getManifest(root);
  const gitignoreUpdated = mergeGitignore(root, manifest.gitignoreEntries || []);
  if (gitignoreUpdated) ok('.gitignore atualizado com entradas do manifest.');

  // 9. Salvar install log
  writeJson(installLog, {
    version: VERSION,
    initializedAt: new Date().toISOString(),
    nodeVersion: process.version
  });

  // 10. Sucesso
  console.log('');
  ok('Workspace G-OS inicializado com sucesso!');
  console.log('');
  console.log(`  Versao:     ${VERSION}`);
  console.log(`  Local dir:  ${LOCAL_DIR}/`);
  console.log(`  .gitignore: ${gitignoreUpdated ? 'atualizado' : 'ja estava ok'}`);
  console.log('');
  console.log('  Proximos passos:');
  
  const remotes = gitCapture(['remote'], { cwd: root });
  if (!remotes.includes('origin')) {
    console.log('    1. Adicione seu remote: git remote add origin <seu-repo>');
  }
  
  console.log('    2. Crie projetos em packages/');
  console.log('    3. Para atualizar o framework: npm run gos:update');
  console.log('');
}

// ---------------------------------------------------------------------------
// gos install
// ---------------------------------------------------------------------------

function cmdInstall(args) {
  const targetRoot = process.cwd();
  const sourceRoot = getRoot();
  
  // Se ja estamos na raiz do G-OS, apenas rodamos o init
  if (path.resolve(sourceRoot) === path.resolve(targetRoot)) {
    log('Executando na raiz do framework. Redirecionando para "init"...');
    cmdInit(targetRoot, args);
    return;
  }

  log(`Instalando G-OS em: ${targetRoot}`);
  
  // 1. Validar se diretorio ja tem G-OS (a menos que use --force)
  if (pathExists(path.join(targetRoot, LOCAL_DIR)) && !args.includes('--force')) {
    fail('Workspace G-OS ja detectado neste diretorio.');
    info('Use --force para reinstalar/sobrescrever.');
    process.exit(1);
  }

  // 2. Copiar arquivos do framework (exceto os internos/git)
  const exclude = ['.git', '.gos-local', 'node_modules', 'package-lock.json', 'install-log.json', 'update-log.json'];
  log('Copiando arquivos do framework...');
  try {
    copyDirRecursive(sourceRoot, targetRoot, { exclude });
    ok('Arquivos copiados com sucesso.');
  } catch (e) {
    fail(`Erro ao copiar arquivos: ${e.message}`);
    process.exit(1);
  }

  // 3. Executar o init no target para finalizar configs
  cmdInit(targetRoot, args);
  
  // 4. Garantir que o remote upstream existe caso tenha sido instalado via npx
  const remotes = gitCapture(['remote'], { cwd: targetRoot });
  if (!remotes.includes(UPSTREAM_REMOTE)) {
    try {
      git(['remote', 'add', UPSTREAM_REMOTE, 'https://github.com/adrianomorais-ganbatte/g-os.git'], { cwd: targetRoot });
      ok(`Remote "${UPSTREAM_REMOTE}" adicionado.`);
    } catch {
      warn(`Nao foi possivel adicionar o remote "${UPSTREAM_REMOTE}". Configure manualmente.`);
    }
  }
}

// ---------------------------------------------------------------------------
// gos update
// ---------------------------------------------------------------------------

function cmdUpdate(root, args) {
  const skipStash = args.includes('--no-stash');

  log('Atualizando workspace G-OS...');

  // 1. Verificar remote upstream
  const remotes = gitCapture(['remote'], { cwd: root });
  if (!remotes.includes(UPSTREAM_REMOTE)) {
    fail(`Remote "${UPSTREAM_REMOTE}" nao encontrado.`);
    info(`Adicione com: git remote add ${UPSTREAM_REMOTE} https://github.com/adrianomorais-ganbatte/g-os.git`);
    process.exit(1);
  }

  // 2. Checar se ha mudancas locais e fazer stash
  const status = gitCapture(['status', '--porcelain'], { cwd: root });
  let didStash = false;
  if (status && !skipStash) {
    log('Mudancas locais detectadas. Fazendo stash...');
    git(['stash', 'push', '-m', 'gos-update-auto-stash'], { cwd: root });
    didStash = true;
    ok('Stash criado.');
  }

  // 3. Fetch upstream
  log(`Buscando atualizacoes de ${UPSTREAM_REMOTE}/${UPSTREAM_BRANCH}...`);
  git(['fetch', UPSTREAM_REMOTE, UPSTREAM_BRANCH], { cwd: root });

  // 4. Checar se ha commits novos
  const behind = gitCapture(
    ['rev-list', '--count', `HEAD..${UPSTREAM_REMOTE}/${UPSTREAM_BRANCH}`],
    { cwd: root }
  );
  if (behind === '0') {
    ok('Workspace ja esta atualizado.');
    if (didStash) git(['stash', 'pop'], { cwd: root });
    return;
  }

  const commitBefore = gitCapture(['rev-parse', '--short', 'HEAD'], { cwd: root });

  // 5. Merge
  log(`${behind} commit(s) novo(s). Fazendo merge...`);
  const manifest = getManifest(root);
  const frameworkPaths = manifest.frameworkManaged || [];

  try {
    git(['merge', `${UPSTREAM_REMOTE}/${UPSTREAM_BRANCH}`, '--no-edit'], { cwd: root, quiet: true });
    ok('Merge concluido sem conflitos.');
  } catch {
    // Checar conflitos
    const conflictFiles = gitCapture(['diff', '--name-only', '--diff-filter=U'], { cwd: root });
    if (!conflictFiles) {
      fail('Merge falhou por motivo desconhecido.');
      if (didStash) info('Stash preservado. Rode: git stash pop');
      process.exit(1);
    }

    const conflicts = conflictFiles.split('\n').filter(Boolean);
    const userConflicts = [];
    const fwConflicts = [];

    for (const file of conflicts) {
      const isFramework = frameworkPaths.some(fp => file.startsWith(fp.replace(/\/$/, '')));
      if (isFramework) {
        fwConflicts.push(file);
      } else {
        userConflicts.push(file);
      }
    }

    // Auto-resolve framework files
    for (const file of fwConflicts) {
      git(['checkout', '--theirs', file], { cwd: root, quiet: true });
      git(['add', file], { cwd: root, quiet: true });
    }
    if (fwConflicts.length > 0) {
      ok(`${fwConflicts.length} conflito(s) em arquivos do framework resolvidos automaticamente.`);
    }

    // User conflicts = abort
    if (userConflicts.length > 0) {
      fail('Conflitos em arquivos do usuario:');
      for (const file of userConflicts) {
        console.log(`    - ${file}`);
      }
      info('Resolva os conflitos manualmente e rode: git merge --continue');
      if (didStash) info('Stash preservado. Apos resolver: git stash pop');
      process.exit(1);
    }

    // Continuar merge se todos os conflitos foram resolvidos
    git(['merge', '--continue', '--no-edit'], { cwd: root, quiet: true, ignoreError: true });
  }

  const commitAfter = gitCapture(['rev-parse', '--short', 'HEAD'], { cwd: root });

  // 6. Re-sync IDEs
  const ideSetupScript = path.join(root, 'scripts', 'integrations', 'setup-ide-adapters.js');
  if (pathExists(ideSetupScript)) {
    log('Re-sincronizando IDE adapters...');
    runNode(ideSetupScript, { cwd: root, quiet: true });
    ok('IDE adapters atualizados.');
  }

  // 7. Validar IDEs
  const ideCheckScript = path.join(root, 'scripts', 'integrations', 'check-ide-compat.js');
  if (pathExists(ideCheckScript)) {
    runNode(ideCheckScript, { cwd: root, ignoreError: true, quiet: true });
  }

  // 8. Pop stash
  if (didStash) {
    log('Restaurando mudancas locais (stash pop)...');
    try {
      git(['stash', 'pop'], { cwd: root, quiet: true });
      ok('Mudancas locais restauradas.');
    } catch {
      warn('Falha ao restaurar stash. Rode manualmente: git stash pop');
    }
  }

  // 9. Salvar update log
  const updateLog = path.join(root, LOCAL_DIR, 'update-log.json');
  const previousLog = readJson(updateLog, {});
  writeJson(updateLog, {
    version: VERSION,
    lastUpdate: new Date().toISOString(),
    previousVersion: previousLog.version || null,
    commitBefore,
    commitAfter
  });

  // 10. Changelog
  console.log('');
  ok(`Atualizado: ${commitBefore} -> ${commitAfter} (${behind} commits)`);
  console.log('');
  console.log('  Changelog:');
  const changelog = gitCapture(
    ['log', '--oneline', `${commitBefore}..${commitAfter}`],
    { cwd: root }
  );
  if (changelog) {
    for (const line of changelog.split('\n')) {
      console.log(`    ${line}`);
    }
  }
  console.log('');
}

// ---------------------------------------------------------------------------
// gos doctor
// ---------------------------------------------------------------------------

function cmdDoctor(root) {
  log('Validando workspace G-OS...');
  console.log('');

  let issues = 0;
  let checks = 0;

  function check(label, condition) {
    checks++;
    if (condition) {
      ok(label);
    } else {
      fail(label);
      issues++;
    }
  }

  // 1. Manifest existe
  const manifest = readJson(path.join(root, MANIFEST_PATH));
  check('Manifest gos-install-manifest.json', !!manifest);
  if (!manifest) {
    fail('Sem manifest, validacao abortada.');
    process.exit(1);
  }

  // 2. Required paths
  const requiredPaths = manifest.requiredPaths || [];
  for (const rp of requiredPaths) {
    check(`Path: ${rp}`, pathExists(path.join(root, rp)));
  }

  // 3. Runtime manifest
  const runtime = readJson(path.join(root, 'manifests', 'g-os-runtime-manifest.json'));
  check('Runtime manifest g-os-runtime-manifest.json', !!runtime);

  // 4. Agents
  if (runtime && runtime.modules && runtime.modules.agents) {
    for (const agent of runtime.modules.agents) {
      const agentFile = path.join(root, 'agents', 'profiles', `${agent}.md`);
      check(`Agent: ${agent}`, pathExists(agentFile));
    }
  }

  // 5. Skills
  const skillsRegistry = readJson(path.join(root, 'skills', 'registry.json'));
  check('Skills registry', !!skillsRegistry);

  if (runtime && runtime.modules && runtime.modules.skills) {
    for (const skill of runtime.modules.skills) {
      const skillFile = path.join(root, 'skills', skill, 'SKILL.md');
      check(`Skill: ${skill}`, pathExists(skillFile));
    }
  }

  // 6. IDE adapters
  const ideCheckScript = path.join(root, 'scripts', 'integrations', 'check-ide-compat.js');
  if (pathExists(ideCheckScript)) {
    try {
      execFileSync(process.execPath, [ideCheckScript], { encoding: 'utf8', stdio: 'pipe', cwd: root });
      ok('IDE adapters validados (check-ide-compat.js)');
      checks++;
    } catch {
      fail('IDE adapters com problemas (check-ide-compat.js)');
      checks++;
      issues++;
    }
  }

  // 7. Package.json
  const pkg = readJson(path.join(root, 'package.json'));
  check('package.json existe', !!pkg);
  if (pkg) {
    check('package.json tem scripts gos:*', !!(pkg.scripts && pkg.scripts['gos:update']));
  }

  // 8. Git remote upstream
  const remotes = gitCapture(['remote'], { cwd: root });
  check(`Git remote "${UPSTREAM_REMOTE}" configurado`, remotes.includes(UPSTREAM_REMOTE));

  // 9. Local dir
  check(`Diretorio ${LOCAL_DIR}/ existe`, pathExists(path.join(root, LOCAL_DIR)));

  // 10. Report
  const updateLog = readJson(path.join(root, LOCAL_DIR, 'update-log.json'));
  const installLogData = readJson(path.join(root, LOCAL_DIR, 'install-log.json'));

  console.log('');
  console.log(`  Versao:         ${pkg ? pkg.version || VERSION : VERSION}`);
  console.log(`  Inicializado:   ${installLogData ? installLogData.initializedAt : 'N/A'}`);
  console.log(`  Ultimo update:  ${updateLog ? updateLog.lastUpdate : 'N/A'}`);
  console.log(`  Node.js:        ${process.version}`);
  console.log('');

  if (issues === 0) {
    ok(`${checks} checks executados. Workspace saudavel.`);
  } else {
    fail(`${issues} problema(s) encontrado(s) em ${checks} checks.`);
  }

  process.exit(issues > 0 ? 1 : 0);
}

// ---------------------------------------------------------------------------
// gos version
// ---------------------------------------------------------------------------

function cmdVersion(root) {
  const pkg = readJson(path.join(root, 'package.json'), {});
  const localVersion = pkg.version || VERSION;

  console.log(`G-OS v${localVersion}`);

  // Checar se ha commits novos no upstream
  const remotes = gitCapture(['remote'], { cwd: root });
  if (!remotes.includes(UPSTREAM_REMOTE)) {
    info(`Remote "${UPSTREAM_REMOTE}" nao configurado. Nao foi possivel checar atualizacoes.`);
    return;
  }

  try {
    execFileSync('git', ['fetch', UPSTREAM_REMOTE, UPSTREAM_BRANCH], {
      encoding: 'utf8', stdio: 'pipe', cwd: root
    });
    const behind = gitCapture(
      ['rev-list', '--count', `HEAD..${UPSTREAM_REMOTE}/${UPSTREAM_BRANCH}`],
      { cwd: root }
    );

    if (behind && behind !== '0') {
      console.log(`\n  ${behind} commit(s) novo(s) disponivel(is).`);
      console.log('  Atualize com: npm run gos:update\n');
    } else {
      ok('Voce esta na versao mais recente.');
    }
  } catch {
    warn('Nao foi possivel checar atualizacoes (sem conexao?).');
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  const root = getRoot();

  switch (command) {
    case 'init':
      cmdInit(root, args.slice(1));
      break;

    case 'install':
      cmdInstall(args.slice(1));
      break;

    case 'update':
      cmdUpdate(root, args.slice(1));
      break;

    case 'doctor':
      cmdDoctor(root);
      break;

    case 'version':
    case '-v':
    case '--version':
      cmdVersion(root);
      break;

    case 'help':
    case '-h':
    case '--help':
      console.log(`
G-OS CLI v${VERSION}

Comandos:
  gos install   Instalar G-OS no diretorio atual (via npx ou global)
  gos init      Setup pos-clone (remote, dirs, IDEs)
  gos update    Atualizar do upstream/main
  gos doctor    Validar integridade do workspace
  gos version   Mostrar versao e checar atualizacoes
  gos help      Exibir esta ajuda

Flags:
  --force       Sobrescrever arquivos existentes (install/init)
  --no-stash    Nao fazer stash automatico (update)

Exemplos:
  npx g-os install
  node scripts/cli/gos-cli.js init
  npm run gos:update
  npm run gos:doctor
`);
      break;

    default:
      fail(`Comando desconhecido: ${command}`);
      info('Rode: node scripts/cli/gos-cli.js help');
      process.exit(1);
  }
}

main();
