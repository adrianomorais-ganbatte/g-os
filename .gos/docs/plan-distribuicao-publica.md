# Distribuicao Publica do G-OS via GitHub

> **Data:** 2026-04-01 | **Status:** Aprovado | **Revisor:** Douglas Oliveira

---

## Objetivo

Tornar o G-OS publico e distribuivel via GitHub. Sem NPM private packages.

```bash
# Instalacao
git clone https://github.com/imdouglasoliveira/g-os.git meu-workspace
cd meu-workspace
node scripts/cli/gos-cli.js init

# Atualizacao
npm run gos:update
```

## Arquitetura

```
GitHub Publico --> git clone --> Workspace Local --> gos init --> Pronto
                                                 --> gos update --> Atualizado
```

### Zonas de arquivos

| Zona | Update sobrescreve? | Exemplos |
|------|---------------------|----------|
| Framework-managed | Sim (auto-resolve) | `agents/`, `skills/`, `scripts/` |
| User-owned | Nunca | `packages/`, `config.json`, `data/clients/` |
| Hibrido | Git merge padrao | `CLAUDE.md` |

---

## T-001 — CLI `gos-cli.js`

P0 | 8 pts | backend | `scripts/cli/gos-cli.js` (NOVO)

CLI zero-dependency em Node.js para gerenciar o workspace G-OS. Alicerce de toda a distribuicao — todos os outros scripts dependem dele. Modelado no `a8z-cli.js`, adaptado para o modelo git-based.

Diferente do a8z-framework que se instala DENTRO de projetos via NPM, o G-OS E o workspace. O CLI configura o ambiente pos-clone e gerencia updates via git.

### Comandos

| Comando | O que faz |
|---------|-----------|
| `gos init` | Setup pos-clone |
| `gos update` | Fetch + merge de upstream/main |
| `gos doctor` | Validar integridade |
| `gos version` | Mostrar versao + checar atualizacao |

### Implementacao

**1)** Criar `scripts/cli/gos-cli.js` com shebang `#!/usr/bin/env node`

**2)** Utilitarios base (copiar padrao do `a8z-cli.js` linhas 1-150):
- `readJson()`, `writeJson()`, `ensureDir()`, `pathExists()`
- `log()`, `info()`, `success()`, `warn()`, `fail()` com cores ANSI
- `getFlagValue()` para parsing de `--flag=value`
- `exec()` wrapper para `child_process.execSync`

**3)** `cmdInit()`:
- Validar Node.js >= 18 (`process.version`)
- Checar se ja inicializado (`.gos-local/install-log.json` existe)
- Renomear remote `origin` para `upstream`: `git remote rename origin upstream`
- Criar `.gos-local/` com subdirs: `worktrees/`, `outputs/`, `task-queue/`
- Criar `packages/` com `.gitkeep` se nao existir
- Chamar `setup-ide-adapters.js` via `require()` ou `execSync`
- Chamar `check-ide-compat.js`
- Merge `.gitignore` (adicionar entradas de `gos-install-manifest.json`)
- Escrever `.gos-local/install-log.json`:
  ```json
  { "version": "0.2.0", "initializedAt": "2026-04-01T...", "nodeVersion": "v22.x" }
  ```
- Exibir sucesso + proximos passos

**4)** `cmdUpdate()`:
- Checar `git status --porcelain` — se dirty, rodar `git stash`
- `git fetch upstream main`
- Ler manifest para saber quais paths sao framework-managed
- `git merge upstream/main --no-edit`
- Conflitos em paths framework-managed: `git checkout --theirs <path>` + `git add <path>`
- Conflitos em paths user-owned: abortar merge, pop stash, instruir usuario
- Re-rodar `setup-ide-adapters.js` e `check-ide-compat.js`
- Pop stash se fez stash
- Logar em `.gos-local/update-log.json`
- Mostrar changelog: `git log --oneline <commit-anterior>..HEAD`

**5)** `cmdDoctor()`:
- Ler `manifests/gos-install-manifest.json`
- Validar cada path em `requiredPaths` existe
- Validar `agents/profiles/index.json` — cada agent listado tem arquivo
- Validar `skills/registry.json` — cada skill listada tem SKILL.md
- Checar IDE adapters via `check-ide-compat.js`
- Reportar versao de `package.json` e ultimo update

**6)** `cmdVersion()`:
- Ler versao de `package.json`
- Tentar `git fetch upstream main --dry-run` para checar commits novos
- Se houver: "Nova versao disponivel. Rode: npm run gos:update"

