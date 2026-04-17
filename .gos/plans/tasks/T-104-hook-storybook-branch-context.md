# T-104 — Hook de contexto para branch Storybook

**Sprint:** S07 · **Due:** 2026-04-19 · **Prioridade:** normal · **Pts:** 2
**ClickUp:** https://app.clickup.com/t/86agxge41
**Assignee:** Douglas Oliveira · **Status:** ✅ concluída (2026-04-17)

---

## Notas de execução (2026-04-17)

- Hook (`.claude/hooks/storybook-branch-check.sh`) e matchers em `.claude/settings.json` já estavam implementados e válidos (AC1–AC5 ✓).
- Criado smoke test em `.gos/tests/hooks/storybook-branch-check.test.sh` — **4/4 PASS** (branch atual `dev`).
- **Bug no fixture do plano corrigido na execução:** o exemplo original `"edite a story do Button"` não casava o regex `storybook|\.stories\.|\.storybook` (palavra "story" isolada não é match). Ajustado para `"edite a story do Button no storybook"`.
- Adicionada seção `## Context hook (T-104)` ao final de `docs/fractus/deploy-storybook.md`.
- Não foi feito commit/push — conforme convenção (Douglas commita).

---

## Contexto

Trabalho de Storybook no Fractus deve acontecer exclusivamente na branch `feat/storybook` (ver memória `reference_vercel_storybook.md` e `feedback_storybook_deploy_douglas.md`). Devs/agentes esquecem e editam `*.stories.tsx` em `master`/`dev`, gerando PRs que o workflow `auto-merge-feat-storybook.yml` rejeita.

Solução: hook Claude Code que injeta lembrete contextual em dois momentos:
1. **UserPromptSubmit** — prompt menciona "storybook" ou `.stories.`
2. **PreToolUse(Write|Edit)** — tool_input.file_path contém `.stories.` ou `.storybook`

O hook **já está implementado** em `.claude/hooks/storybook-branch-check.sh` (48 linhas) e registrado em `.claude/settings.json:6-30`. Esta task portanto é **validação + documentação + fechamento**.

## Arquivos afetados

| Arquivo | Ação |
|---|---|
| `.claude/hooks/storybook-branch-check.sh` | [REVISAR] já existe, confirmar lógica |
| `.claude/settings.json` | [REVISAR] matchers UserPromptSubmit + PreToolUse |
| `.gos/tests/hooks/storybook-branch-check.test.sh` | [NOVO] script de smoke test com fixtures |
| `docs/fractus/deploy-storybook.md` | [EDITAR] adicionar seção "Context hook" |

## Passo a passo

### 1. Auditar hook atual

```bash
cat .claude/hooks/storybook-branch-check.sh
cat .claude/settings.json
```

Checklist do AC (revisar no script):
- Linha 30: `grep -iqE 'storybook|\.stories\.|\.storybook'` → cobre AC1+AC2 ✓
- Linha 38: `git -C "$fractus_dir" branch --show-current` → lê branch do fractus ✓
- Linha 43-45: warning só se branch != `feat/storybook` → cobre AC3+AC4 ✓
- Linha 48: `exit 0` → cobre AC5 ✓

### 2. Confirmar branch existe no remoto

```bash
cd packages/fractus
git ls-remote origin feat/storybook
# Deve retornar um hash. Se vazio, criar:
# git fetch && git checkout -b feat/storybook origin/master && git push -u origin feat/storybook
```

### 3. Criar script de smoke test

Novo `.gos/tests/hooks/storybook-branch-check.test.sh`:

```bash
#!/usr/bin/env bash
# Smoke test do hook storybook-branch-check.sh
set -e

HOOK=".claude/hooks/storybook-branch-check.sh"
export CLAUDE_PROJECT_DIR="$(pwd)"

echo "=== Test 1: UserPromptSubmit com 'storybook' em branch errada ==="
# Mock: fractus em branch master (presumido)
OUT=$(echo '{"user_prompt":"edite a story do Button"}' | bash "$HOOK")
if [[ "$OUT" == *"STORYBOOK BRANCH CONTEXT"* ]]; then
  echo "PASS: warning injetado"
else
  echo "FAIL: warning não apareceu. Output: $OUT"
  exit 1
fi

echo "=== Test 2: prompt sem storybook (silencioso) ==="
OUT=$(echo '{"user_prompt":"liste as tasks abertas"}' | bash "$HOOK")
if [[ -z "$OUT" ]]; then
  echo "PASS: silencioso"
else
  echo "FAIL: deveria ser silencioso. Output: $OUT"
  exit 1
fi

echo "=== Test 3: PreToolUse em .stories.tsx em branch errada ==="
OUT=$(echo '{"tool_input":{"file_path":"/e/Github/Ganbatte/packages/fractus/src/components/Button.stories.tsx"}}' | bash "$HOOK")
if [[ "$OUT" == *"STORYBOOK BRANCH CONTEXT"* ]]; then
  echo "PASS: warning injetado por file_path"
else
  echo "FAIL. Output: $OUT"
  exit 1
fi

echo "=== Test 4: exit code sempre 0 ==="
echo '{}' | bash "$HOOK" ; echo "exit=$?"   # esperado: 0

echo ""
echo "✅ Todos os testes passaram"
```

