# Relatorio de Testes - ganbatte-os v0.2.22

**Data:** 2026-04-20
**Executor:** Douglas (Claude Code, auto mode)
**Ambiente:** Windows 11 Pro, Node v22.x, npm v11, pasta E:\Github\test-ganbatte-install
**Objetivo:** reproduzir o cenario do relatorio de Adriano (.backups/ganbatte-os-install-report.md), validar fixes aplicados em v0.2.22, documentar o que ainda falha.

---

## 1. Resumo executivo

- Sequencia completa executada: push dev -> automerge beta -> merge manual beta/main -> publish automatico v0.2.22.
- Tarball publicado esta correto (220 arquivos, 214 em .gos/, bin presente no package.json interno).
- Bug principal do relatorio original permanece: npx ganbatte-os falha com "could not determine executable to run" mesmo na v0.2.22.
- Causa raiz confirmada: npm registry nao preserva os campos bin e files na metadata ingerida. Isso quebra npx e a criacao de shims em algumas rotas de install.
- Identificados 6 bugs distintos, listados abaixo com evidencia, categoria e criticidade.

---

## 2. Sequencia de comandos executada

```
# 1. Commit e push na dev
cd E:/Github/.G-OS
git add .npmignore .github/workflows/publish.yml .env-example
git rm trigger.txt
git commit -m "fix(publish): add .npmignore and tarball/metadata validation"
git push upstream dev              # trigger dev-to-beta.yml

# 2. Automerge dev -> beta (confirmado: upstream/beta @ 6695ba74)

# 3. Merge beta -> main
git checkout main
git merge upstream/beta --no-edit
git push upstream main             # trigger publish.yml -> v0.2.22

# 4. Ambiente de teste
mkdir E:/Github/test-ganbatte-install
cd E:/Github/test-ganbatte-install
npm init -y
npm install ganbatte-os            # local install
npm install -g ganbatte-os@0.2.22  # global install
npm cache clean --force
npx ganbatte-os version            # teste canonico do bug
gos install --force                # workaround
```

---

## 3. Bugs encontrados

### Bug 1 (CRITICO) - Registry metadata sem bin e files

**Categoria:** erro do proprio ganbatte-os (infra npm publish)

**Evidencia:**
```
npm view ganbatte-os@0.2.22 bin --json     # retorna vazio
npm view ganbatte-os@0.2.22 files --json   # retorna vazio
# mas o tarball tem:
tar -xzf ganbatte-os-0.2.22.tgz
cat package/package.json | grep bin
#   "bin": { "ganbatte-os": ".gos/scripts/cli/gos-cli.js", "gos": "..." }
```

Tarball tem campos corretos, mas a registry persiste metadata sem eles.

**Impacto:**
- npx ganbatte-os falha com "could not determine executable to run" (reproduzido em pasta limpa apos cache clean)
- node_modules/.bin/ nao e criado em install local (sem shim)
- package-lock.json do pacote instalado tambem fica sem bin

**Causa provavel:** files: [".gos/"] com barra final. Algumas versoes do npm registry tratam dotfolder + trailing slash como "diretorio virtual vazio" e invalidam bin cujo target esta dentro. A ausencia historica de .npmignore piora (fallback para .gitignore com patterns como */AGENTS.md).

**Fix para v0.2.23:**
1. Trocar files: [".gos/"] por files: [".gos/**/*", "AGENTS.md", "CLAUDE.md", "GEMINI.md", "README.md", "LICENSE"]
2. Manter o .npmignore recem-adicionado
3. Apos publish, validar npm view ganbatte-os@0.2.23 bin --json retorna JSON nao-vazio

---

### Bug 2 (CRITICO) - Shim ganbatte-os nao e criado no install global

**Categoria:** erro do proprio ganbatte-os (colisao em bin)

**Evidencia:**
```
npm install -g ganbatte-os@0.2.22
which gos             # OK: /c/nvm4w/nodejs/gos
ganbatte-os version   # FAIL: command not found
ls C:/nvm4w/nodejs/ | grep gos
#   gos, gos.cmd, gos.ps1 - nao tem ganbatte-os
```

