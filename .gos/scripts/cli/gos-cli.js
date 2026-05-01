#!/usr/bin/env node

/**
 * gos-cli.js — CLI do ganbatte-os para setup, update e validacao de workspace.
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

function readPackageVersion() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'package.json'), 'utf8'));
    return pkg.version || 'unknown';
  } catch {
    return 'unknown';
  }
}

const VERSION = readPackageVersion();
const UPSTREAM_REMOTE = 'upstream';
const DEFAULT_UPSTREAM_BRANCH = 'main';
const LOCAL_DIR = '.gos-local';
const MANIFEST_PATH = '.gos/manifests/gos-install-manifest.json';
const CONFIG_PATH = '.gos/config.json';
const CORRECT_UPSTREAM_URL = 'git@github-adriano:adrianomorais-ganbatte/g-os.git';
const CORRECT_UPSTREAM_URL_HTTPS = 'https://github.com/adrianomorais-ganbatte/g-os.git';
const STASH_LABEL = 'gos-update-auto-stash';

/**
 * Resolve a development branch a partir de .gos/config.json.
 * Fallback: 'main'. Permite override via env GOS_UPSTREAM_BRANCH.
 */
function resolveUpstreamBranch(root) {
  if (process.env.GOS_UPSTREAM_BRANCH) return process.env.GOS_UPSTREAM_BRANCH;
  const cfg = readJson(path.join(root, CONFIG_PATH));
  return cfg?.defaultBranches?.development || cfg?.defaultBranches?.production || DEFAULT_UPSTREAM_BRANCH;
}

/**
 * Detecta se este workspace é o framework G-OS em si (fork/clone) ou um projeto
 * consumidor que apenas instalou o framework via `gos install`.
 *  - 'framework': package.json#name === 'ganbatte-os' AND .git no root
 *  - 'consumer':  qualquer outro caso
 */
function detectMode(root) {
  const pkg = readJson(path.join(root, 'package.json'), {});
  const isGosPackage = pkg.name === 'ganbatte-os';
  const hasGit = pathExists(path.join(root, '.git'));
  return isGosPackage && hasGit ? 'framework' : 'consumer';
}

/**
 * Valida que o remote upstream existe E responde. Não modifica nada.
 * Retorna { ok, remoteUrl, error }.
 */
function validateUpstream(root) {
  const remotes = gitCapture(['remote'], { cwd: root });
  if (!remotes.split(/\r?\n/).includes(UPSTREAM_REMOTE)) {
    return { ok: false, error: `remote "${UPSTREAM_REMOTE}" não configurado` };
  }
  const url = gitCapture(['remote', 'get-url', UPSTREAM_REMOTE], { cwd: root });
  // Detecta URL antiga incorreta (ganbatte-os.git em vez de g-os.git)
  if (/ganbatte-os\.git/.test(url) && !/g-os\.git/.test(url)) {
    return { ok: false, remoteUrl: url, error: 'URL do upstream parece estar com nome antigo (ganbatte-os.git)' };
  }
  // Ping no remoto sem stashar nada
  try {
    execFileSync('git', ['ls-remote', '--quiet', '--exit-code', UPSTREAM_REMOTE, 'HEAD'], {
      cwd: root, stdio: 'pipe', encoding: 'utf8',
    });
    return { ok: true, remoteUrl: url };
  } catch (e) {
    return { ok: false, remoteUrl: url, error: `não foi possível alcançar ${url}` };
  }
}

/**
 * Lista todos stashes auto-criados pelo gos-update.
 * Retorna [{ ref, branch, label, dateIso }].
 */
function listGosStashes(root) {
  const out = gitCapture(['stash', 'list', '--format=%gd|%gs|%ci'], { cwd: root });
  if (!out) return [];
  return out.split(/\r?\n/).filter(Boolean).map(line => {
    const [ref, subject, dateIso] = line.split('|');
    return { ref, subject, dateIso };
  }).filter(s => s.subject && s.subject.includes(STASH_LABEL));
}

// ---------------------------------------------------------------------------
// Utilitarios
// ---------------------------------------------------------------------------