**7)** `main()` com `switch(command)` dispatch

### Aceite

- DADO repo clonado QUANDO rodar `gos init` ENTAO remote renomeado, dirs criados, IDEs sincronizadas
- DADO workspace inicializado QUANDO rodar `gos doctor` ENTAO checks passam sem erro
- DADO commits novos no upstream QUANDO rodar `gos update` ENTAO merge acontece e IDEs re-sincronizadas
- DADO mudancas locais QUANDO rodar update ENTAO stash automatico + restaurado apos merge

### Referencia

- `e:\Github\.a8z-framework\scripts\cli\a8z-cli.js` — linhas 1-150 (utils), 1598-1731 (init), 1737-1820 (update)
- `scripts/integrations/setup-ide-adapters.js`
- `scripts/integrations/check-ide-compat.js`

Sem dependencias. DoD: CLI roda sem erros, 4 comandos funcionam, zero deps externas.

---

## T-002 — Install Manifest

P0 | 2 pts | backend | `manifests/gos-install-manifest.json` (NOVO)

Manifest JSON que classifica arquivos do workspace em zonas (framework-managed vs user-owned). O CLI usa isso para decidir como resolver conflitos durante updates — e o contrato entre framework e usuario.

```json
{
  "version": "0.2.0",
  "runtime": "gos-design-delivery",
  "preserveUserContent": [
    "packages/", "data/sprints/", "data/clients/", ".gos-local/", "config.json"
  ],
  "frameworkManaged": [
    "agents/", "skills/", "squads/", "templates/", "prompts/",
    "integrations/", "scripts/", "manifests/", "docs/", "playbooks/",
    "AGENTS.md", "CLAUDE.md", "GEMINI.md"
  ],
  "requiredPaths": [
    "agents/profiles/index.json", "skills/registry.json",
    "manifests/g-os-runtime-manifest.json", "scripts/cli/gos-cli.js",
    "scripts/integrations/setup-ide-adapters.js",
    "scripts/integrations/check-ide-compat.js", "AGENTS.md", "CLAUDE.md"
  ],
  "gitignoreEntries": [
    ".gos-local/", ".temp/", ".backups/",
    "packages/*/figma-make/", "packages/*/node_modules/",
    ".env", ".env.local", ".env.*.local"
  ]
}
```

Validar: `node -e "require('./manifests/gos-install-manifest.json')"`

Sem dependencias. DoD: JSON valido, paths conferem com estrutura real.

---

## T-003 — Atualizar package.json

P0 | 1 pt | backend | `package.json` (EDITAR)

Remover `"private": true`, adicionar `bin` entry, scripts `gos:*`, e metadata publica.

1. Remover `"private": true`
2. Alterar version para `"0.2.0"`
3. Adicionar `"bin": { "gos": "scripts/cli/gos-cli.js" }`
4. Substituir scripts:
   ```json
   {
     "gos:init": "node scripts/cli/gos-cli.js init",
     "gos:update": "node scripts/cli/gos-cli.js update",
     "gos:doctor": "node scripts/cli/gos-cli.js doctor",
     "gos:version": "node scripts/cli/gos-cli.js version",
     "clickup": "node scripts/tools/clickup.js",
     "sync:ides": "node scripts/integrations/setup-ide-adapters.js",
     "check:ides": "node scripts/integrations/check-ide-compat.js",
     "doctor": "node scripts/cli/gos-cli.js doctor"
   }
   ```
5. Adicionar: `"repository"`, `"license": "MIT"`, `"author": "Douglas Oliveira"`

Depende de T-001. DoD: JSON valido, scripts rodam, `private` removido.

---

## T-004 — LICENSE

P1 | 1 pt | general | `LICENSE` (NOVO)

Criar arquivo MIT License com copyright Douglas Oliveira 2026. Conteudo padrao MIT.

Sem dependencias. DoD: Arquivo na raiz, GitHub detecta como MIT.

---

## T-005 — README.md publico

P1 | 3 pts | general | `README.md` (REESCREVER)

Reescrever para audiencia publica — primeira impressao do repositorio.