**Causa provavel:** ambos entries em bin apontam para o mesmo arquivo .gos/scripts/cli/gos-cli.js. Em Windows, npm cria shim para o primeiro e ignora silenciosamente o duplicado por causa do mesmo target.

**Impacto:** comando ganbatte-os usado na documentacao, README e help interno nao existe. Usuario so consegue invocar via gos.

**Fix:** remover entry ganbatte-os de bin, deixando apenas gos. Atualizar docs.

---

### Bug 3 (ALTO) - setup-ide-adapters.js nao encontrado durante init

**Categoria:** erro de configuracao no CLI (path resolution)

**Evidencia:**
```
$ gos install --force
  v  Diretorio .gos-local/ criado com subdirs.
  v  Diretorio packages/ criado.
  !  setup-ide-adapters.js nao encontrado. Pulando sync de IDEs.
```

Mas o arquivo EXISTE em node_modules/ganbatte-os/.gos/scripts/integrations/setup-ide-adapters.js.

**Causa provavel:** CLI usa path relativo que assume execucao no repo fonte, nao em node_modules/ganbatte-os/. Path resolution precisa usar __dirname.

**Impacto:** IDE adapters nao sao sincronizados no init via npm. Integracao Claude/Cursor/Gemini nao e configurada.

**Fix:** em .gos/scripts/cli/gos-cli.js, usar path.join(__dirname, '../integrations/setup-ide-adapters.js') ou require.resolve.

---

### Bug 4 (MEDIO) - Versao hardcoded no CLI

**Categoria:** erro do proprio ganbatte-os

**Evidencia:**
```
$ gos install --force
  Versao:     0.2.2        # deveria ser 0.2.22
```

**Causa:** string "0.2.2" hardcoded em vez de ler de package.json.

**Impacto:** diagnostico enganoso. Dificulta suporte.

**Fix:** substituir hardcode por require('../../../package.json').version.

---

### Bug 5 (MEDIO) - git remote add em pasta sem .git

**Categoria:** erro de configuracao no CLI

**Evidencia:**
```
fatal: not a git repository (or any of the parent directories): .git
  !  Nao foi possivel adicionar o remote "upstream". Configure manualmente.
```

**Causa:** fluxo assume .git ja inicializado.

**Impacto:** mensagem de erro do git vaza para stdout do usuario, parece falha critica.

**Fix:** adicionar check fs.existsSync('.git') antes de tentar git remote add.

---

### Bug 6 (BAIXO) - Pasta .agent/ vista nos prints nao e criada pelo init

**Categoria:** erro de integracao ou documentacao

**Evidencia:** screenshots do fractus-workspace mostram .agent/ na raiz; meu teste criou apenas .gos/, .gos-local/, packages/, .gitignore.

**Causa provavel:** .agent/ e criado por outro flow (Gemini Antigravity ou IDE adapter especifico).

**Impacto:** baixo. Precisa documentar o que cria essa pasta.

**Fix:** documentar em README.

---

## 4. Categorizacao

| Bug | Categoria | Momento | Criticidade |
|-----|-----------|---------|-------------|
| 1 - Registry sem bin/files | ganbatte-os (publish) | Pos-publish | CRITICO |
| 2 - Shim ganbatte-os ausente | ganbatte-os (bin config) | Install global | CRITICO |
| 3 - setup-ide-adapters path | Config do CLI | Init | ALTO |
| 4 - Versao hardcoded | ganbatte-os | Runtime | MEDIO |
| 5 - git remote em pasta sem .git | Config do CLI | Init | MEDIO |
| 6 - .agent/ nao documentada | Integracao/docs | Setup | BAIXO |

Fora do escopo do repo G-OS (problemas locais do relator original):
- ACL bloqueada no workspace
- Cache npm corrompido
- Conflito npm vs pnpm

---

## 5. Plano de correcao (v0.2.23)

### Prioridade 1 - desbloquear npx ganbatte-os
1. package.json: trocar files: [".gos/"] por files: [".gos/**/*", ...todos os .md, LICENSE]
2. Remover entry ganbatte-os de bin, deixando apenas gos (Bug 2)
3. Rodar npm pack --dry-run, validar 220+ arquivos incluindo .gos/scripts/cli/gos-cli.js
4. Push dev -> beta -> main -> validar npm view ganbatte-os@0.2.23 bin --json retorna {"gos":"..."}

