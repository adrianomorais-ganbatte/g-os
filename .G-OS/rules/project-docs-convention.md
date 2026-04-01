---
paths: skills/**, playbooks/**, rules/**
---

# Project Docs Convention

## Objective

Padronizar a estrutura de documentacao de execucao em todo projeto que usa o G-OS Framework, garantindo rastreabilidade cross-tool e retomada de trabalho por qualquer ferramenta AI.

## Core rules

1. Todo projeto DEVE ter `docs/{plans,tasks,specs,progress}/` na raiz do projeto.
2. Arquivos usam prefixo numerico `NN-` zero-padded para ordenacao (`01-`, `02-`, ...).
3. Ao completar, **renomear** o arquivo adicionando sufixo `.done.md` (nao copiar).
4. Tasks sao agrupadas em subdiretorios matching o plano: `docs/tasks/NN-name/TASK-NN-desc.md`.
5. Progress sidecars ficam em `docs/progress/NN-name.progress.md` — separados de `plans/`.
6. Arquivos com status `completed` ha mais de 30 dias devem ser movidos para `docs/progress/archived/`.
7. Specs ficam em `docs/specs/NN-name-spec.md` com mesmo prefixo do plano correspondente.

## Directory structure

```
projeto/
  docs/
    plans/
      01-auth-flow.md
      02-dashboard-layout.done.md
    tasks/
      01-auth-flow/
        TASK-01-setup-supabase-auth.md
        TASK-02-login-page.done.md
      02-dashboard-layout/
    specs/
      01-auth-flow-spec.md
      02-dashboard-layout-spec.done.md
    progress/
      01-auth-flow.progress.md
      02-dashboard-layout.progress.md
      archived/
```

## Naming conventions

| Artifact | Pattern | Example |
|----------|---------|---------|
| Plan | `docs/plans/NN-name.md` | `docs/plans/01-auth-flow.md` |
| Task | `docs/tasks/NN-name/TASK-NN-desc.md` | `docs/tasks/01-auth-flow/TASK-01-setup-auth.md` |
| Spec | `docs/specs/NN-name-spec.md` | `docs/specs/01-auth-flow-spec.md` |
| Progress | `docs/progress/NN-name.progress.md` | `docs/progress/01-auth-flow.progress.md` |
| Completed | `*.done.md` (renomear) | `01-auth-flow.done.md` |
| Archived | `docs/progress/archived/` | Mover apos 30d completed |

## Anti-patterns

- Usar `docs/` como dump de arquivos sem numeracao.
- Copiar arquivo para `.done.md` em vez de renomear (duplica conteudo).
- Misturar progress sidecars dentro de `plans/` (poluicao).
- Tasks soltas fora de subdiretorios (perde agrupamento por plano).

## Related artifacts

- `rules/cross-tool-bootstrap.md` — protocolo de retomada cross-tool
- `rules/progress-lifecycle.md` — lifecycle de criacao, update e archival
- `templates/progress-sidecar.template.md` — formato do progress sidecar
- `skills/writing-plans/SKILL.md` — skill que cria planos
- `skills/plan-to-tasks/SKILL.md` — skill que decompoe planos em tasks
