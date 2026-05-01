---
name: progress-tracker
description: Gerencia progress.txt como memória L1 (curta, otimizada para LLM) na raiz do projeto-cliente. Suporta init, set-current, update-status (state machine), compact e read. Sempre consultado quando há dúvida sobre plano/task ativo.
argument-hint: "[init|show|set <plan>|status <task> <novo-status>|compact|read]"
allowedTools: [Read, Write, Edit, Bash]
sourceDocs:
  - templates/progressTemplate.txt
  - playbooks/plan-creation-playbook.md
use-when:
  - inicializar progress.txt no workspace
  - definir qual plano está ativo
  - transicionar status de plano/task
  - LLM com dúvida sobre o que está sendo feito
  - compactar progress.txt removendo tasks concluídas antigas
do-not-use-for:
  - planejamento (plan-blueprint)
  - decomposição (plan-to-tasks)
  - leitura de stack (stack-profiler)
metadata:
  category: project-context
---

Você está executando a skill `progress-tracker`. Mantém a memória L1 do projeto.

## Conceito

`progress.txt` é a **memória de curta duração** que toda LLM consulta quando precisa saber:
- qual plano está ativo
- qual task está em execução
- o que foi feito por último
- o que vem a segur
- bloqueios atuais

Formato denso, sem prosa, otimizado para tokens. Inspirado em `caveman-main` e `sandeco-token`. Localização default: raiz do projeto-cliente (path resolvido em `dirs.progress` do `plan-paths.json`).

## State machine

```
pendente → em-andamento → validacao → concluido
```

Transições válidas:
- `pendente → em-andamento`: livre
- `em-andamento → validacao`: requer commit preparado (não pushado)
- `validacao → concluido`: requer aprovação humana
- `* → pendente`: rollback (libera a transição via flag `--rollback`)

Transições inválidas falham com mensagem do helper `scripts/tools/plan-status.js`.

## Subcomandos

### `init`

Cria `progress.txt` se ausente, usando `templates/progressTemplate.txt`. Não sobrescreve se já existir.

### `show` (default)

Imprime `progress.txt`.

### `set <plan-id>`

Fixa o plano ativo. Ex.: `*progress set PLAN-042-checkout`. Atualiza:
- `plan_active=<dirs.planos>/<plan-id>/plan.md`
- `tasks_dir=<dirs.planos>/<plan-id>/tasks/`
- `context=<dirs.planos>/<plan-id>/context.md`
- `status=pendente` (se for primeira ativação)

### `status <task-id> <novo-status>`

Muda status de uma task. Valida via state machine. Atualiza `progress.txt` (`last_done`, `next`) e o frontmatter do task file. Se a task fechar o checklist do plano, sugere `*progress status <plan-id> validacao`.

### `compact`

Reescreve `progress.txt` removendo tasks `concluido` antigas (manter < 4kB). Mantém apenas:
- plano ativo
- últimas 3 tasks `concluido`
- todas tasks `em-andamento`/`validacao`/`pendente` do plano ativo
- bloqueios e notas curtas

### `read`

Mesmo que `show`. Disponível como verbo explícito para integração com `comprehension_gate` do gos-master.

## Formato `progress.txt`

```
# progress.l1
ts=2026-05-01T18:22:00-03:00
project=<nome>
plan_active=docs/plans/PLAN-042-checkout/plan.md
tasks_dir=docs/plans/PLAN-042-checkout/tasks/
context=docs/plans/PLAN-042-checkout/context.md
stack_ref=docs/stack.md@a1b2c3d
status=em-andamento

last_done=T-042-03 montar-form-pagamento
current=T-042-04 integrar-supabase-orders
next=T-042-05 estado-erro-checkout

blockers=
notes=fetch usa server component em app/checkout/page.tsx
```

## Regras

- Sempre resolver `dirs.progress` via `plan-paths.json` antes de ler/escrever.
- Nunca remover bloqueios sem confirmação.
- `compact` só remove `concluido` antigas — nunca toca `em-andamento`.
- Toda alteração registra `ts` em ISO 8601.

## Saída

Após qualquer alteração, mostrar diff curto:

```
[progress] PLAN-042-checkout / T-042-03 → concluido
last_done=T-042-03 montar-form-pagamento
current=T-042-04 integrar-supabase-orders
```

## Instructions

1. Skill silenciosa — não tagarela, devolve estado.
2. State machine é dura — bloquear transições inválidas.
3. Nunca apagar `progress.txt` sem `compact` explícito.
