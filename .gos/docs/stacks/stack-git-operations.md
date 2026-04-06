# Stack: Git Operations — SSH Identity + Quality Gate

**Ref:** `docs/plan/plan-git-operations.md`
**Total:** 9 tasks, 5 waves, ~31 pts

---

## Wave 1 — Fundacao (sem dependencias)

### T-101: Criar skill git-ssh-setup (5 pts)

Criar `skills/git-ssh-setup/SKILL.md` com frontmatter padrao (name, description, use-when, do-not-use-for, metadata category workflow-automation).

Fluxo da skill:
1. Detectar framework (G-OS via `.gos-local/`, .a8z via `.a8z/`)
2. Checar se `ssh-identity.json` ja existe
3. Extrair alias do remote URL (`git remote get-url origin`)
4. Validar conexao (`ssh -T git@<alias>`)
5. Perguntar nome/email ao usuario
6. Gravar `ssh-identity.json` no dir local gitignored

Regras de seguranca embutidas: alias real mascarado como `[configured-ssh-identity]`.

Replicar em: `.G-OS/skills/git-ssh-setup/SKILL.md` e `Ganbatte/skills/git-ssh-setup/SKILL.md`.

**Aceite:** Arquivo existe nos 3 repos. Frontmatter valido. Grep por alias reais retorna zero.

---

### T-102: Criar playbook ssh-multi-account-setup (3 pts)

Criar `playbooks/ssh-multi-account-setup.md` baseado no GUIA-SSH-MULTIPLAS-CONTAS.md, genericizado com `<placeholder>` ao inves de nomes reais.

6 fases: Key Generation → SSH Config → GitHub Registration → URL Rewrite → Validation → Workspace Config.

Replicar em: `.G-OS/playbooks/` e `Ganbatte/playbooks/`.

**Aceite:** Arquivo existe. Grep por `imdouglas|gabriel|fappssh|moradigna|adriano` retorna zero.

---

### T-103: Criar script pre-commit-validate.js (5 pts)

Criar `scripts/hooks/pre-commit-validate.js` — Node.js zero-dependency.

Funcionalidades:
- Detectar package manager via lockfiles
- Se `tsconfig.json` existe: rodar `npx tsc --noEmit`
- Se package.json tem script test/test:e2e/test:run: rodar testes (com `--run` para vitest)
- Output JSON: `{ passed, checks: [{name, status, output, duration}], timestamp }`
- Flags: `--json`, `--skip-tests`, `--skip-tsc`
- Usar `execFileSync` (sem shell injection)
- Exit 0 se OK, exit 1 se falha

Replicar em: `.G-OS/scripts/hooks/` e `Ganbatte/scripts/hooks/`.

**Aceite:** `node scripts/hooks/pre-commit-validate.js --json` retorna JSON valido. Exit code correto.

---

## Wave 2 — Integracao (depende de Wave 1)

### T-104: Aprimorar skill git-commit (5 pts)

Editar `skills/git-commit/SKILL.md`:

1. Corrigir linha com alias hardcoded → referenciar `ssh-identity.json`
2. Adicionar secao "Pre-Commit Quality Gate" antes do workflow automatico
3. Adicionar secao "SSH Identity Validation (Pre-Push)" apos workflow
4. Adicionar regra PROIBIDO: expor alias SSH
5. Atualizar checklist com "tsc passa?" e "testes passam?"
6. Atualizar workflow automatico com passo 0 (quality gate) e passo 5 (SSH validation)

**Aceite:** Skill menciona pre-commit-validate.js. Grep por `github-imdouglas` retorna zero.

---

### T-105: Aprimorar agent devops (2 pts)

.a8z-OS (`agents/profiles/devops.md`):
- Adicionar core_principle: SSH Identity Protection
- Adicionar comandos: ssh-setup, pre-commit-validate
- Adicionar skill dependency: git-ssh-setup

G-OS (`.G-OS/agents/profiles/devops.md`):
- Expandir com linhas sobre SSH e quality gate

Replicar G-OS em Ganbatte.

**Aceite:** devops agent lista ssh-setup como comando.

---

## Wave 3 — Squad (depende de Wave 1+2)

### T-106: Criar squad git-operations (5 pts)

Criar em `squads/git-operations/`:
- `squad.yaml` — agents devops+dev, routing matrix com 4 categorias
- `workflows/wf-ssh-setup.yaml` — 5 fases (detect → key-check → configure → validate → identity)
- `workflows/wf-safe-commit.yaml` — 5 fases (validate → pre-check → stage → commit → safe-push)
- `README.md` — documentacao da squad

Replicar em `.G-OS/squads/git-operations/` e `Ganbatte/squads/git-operations/`.

**Aceite:** Arquivos existem nos 3 repos. YAML valido.

---

## Wave 4 — Registros (depende de todas)

### T-107: Atualizar registries (2 pts)

- `.a8z-framework/skills/registry.json`: adicionar entrada git-ssh-setup
- `.G-OS/skills/registry.json`: adicionar entrada
- `Ganbatte/skills/registry.json`: adicionar entrada
- Rodar `npm run sync:skills-registry` se disponivel

**Aceite:** `jq '.skills[] | select(.slug=="git-ssh-setup")' skills/registry.json` retorna resultado.

---

### T-108: Atualizar manifestos (2 pts)

- `manifests/dev-runtime-manifest.json`: adicionar copyMap git-ssh-setup
- `.G-OS/manifests/g-os-runtime-manifest.json`: adicionar skill git-ssh-setup e squad git-operations
- `.G-OS/manifests/gos-install-manifest.json`: ja coberto por `skills/` e `scripts/` no frameworkManaged

Replicar G-OS manifestos em Ganbatte.

**Aceite:** `npm run doctor` passa.

---

## Wave 5 — Documentacao

### T-109: Criar plano e stack (2 pts)

- Criar `docs/plan/plan-git-operations.md` com visao geral
- Criar `docs/stacks/stack-git-operations.md` com todas as tasks

Replicar em `.G-OS/docs/` e `Ganbatte/docs/`.

**Aceite:** Arquivos existem nos 3 repos.

---

## Verificacao Final

1. `grep -rn "imdouglas\|gabriel\|fappssh\|moradigna\|adriano" skills/git-ssh-setup/ playbooks/ssh-multi-account-setup.md squads/git-operations/` — zero matches
2. `npm run doctor` passa
3. `.gos-local/` e `.a8z/local/` estao no .gitignore
4. `node scripts/hooks/pre-commit-validate.js --json` retorna JSON valido
5. Diff entre `.G-OS/` e Ganbatte confirma paridade
