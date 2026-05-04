# Prompt G-OS — `*plan` simplificado

> Invocação canônica: `/gos:agents:gos-master`. Plano vive em
> `<PROJETO>/docs/plans/PLAN-NNN-<tela>/plan.md`.
> Ciclo: `*plan` (Opus) → `*execute-plan` (Codex) → `*validate-plan` (Opus).

---

## Template mínimo

```
/gos:agents:gos-master *plan {{TELA}}

OBJETIVO   = {{implantacao | correcao | refactor}}
FIGMA      = {{url-frame-principal}}
FIGMA+     = [{{url-comp-1}}, ...]              # opcional
INTERACOES = """
- <Elemento> — <trigger> → <ação> → <resultado/estado>
- ex: Row — click → drawer mode=view com record.id
- ex: Botão "Salvar" — submit → POST /x → fecha + refetch + toast
- ex: Select Período — change → debounce 300ms → refetch query
"""
NOTAS      = """{{invioláveis, edge cases, contexto}}"""   # opcional
```

`OBJETIVO` é obrigatório.

`INTERACOES` é **obrigatório** quando a tela tem table com row clicável OU drawer/modal/popup OU botão que dispara ação assíncrona. `gos-master` recusa o `*plan` (`AskUserQuestion` estruturado) se vazio nessas condições.

| OBJETIVO | Postura |
|----------|---------|
| `implantacao` | Cria do zero (Fase 1 → 2 → 3) |
| `correcao` | Cirúrgico — diff vs Storybook canônico, 1 task por componente |
| `refactor` | Implica `--allow-arch-change` + ADR obrigatória |

---

## O que `gos-master` resolve sozinho

No comprehension gate (não pedir ao usuário): `PROJETO` (cwd ou `~/.claude/.gos-state/last-project.json`); `WORK_BRANCH` (app → `dev`, Storybook → `feat/storybook`); `STORYBOOK_DIR/BRANCH`, `BUSINESS_RULES`, `POSTMAN`, `BACKEND/RLS/SEED` (de `.gos-local/plan-paths.json` + `docs/stack.md` + `docs/regras-de-negocio/` + `docs/postman/`).

Storybook ausente bloqueia (regra do visual gate). Postman/regras-de-negocio ausentes não bloqueiam — só ficam fora do contexto.

---

## Backend gaps → ClickUp automático

Postman é o contrato: endpoint inexistente / shape divergente vira task ClickUp pro Douglas (`assignee=112010775`, override via `ASSIGNEE`). IDs registrados em `## Backend pendings` do `plan.md` + `progress.txt`. `--skip-clickup` desliga.

`*execute-plan` é **non-blocking**: tasks frontend com `depends_on_backend:` apontando pra gap aberto viram `bloqueada-backend`; demais seguem.

---

## Executar e validar

```
/gos:agents:gos-master *execute-plan PLAN-NNN-{{TELA}}
```

> **Codex IDE Extension** (executor). Visual gate por task contra Storybook canônico. Pre-flight smoke (screenshot vs Figma frame) quando Storybook story-da-página OU Playwright MCP disponível.

```
/gos:agents:gos-master *validate-plan PLAN-NNN-{{TELA}}

NOTAS = """<opcional — desvios conhecidos, contexto de QA>"""
```

> **Opus 4.7** (revisor). Compara checklist + diff staged + Storybook curto + cobertura de `interaction_target`/`override_target`. Auto-marca `concluido` o que passa. **Não dá push** — push é manual (`git push`).

---

## Exemplo

```
/gos:agents:gos-master *plan pagina-projetos-inicial

OBJETIVO   = implantacao
FIGMA      = https://www.figma.com/design/.../FRACTUS?node-id=9140-25387
FIGMA+     = [https://...node-id=9140-25389, https://...node-id=9140-25392]
INTERACOES = """
- Row da tabela — click → drawer mode=view com record.id
- Ícone Eye da row — click → mesmo comportamento (atalho)
- Botão "Novo projeto" — click → drawer mode=create vazio
- Drawer "Salvar" (create) — submit → POST /projetos → fecha + refetch + toast
- Drawer "Salvar" (edit) — submit → PATCH /projetos/:id → fecha + refetch + toast
- Toolbar filtro Período — change → debounce 300ms → refetch query
- Tabela vazia → empty state com CTA "Criar primeiro projeto"; durante fetch → skeleton 5 rows
"""
NOTAS = """
Drawer único entre criar/visualizar/editar — só o título e o footer mudam (prop `mode`).
Stack inalterada — usa server actions já existentes em src/app/projetos/actions.ts.
"""
```

Plano filho: adicionar `--parent PLAN-NNN-<slug>` ao comando.

---

## Referência

- Flags adicionais (`--from-figma-mcp`, `--allow-arch-change`, `--no-progress`, `--skip-storybook-sync`, `--skip-visual-gate`, `--skip-clickup`): ver `.gos/skills/plan-blueprint/SKILL.md` e `.gos/skills/execute-plan/SKILL.md`.
- Visual gate (5 dimensões: anatomia, tokens, variants, densidade, comportamentos): ver `.gos/skills/execute-plan/SKILL.md`.
- State machine + comandos `*progress`: ver `.gos/skills/progress-tracker/SKILL.md`.
- Pipeline completo end-to-end: ver `.gos/playbooks/plan-creation-playbook.md`.