const log   = (msg) => console.log(`[ganbatte-os] ${msg}`);
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
  const currentPath = path.resolve(__dirname);
  // Se estiver dentro de node_modules/ganbatte-os/...
  const npmIdx = currentPath.lastIndexOf(`node_modules${path.sep}ganbatte-os`);
  if (npmIdx !== -1) {
    return currentPath.slice(0, npmIdx + `node_modules${path.sep}ganbatte-os`.length);
  }
  // Fallback para desenvolvimento local (assumindo que o arquivo está em .gos/scripts/cli/)
  return path.resolve(__dirname, '..', '..', '..');
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

  log('Inicializando workspace ganbatte-os...');

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
    info(`  git remote add ${UPSTREAM_REMOTE} https://github.com/adrianomorais-ganbatte/ganbatte-os.git`);
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
  const ideSetupScript = path.join(root, '.gos', 'scripts', 'integrations', 'setup-ide-adapters.js');
  if (pathExists(ideSetupScript)) {
    log('Sincronizando IDE adapters...');
    runNode(ideSetupScript, { cwd: root });
    ok('IDE adapters sincronizados.');
  } else {
    warn('setup-ide-adapters.js nao encontrado. Pulando sync de IDEs.');
  }

  // 6b. Sync adapters no framework pai (a8z-framework)
  const parentSyncScript = path.join(root, '..', 'scripts', 'integrations', 'sync-gos-adapters.js');
  if (pathExists(parentSyncScript)) {
    log('Sincronizando adapters no framework pai...');
    runNode(parentSyncScript, { cwd: path.join(root, '..') });
    ok('Adapters sincronizados no framework pai.');
  }

  // 7. Validar IDEs
  const ideCheckScript = path.join(root, '.gos', 'scripts', 'integrations', 'check-ide-compat.js');
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
  ok('Workspace ganbatte-os inicializado com sucesso!');
  console.log('');
  console.log(`  Versao:     ${VERSION}`);
  console.log(`  Local dir:  ${LOCAL_DIR}/`);
  console.log(`  .gitignore: ${gitignoreUpdated ? 'atualizado' : 'ja estava ok'}`);
  console.log('');
  console.log('  Proximos passos:');
  
  const finalRemotes = gitCapture(['remote'], { cwd: root });
  if (!finalRemotes.includes('origin')) {
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

  log(`Instalando ganbatte-os em: ${targetRoot}`);
  
  // 1. Validar se diretorio ja tem G-OS (a menos que use --force)
  if (pathExists(path.join(targetRoot, LOCAL_DIR)) && !args.includes('--force')) {
    fail('Workspace ganbatte-os ja detectado neste diretorio.');
    info('Use --force para reinstalar/sobrescrever.');
    process.exit(1);
  }

  // 2. Copiar arquivos do framework
  log('Copiando arquivos do framework...');
  try {
    // Copiar pasta .gos inteira
    copyDirRecursive(path.join(sourceRoot, '.gos'), path.join(targetRoot, '.gos'));
    
    // Copiar arquivos .md da raiz
    const rootFiles = ['AGENTS.md', 'CLAUDE.md', 'GEMINI.md', 'README.md', 'LICENSE'];
    for (const file of rootFiles) {
      const src = path.join(sourceRoot, file);
      if (pathExists(src)) {
        fs.copyFileSync(src, path.join(targetRoot, file));
      }
    }
    ok('Arquivos copiados com sucesso.');
  } catch (e) {
    fail(`Erro ao copiar arquivos: ${e.message}`);
    process.exit(1);
  }

  // 3. Executar o init no target para finalizar configs
  cmdInit(targetRoot, args);
  
  // 4. Garantir que o remote upstream existe caso tenha sido instalado via npx
  if (!pathExists(path.join(targetRoot, '.git'))) {
    info('Diretorio nao e um repositorio git. Pulando configuracao de remote.');
    info('Inicialize com: git init && git remote add upstream https://github.com/adrianomorais-ganbatte/g-os.git');
    return;
  }
  const remotes = gitCapture(['remote'], { cwd: targetRoot });
  if (!remotes.includes(UPSTREAM_REMOTE)) {
    try {
      git(['remote', 'add', UPSTREAM_REMOTE, 'https://github.com/adrianomorais-ganbatte/g-os.git'], { cwd: targetRoot, quiet: true });
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
  const branch = resolveUpstreamBranch(root);
  const mode = detectMode(root);

  log('Atualizando workspace ganbatte-os...');

  // 0. Modo: bloquear se for projeto consumidor (não fork do framework).
  if (mode === 'consumer') {
    fail('Este workspace é um projeto consumidor, não o repositório do framework G-OS.');
    info('Para atualizar o framework dentro do seu projeto, use:');
    info('  gos install --force');
    info('Ou (se você instalou via npm install):');
    info('  npm install ganbatte-os@latest');
    info('');
    info('`gos update` é apenas para forks/clones do repositório g-os.');
    process.exit(1);
  }

  // 1. Validar upstream ANTES de qualquer modificação local (stash, etc).
  const upstream = validateUpstream(root);
  if (!upstream.ok) {
    fail(`Upstream inválido: ${upstream.error}`);
    if (upstream.remoteUrl) info(`URL atual: ${upstream.remoteUrl}`);
    info('Corrija com:');
    info(`  git remote set-url ${UPSTREAM_REMOTE} ${CORRECT_UPSTREAM_URL}`);
    info(`  (ou via HTTPS: ${CORRECT_UPSTREAM_URL_HTTPS})`);
    info('');
    info(`Depois rode: npm run gos:update`);
    process.exit(1);
  }

  // 2. Dry-run fetch (sem stashar): se nada mudou, sai cedo.
  log(`Verificando ${UPSTREAM_REMOTE}/${branch}...`);
  try {
    git(['fetch', UPSTREAM_REMOTE, branch], { cwd: root, quiet: true });
  } catch (e) {
    fail(`Fetch de ${UPSTREAM_REMOTE}/${branch} falhou.`);
    info('Verifique sua conexão e credenciais SSH/HTTPS. Nada foi modificado localmente.');
    process.exit(1);
  }

  const behind = gitCapture(
    ['rev-list', '--count', `HEAD..${UPSTREAM_REMOTE}/${branch}`],
    { cwd: root }
  );
  if (behind === '0' || behind === '') {
    ok(`Workspace ja esta atualizado com ${UPSTREAM_REMOTE}/${branch}.`);
    return;
  }

  // 3. AGORA é seguro stashar (upstream validado + commits novos confirmados).
  const status = gitCapture(['status', '--porcelain'], { cwd: root });
  let didStash = false;
  if (status && !skipStash) {
    log('Mudancas locais detectadas. Fazendo stash...');
    const stashLabel = `${STASH_LABEL} ${new Date().toISOString()}`;
    git(['stash', 'push', '-m', stashLabel], { cwd: root });
    didStash = true;
    ok(`Stash criado: ${stashLabel}`);
  }

  const commitBefore = gitCapture(['rev-parse', '--short', 'HEAD'], { cwd: root });

  // 5. Merge
  log(`${behind} commit(s) novo(s). Fazendo merge...`);
  const manifest = getManifest(root);
  const frameworkPaths = manifest.frameworkManaged || [];
  const allowUnrelated = args.includes('--allow-unrelated');
  const clobberUntracked = args.includes('--clobber-untracked');

  // Paths que podemos clobberar com segurança:
  //  - IDE adapters: regenerados por sync:ides
  //  - .gos/: framework directory, sempre vem do upstream
  const FRAMEWORK_GENERATED_PREFIXES = [
    '.claude/', '.qwen/', '.gemini/', '.cursor/', '.agents/',
    '.kilocode/', '.antigravity/', '.opencode/', '.codex/',
    '.gos/',
  ];
  const isGenerated = (p) => FRAMEWORK_GENERATED_PREFIXES.some(prefix => p.startsWith(prefix));

  const mergeArgs = ['merge', `${UPSTREAM_REMOTE}/${branch}`, '--no-edit'];
  if (allowUnrelated) mergeArgs.push('--allow-unrelated-histories');

  // Função tentando o merge, capturando stderr — chamada mais de uma vez se houver retry
  function tryMerge() {
    try {
      execFileSync('git', mergeArgs, { cwd: root, stdio: 'pipe', encoding: 'utf8' });
      return { ok: true };
    } catch (e) {
      return { ok: false, err: ((e.stderr || '') + (e.stdout || '')).toString() };
    }
  }

  let mergeErr = '';
  let attempt = tryMerge();
  if (attempt.ok) {
    ok('Merge concluido sem conflitos.');
  } else {
    mergeErr = attempt.err;

    // Auto-resolução: untracked files que upstream quer escrever, mas só se
    // todos forem paths gerados pelo framework (sync:ides regenera).
    const untrackedMatch = mergeErr.match(/untracked working tree files would be overwritten by merge:\s*([\s\S]+?)(?:Please move or remove|$)/i);
    if (untrackedMatch) {
      const conflictingPaths = untrackedMatch[1]
        .split(/\r?\n/)
        .map(s => s.trim())
        .filter(Boolean);
      const generated = conflictingPaths.filter(isGenerated);
      const userOwned = conflictingPaths.filter(p => !isGenerated(p));

      if (clobberUntracked && userOwned.length === 0) {
        const ts = new Date().toISOString().replace(/[:.]/g, '-');
        log(`${generated.length} arquivo(s) untracked em paths regenerados — movendo para .bak.${ts}/`);
        for (const file of generated) {
          const src = path.join(root, file);
          const dst = path.join(root, `${file}.bak.${ts}`);
          if (pathExists(src)) {
            ensureDir(path.dirname(dst));
            fs.renameSync(src, dst);
          }
        }
        ok(`Movidos ${generated.length} arquivo(s). Retentando merge...`);
        attempt = tryMerge();
        if (attempt.ok) {
          ok('Merge concluido apos clobber.');
          mergeErr = '';
        } else {
          mergeErr = attempt.err;
        }
      } else if (userOwned.length === 0 && !clobberUntracked) {
        fail(`Merge abortou: ${conflictingPaths.length} arquivo(s) untracked seriam sobrescritos.`);
        info('Todos os arquivos afetados estão em paths gerados pelo framework (regenerados por sync:ides):');
        for (const p of generated.slice(0, 10)) info(`  - ${p}`);
        if (generated.length > 10) info(`  ... mais ${generated.length - 10}`);
        info('');
        info('Para auto-mover esses arquivos para .bak.<timestamp> antes do merge:');
        info(`  npm run gos:update -- --clobber-untracked${allowUnrelated ? ' --allow-unrelated' : ''}`);
        if (didStash) info('Stash preservado. Rode: git stash pop quando terminar.');
        process.exit(1);
      } else {
        // Misto — tem arquivos do usuário também → não clobberamos nada
        fail(`Merge abortou: arquivos untracked seriam sobrescritos.`);
        info(`${userOwned.length} arquivo(s) NÃO gerados pelo framework (revisar antes):`);
        for (const p of userOwned.slice(0, 10)) info(`  - ${p}`);
        info('Mova ou versione esses arquivos manualmente; depois retente.');
        if (didStash) info('Stash preservado.');
        process.exit(1);
      }
    }
  }

  if (!attempt.ok) {

    // Detecta histórias não relacionadas (comum em workspaces criados via `gos install`)
    if (/unrelated histories/i.test(mergeErr) && !allowUnrelated) {
      fail('Merge abortou: histórias não relacionadas entre HEAD e upstream.');
      info('Isto é comum quando o workspace foi bootstrappado via `gos install`');
      info('e nunca compartilhou commits com o repositório do framework.');
      info('');
      info('Para forçar o merge unindo as histórias (recomendado neste caso):');
      info(`  npm run gos:update -- --allow-unrelated`);
      info('');
      info('Alternativa segura (sobrescreve apenas .gos/ preservando seus arquivos):');
      info('  gos install --force');
      if (didStash) info('Stash preservado. Rode: git stash pop quando resolver.');
      process.exit(1);
    }

    // Checar conflitos de arquivo
    const conflictFiles = gitCapture(['diff', '--name-only', '--diff-filter=U'], { cwd: root });
    if (!conflictFiles) {
      fail('Merge falhou. Erro do git:');
      for (const line of mergeErr.split(/\r?\n/).filter(Boolean).slice(0, 6)) {
        console.log(`    ${line}`);
      }
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
  const ideSetupScript = path.join(root, '.gos', 'scripts', 'integrations', 'setup-ide-adapters.js');
  if (pathExists(ideSetupScript)) {
    log('Re-sincronizando IDE adapters...');
    runNode(ideSetupScript, { cwd: root, quiet: true });
    ok('IDE adapters atualizados.');
  }

  // 6b. Re-sync adapters no framework pai (a8z-framework)
  const parentSyncScript = path.join(root, '..', 'scripts', 'integrations', 'sync-gos-adapters.js');
  if (pathExists(parentSyncScript)) {
    log('Re-sincronizando adapters no framework pai...');
    runNode(parentSyncScript, { cwd: path.join(root, '..'), quiet: true });
    ok('Adapters atualizados no framework pai.');
  }

  // 7. Validar IDEs
  const ideCheckScript = path.join(root, '.gos', 'scripts', 'integrations', 'check-ide-compat.js');
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
  log('Validando workspace ganbatte-os...');
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
  const runtime = readJson(path.join(root, '.gos', 'manifests', 'g-os-runtime-manifest.json'));
  check('Runtime manifest g-os-runtime-manifest.json', !!runtime);

  // 4. Agents
  if (runtime && runtime.modules && runtime.modules.agents) {
    for (const agent of runtime.modules.agents) {
      const agentFile = path.join(root, '.gos', 'agents', 'profiles', `${agent}.md`);
      check(`Agent: ${agent}`, pathExists(agentFile));
    }
  }

  // 5. Skills
  const skillsRegistry = readJson(path.join(root, '.gos', 'skills', 'registry.json'));
  check('Skills registry', !!skillsRegistry);

  if (runtime && runtime.modules && runtime.modules.skills) {
    for (const skill of runtime.modules.skills) {
      const skillFile = path.join(root, '.gos', 'skills', skill, 'SKILL.md');
      check(`Skill: ${skill}`, pathExists(skillFile));
    }
  }

  // 6. IDE adapters
  const ideCheckScript = path.join(root, '.gos', 'scripts', 'integrations', 'check-ide-compat.js');
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

  // 8. Git remote upstream (allow origin as fallback, especially for CI/Internal dev)
  const remotes = gitCapture(['remote'], { cwd: root });
  const hasUpstream = remotes.includes(UPSTREAM_REMOTE);
  const hasOrigin = remotes.includes('origin');
  check(`Git remote "${UPSTREAM_REMOTE}" configurado`, hasUpstream || hasOrigin);

  // 9. Local dir (warn instead of fail if in CI)
  const hasLocalDir = pathExists(path.join(root, LOCAL_DIR));
  if (process.env.CI || process.env.GITHUB_ACTIONS) {
    if (hasLocalDir) {
      ok(`Diretorio ${LOCAL_DIR}/ existe`);
    } else {
      ok(`Diretorio ${LOCAL_DIR}/ (ignorado em CI)`);
    }
    checks++;
  } else {
    check(`Diretorio ${LOCAL_DIR}/ existe`, hasLocalDir);
  }

  // 10. Mode + upstream sanity (warnings, não falhas)
  const mode = detectMode(root);
  const branch = resolveUpstreamBranch(root);
  const isCi = Boolean(process.env.CI || process.env.GITHUB_ACTIONS);
  if (mode === 'framework') {
    if (isCi) {
      info('Upstream check ignorado em CI (sem credenciais para git ls-remote)');
    } else {
      const upstream = validateUpstream(root);
      if (upstream.ok) {
        ok(`Upstream alcançável (branch: ${branch})`);
      } else {
        warn(`Upstream inválido: ${upstream.error}`);
        if (upstream.remoteUrl) info(`URL atual: ${upstream.remoteUrl}`);
        info(`Corrija com: git remote set-url ${UPSTREAM_REMOTE} ${CORRECT_UPSTREAM_URL}`);
        issues++;
      }
    }
    checks++;
  }

  // 11. Stashes acumulados de updates falhos
  const goshStashes = listGosStashes(root);
  if (goshStashes.length > 1) {
    warn(`${goshStashes.length} stashes do gos-update acumulados (sintoma de updates falhos).`);
    info('Resgate com: npm run gos:rescue');
    issues++;
  } else if (goshStashes.length === 1) {
    info(`1 stash do gos-update presente: ${goshStashes[0].ref}`);
  }
  checks++;

  // 12. Report
  const updateLog = readJson(path.join(root, LOCAL_DIR, 'update-log.json'));
  const installLogData = readJson(path.join(root, LOCAL_DIR, 'install-log.json'));

  console.log('');
  console.log(`  Versao:         ${pkg ? pkg.version || VERSION : VERSION}`);
  console.log(`  Modo:           ${mode === 'framework' ? 'framework workspace' : 'projeto consumidor'}`);
  console.log(`  Branch dev:     ${branch}`);
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
// gos rescue — recuperar stashes acumulados de updates falhos
// ---------------------------------------------------------------------------

function cmdRescue(root, args) {
  log('Buscando stashes do gos-update...');
  const stashes = listGosStashes(root);
  if (stashes.length === 0) {
    ok('Nenhum stash do gos-update encontrado.');
    return;
  }

  console.log('');
  console.log(`  ${stashes.length} stash(es) auto-criado(s) pelo gos-update:`);
  console.log('');
  for (const s of stashes) {
    console.log(`    ${s.ref}  (${s.dateIso})`);
    const stat = gitCapture(['stash', 'show', '--stat', s.ref], { cwd: root });
    if (stat) {
      for (const line of stat.split(/\r?\n/).slice(0, 5)) {
        if (line.trim()) console.log(`      ${line}`);
      }
    }
    console.log('');
  }

  if (args.includes('--drop-all')) {
    warn(`Removendo todos os ${stashes.length} stashes...`);
    // Remove em ordem reversa porque os índices mudam
    for (let i = stashes.length - 1; i >= 0; i--) {
      git(['stash', 'drop', stashes[i].ref], { cwd: root, quiet: true });
    }
    ok('Todos os stashes do gos-update foram removidos.');
    return;
  }

  if (args.includes('--pop-latest')) {
    log(`Aplicando ${stashes[0].ref}...`);
    try {
      git(['stash', 'pop', stashes[0].ref], { cwd: root });
      ok('Stash aplicado.');
    } catch {
      warn('Conflito ao aplicar. Resolva manualmente e rode `git stash drop` quando terminar.');
    }
    return;
  }

  info('Comandos disponíveis:');
  info('  npm run gos:rescue -- --pop-latest    # aplica o stash mais recente');
  info('  npm run gos:rescue -- --drop-all      # remove todos (após revisão)');
  info('  git stash pop <ref>                   # aplica stash específico');
  info('  git stash drop <ref>                  # remove stash específico');
}

// ---------------------------------------------------------------------------
// gos version
// ---------------------------------------------------------------------------

function cmdVersion(root) {
  const pkg = readJson(path.join(root, 'package.json'), {});
  const localVersion = pkg.version || VERSION;
  const mode = detectMode(root);
  const branch = resolveUpstreamBranch(root);

  console.log(`ganbatte-os v${localVersion}`);
  console.log(`  modo: ${mode === 'framework' ? 'framework workspace (fork/clone do g-os)' : 'projeto consumidor'}`);

  if (mode === 'consumer') {
    info('Para checar a última versão publicada do framework:');
    info('  npm view ganbatte-os version');
    info('Para atualizar o framework dentro do seu projeto:');
    info('  gos install --force');
    return;
  }

  // Modo framework: checar commits novos no upstream
  const upstream = validateUpstream(root);
  if (!upstream.ok) {
    warn(`Upstream inválido: ${upstream.error}`);
    if (upstream.remoteUrl) info(`URL atual: ${upstream.remoteUrl}`);
    info(`Corrija com: git remote set-url ${UPSTREAM_REMOTE} ${CORRECT_UPSTREAM_URL}`);
    return;
  }

  try {
    execFileSync('git', ['fetch', UPSTREAM_REMOTE, branch], {
      encoding: 'utf8', stdio: 'pipe', cwd: root
    });
    const behind = gitCapture(
      ['rev-list', '--count', `HEAD..${UPSTREAM_REMOTE}/${branch}`],
      { cwd: root }
    );

    if (behind && behind !== '0') {
      console.log(`\n  ${behind} commit(s) novo(s) em ${UPSTREAM_REMOTE}/${branch}.`);
      console.log('  Atualize com: npm run gos:update\n');
    } else {
      ok(`Voce esta na versao mais recente de ${UPSTREAM_REMOTE}/${branch}.`);
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

    case 'rescue':
      cmdRescue(root, args.slice(1));
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
ganbatte-os CLI v${VERSION}

Comandos:
  gos install   Instalar G-OS no diretorio atual (via npx ou global)
  gos init      Setup pos-clone (remote, dirs, IDEs)
  gos update    Atualizar do upstream (apenas em fork/clone do g-os)
  gos rescue    Listar/recuperar stashes acumulados de updates falhos
  gos doctor    Validar integridade do workspace
  gos version   Mostrar versao, modo (framework/consumer) e atualizacoes
  gos help      Exibir esta ajuda

Flags:
  --force               Sobrescrever arquivos existentes (install/init)
  --no-stash            Nao fazer stash automatico (update)
  --allow-unrelated     Permitir merge de histórias não relacionadas (update)
  --clobber-untracked   Mover untracked files (em paths regenerados) para
                        .bak.<timestamp> antes do merge (update)
  --pop-latest          Aplicar stash mais recente (rescue)
  --drop-all            Remover todos os stashes do gos-update (rescue)

Env:
  GOS_UPSTREAM_BRANCH   Override da branch a ser pulled (default lê de
                        .gos/config.json#defaultBranches.development)

Exemplos:
  npx -p ganbatte-os gos install
  node .gos/scripts/cli/gos-cli.js init
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