**Secoes obrigatorias:**
1. Header com tagline + badges (MIT, Node >= 18)
2. O que e o G-OS (2 paragrafos)
3. Quick Start (3 comandos: clone, cd, init)
4. Modulos incluidos — tabela dos 7 agents, 13 skills, 3 squads (de `g-os-runtime-manifest.json`)
5. Atualizando (`npm run gos:update`)
6. IDEs suportadas (Claude Code, Codex, Gemini, OpenCode, Antigravity, Cursor, KiloCode)
7. Estrutura do workspace (arvore de diretorios)
8. Scripts disponiveis (tabela)
9. Licenca MIT

Acentos pt-BR corretos. Zero conteudo privado.

Depende de T-001. DoD: README completo, renderiza no GitHub, nenhum dado privado.

---

## T-006 — .gitignore

P1 | 1 pt | general | `.gitignore` (EDITAR)

Adicionar ao final:
```
# G-OS local (nao versionado)
.gos-local/

# Conteudo de usuario
packages/*/node_modules/
packages/*/figma-make/
```

Verificar que `.env` e `.env.local` ja estao listados.

Sem dependencias. DoD: entradas adicionadas, `git status` nao mostra `.gos-local/`.

---

## T-007 — Workflow PR Check

P2 | 2 pts | devops | `.github/workflows/pr-check.yml` (NOVO)

```yaml
name: PR Check
on:
  pull_request:
    branches: [beta, main]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - name: Doctor check
        run: node scripts/cli/gos-cli.js doctor
      - name: IDE compatibility check
        run: node scripts/integrations/check-ide-compat.js
```

Depende de T-001. DoD: YAML valido, roda em PRs.

---

## T-008 — Atualizar dev-to-beta

P2 | 1 pt | devops | `.github/workflows/dev-to-beta.yml` (EDITAR)

Adicionar steps ANTES do "Merge dev into beta":
```yaml
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '22'
      - name: Doctor check
        run: node scripts/cli/gos-cli.js doctor
```

Depende de T-001. DoD: doctor roda antes do merge.

---

## T-009 — Sanitizar repo

P0 | 3 pts | general

Remover conteudo de clientes e dados privados ANTES de tornar publico. Task de seguranca.

**Remover:**
```bash
rm -rf packages/fractus/ packages/cursoeduca/ packages/cnpq/ packages/compomente-vue/
rm -rf supabase/ others/
rm -f links.txt instrucoes.txt stacks.txt requirements.txt
```

**Criar:** `packages/.gitkeep` + `packages/README.md` (explicando que projetos ficam ali)

**Auditar segredos:**
```bash
grep -rn "CLICKUP_TOKEN\|API_KEY\|SECRET\|PASSWORD\|sk-\|ghp_" . --include="*.js" --include="*.json" --include="*.yaml"
git ls-files | grep -i env
```

**Git history:** considerar `git filter-repo` se houver segredos no historico.

Sem dependencias. DoD: zero conteudo privado, zero segredos.

---

## T-010 — Replicar em .G-OS/

P1 | 2 pts | general

Copiar todos os arquivos novos/modificados de `E:\Github\Ganbatte` para `e:\Github\.a8z-framework\.G-OS\`.

```bash
# Novos
cp scripts/cli/gos-cli.js           .G-OS/scripts/cli/gos-cli.js
cp manifests/gos-install-manifest.json .G-OS/manifests/gos-install-manifest.json
cp LICENSE                           .G-OS/LICENSE
cp .github/workflows/pr-check.yml   .G-OS/.github/workflows/pr-check.yml

# Modificados
cp package.json                      .G-OS/package.json
cp README.md                         .G-OS/README.md
cp .gitignore                        .G-OS/.gitignore
cp .github/workflows/dev-to-beta.yml .G-OS/.github/workflows/dev-to-beta.yml
```

Validar com `diff` entre os dois repos. NAO commitar em `.G-OS/`.

Depende de T-001 a T-009. DoD: diff confirma paridade.

---

## Ordem

```
Fase 1 (paralelo): T-001, T-002, T-004, T-006, T-009
Fase 2:            T-003, T-005
Fase 3:            T-007, T-008
Fase 4 (final):    T-010

Total: 10 tasks, 25 story points
```

## Checklist final

```bash
node scripts/cli/gos-cli.js doctor
node scripts/cli/gos-cli.js version
npm run check:ides
grep -rn "CLICKUP_TOKEN\|API_KEY\|SECRET\|sk-\|ghp_" . --include="*.js" --include="*.json"
diff -rq . e:/Github/.a8z-framework/.G-OS/ --exclude=node_modules --exclude=.git --exclude=packages
```