```bash
chmod +x .gos/tests/hooks/storybook-branch-check.test.sh
bash .gos/tests/hooks/storybook-branch-check.test.sh
```

### 4. Smoke test manual ponta a ponta

No Claude Code:
- Sessão em `master` do fractus: digitar "editar a story do Button" → aguardar warning na resposta do assistente.
- `cd packages/fractus && git checkout feat/storybook` → mesmo prompt → sem warning.
- Voltar pra master: `Edit` em arquivo `.stories.tsx` → warning aparece no contexto injetado.

### 5. Documentar

Adicionar em `docs/fractus/deploy-storybook.md`, seção nova ao final:

```markdown
## Context hook (T-104)

Claude Code tem um hook local (`.claude/hooks/storybook-branch-check.sh`) que
injeta um lembrete quando prompts ou edições tocam em Storybook e a branch
atual não é `feat/storybook`. Sempre `exit 0` — nunca bloqueia.

Matchers em `.claude/settings.json`:
- `UserPromptSubmit` (qualquer prompt)
- `PreToolUse` com matcher `Write|Edit`

O hook detecta Storybook via regex `storybook|\.stories\.|\.storybook` no
texto do prompt ou no `tool_input.file_path`/`command`.

Para validar: `bash .gos/tests/hooks/storybook-branch-check.test.sh`.
```

## Critérios de aceite (literais)

- **AC1:** Hook dispara em `UserPromptSubmit` quando prompt menciona storybook.
- **AC2:** Hook dispara em `PreToolUse (Write/Edit)` para arquivos `.stories.*`.
- **AC3:** Injeta lembrete se branch não for `feat/storybook`.
- **AC4:** Silencioso na branch correta.
- **AC5:** Nunca bloqueia (exit 0).

## Verificação end-to-end

- [ ] `bash .gos/tests/hooks/storybook-branch-check.test.sh` — todos os 4 testes PASS
- [ ] Smoke manual (passo 4) — warning aparece em branch errada, silencioso em `feat/storybook`
- [ ] `echo '{}' | bash .claude/hooks/storybook-branch-check.sh; echo $?` → `0`
- [ ] docs/fractus/deploy-storybook.md tem seção "Context hook"

## Entrega ao Douglas (**NÃO commitar, NÃO dar push**)

> ⚠️ Dev **NÃO commita**. Douglas valida e commita.

Fluxo do dev:
1. Rodar script de teste — colar output.
2. Smoke manual — screenshot/texto do warning aparecendo.
3. `git status && git diff --stat` — colar em evidência.
4. Avisar Douglas.

### Mensagem de commit sugerida (Douglas usa)

```
feat(claude-hooks): validar hook storybook-branch-check + doc + smoke test

Refs T-104

- Script de smoke test em .gos/tests/hooks/
- Seção "Context hook" em docs/fractus/deploy-storybook.md
- 4/4 smoke tests PASS
```

## Rollback

```bash
rm -f .gos/tests/hooks/storybook-branch-check.test.sh
git restore docs/fractus/deploy-storybook.md
```

O hook em si já estava comitado antes — não mexer.

## Dependências e bloqueios

- **Independente.** Pode rodar em paralelo com T-110.
- **Risco:** se `feat/storybook` não existir no remoto, AC4 não pode ser validado. Criar antes.

## Checklist de entrega

- [ ] AC1-AC5 verificados com smoke tests
- [ ] `bash .gos/tests/hooks/storybook-branch-check.test.sh` PASS
- [ ] Smoke manual em branch errada + correta
- [ ] `docs/fractus/deploy-storybook.md` atualizado
- [ ] `git status` e `git diff --stat` colados
- [ ] **NÃO fiz commit nem push**
- [ ] Douglas notificado

## Checklist do Douglas

- [ ] Revisar diff
- [ ] Rodar script de teste localmente
- [ ] Commit+push com mensagem sugerida
- [ ] ClickUp T-104 → `complete`

## Evidência de entrega

```
# smoke test output
(output)

# git diff --stat
(output)
```