### Prioridade 2 - corrigir paths do CLI
5. .gos/scripts/cli/gos-cli.js:
   - Versao de package.json em vez de hardcode (Bug 4)
   - __dirname na resolucao de setup-ide-adapters.js (Bug 3)
   - Check de .git antes de git remote add (Bug 5)

### Prioridade 3 - documentacao
6. README sem mencoes a ganbatte-os como comando (so gos)
7. Documentar origem de .agent/ (Bug 6)

### Prioridade 4 - gate no CI
8. O step "Verify registry metadata post-publish" ja adicionado em v0.2.22 vai falhar o job se o bug persistir em publishes futuros - e o canario automatico.

---

## 6. Sequencia recomendada de implementacao

```
Passo A: Fix package.json (files + bin)            -> 1 commit em dev
Passo B: Republish via fluxo normal (dev/beta/main)
Passo C: Validar npm view bin != vazio             -> se falhar, voltar ao Passo A
Passo D: Fix CLI paths (bugs 3, 4, 5)              -> 1 commit em dev
Passo E: Republish (v0.2.24)
Passo F: Atualizar README (bugs 2, 6)              -> 1 commit em dev
Passo G: Republish (v0.2.25) ou batch com E
Passo H: Smoke test em VM limpa (secao 8)
```

---

## 7. Riscos e validacoes por passo

| Passo | Risco | Validacao pos-correcao |
|-------|-------|------------------------|
| A/B | Mudanca em files pode excluir algo esperado | npm pack --dry-run conta 220+ arquivos |
| C | Registry npm pode continuar cortando metadata | Se npm view bin seguir vazio apos v0.2.23, abrir ticket no npm support |
| D/E | CLI pode quebrar em dev mode (__dirname resolution) | Testar gos install --force em pasta limpa e em worktree |
| F/G | README desatualizado em forks | Grep por "npx ganbatte-os" antes e depois |
| H | Windows file locks podem mascarar bugs | Executar em container Linux limpo |

---

## 8. Checklist final de re-teste

```
# Container Linux limpo
docker run --rm -it node:22 bash -c '
  npm install -g ganbatte-os@latest
  which gos
  gos version
  mkdir /tmp/ws && cd /tmp/ws
  git init
  gos install --force
  test -d .gos && test -d .gos-local && test -d packages
  ls .gos/scripts/cli/gos-cli.js
  gos doctor
'

# Windows local
cd E:/tmp
rm -rf ganbatte-fresh
mkdir ganbatte-fresh && cd ganbatte-fresh
npm cache clean --force
npm init -y
npm install ganbatte-os
npx ganbatte-os version        # DEVE funcionar
./node_modules/.bin/gos install --force
ls -la .gos/
```

Criterios de aceite:
- [ ] npm view ganbatte-os@latest bin --json retorna JSON nao-vazio
- [ ] npx ganbatte-os <cmd> executa em pasta limpa apos cache clean
- [ ] npm install -g ganbatte-os cria shim gos
- [ ] gos install nao emite "setup-ide-adapters.js nao encontrado"
- [ ] gos version imprime a versao real do package.json
- [ ] gos install em pasta sem .git nao polui output com erro do git
- [ ] Documentacao ou init cria (ou explica ausencia de) .agent/

---

## 9. Estado atual das acoes ja executadas nesta sessao

Commits em dev (ja mergeados em main, ja publicados como v0.2.22):

- .npmignore criado
- .github/workflows/publish.yml com 3 steps novos:
  - Validate tarball contents (passa em v0.2.22)
  - Verify bin targets exist (passa em v0.2.22)
  - Verify registry metadata post-publish (FALHA em v0.2.22 - canario funcionando)

Pastas e commits locais:
- main sincronizado com upstream (commit de merge 14b9581)
- dev e beta tambem sincronizados
- Pasta E:/Github/test-ganbatte-install mantida para re-testes

---

**Fim do relatorio.**
