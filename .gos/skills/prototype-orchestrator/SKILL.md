---
name: prototype-orchestrator
description: >
  Orquestra pipeline ideia-para-prototipo end-to-end: idea-intake -> prd-from-intake ->
  adr-tech-decisions -> stitch/figma generate-design -> design-critique -> handoff para
  design-to-code. Pensado para usuarios nao-tecnicos com MVP descartavel. Decision gates
  entre fases para abortar cedo.
argument-hint: "<frase da ideia ou 'continuar'> [--skip-figma] [--full-stack]"
allowedTools: [Read, Glob, Grep, Bash, Write, Edit, AskUserQuestion]
sourceDocs:
  - skills/idea-intake/SKILL.md
  - skills/prd-from-intake/SKILL.md
  - skills/adr-tech-decisions/SKILL.md
  - skills/figma-implement-design/SKILL.md
  - skills/design-to-code/SKILL.md
  - skills/figma-print-diff/SKILL.md
use-when:
  - usuario nao-tecnico chega com uma ideia e quer prototipo visivel
  - ja existe intake mas usuario quer levar ate Figma+codigo
  - preciso iterar de "ideia" ate "tela rodando" sem perder contexto entre fases
do-not-use-for:
  - tarefas tecnicas pontuais (use plan-blueprint direto)
  - quando ja existe stack.md + PRD (entre direto via plan-blueprint)
metadata:
  category: orchestration
---

Voce esta executando como **Orquestrador Ideia-Prototipo** via skill `prototype-orchestrator`. Coordena 5 skills em sequencia com decision gates entre cada uma. Conduzido pelo `gos-master` para preservar comprehension gate cross-fase.

## Pipeline

```
[ideia bruta]
   |
   v
1. idea-intake -> intake.md  (gate: usuario valida resumo)
   |
   v
2. prd-from-intake -> prd.md  (gate: usuario aprova TL;DR)
   |
   v
3. adr-tech-decisions -> ADR + stack.md  (gate: usuario confirma decisoes tecnicas)
   |
   v
4. (opcional) Stitch/Figma generate-design -> frames Figma  (gate: usuario aprova mockups)
   |
   v
5. plan-blueprint por tela -> plan + tasks  (gate: validate-plan)
   |
   v
6. design-to-code + figma-implement-design -> codigo
   |
   v
7. figma-print-diff -> ajustes ate aprovacao visual
```

## Estado da orquestracao

Persistido em `.gos-local/prototype-session.json`:

```json
{
  "session_id": "proto-2026-05-09T14-22-03",
  "slug": "<derivado da ideia>",
  "current_phase": 3,
  "phases": {
    "1_intake": { "status": "done", "ref": "INTAKE-007-agendamento-mae" },
    "2_prd": { "status": "done", "ref": "PRD-007-agendamento-mae" },
    "3_adr": { "status": "in-progress", "ref": null },
    "4_figma": { "status": "pending", "ref": null },
    "5_plans": { "status": "pending", "refs": [] },
    "6_codegen": { "status": "pending" },
    "7_visual_qa": { "status": "pending" }
  },
  "started_at": "<iso>",
  "updated_at": "<iso>"
}
```

## Decision gates entre fases

Cada gate usa `AskUserQuestion` com 3 opcoes:
1. **Aprovar e seguir** -> avanca para proxima fase.
2. **Iterar nesta fase** -> volta para a skill da fase atual com contexto adicional.
3. **Abortar** -> grava sessao como `aborted` e devolve resumo.

## Pre-flight

1. Se `$ARGUMENTS == "continuar"`: ler `prototype-session.json`, retomar da fase atual.
2. Senao: criar nova sessao + chamar fase 1 (idea-intake) com a frase da ideia.
3. Verificar dependencias: skills `idea-intake`, `prd-from-intake`, `adr-tech-decisions` existem em `skills/`. Falta -> abortar.
4. `--skip-figma` pula fase 4 (caso usuario queira ir direto para codigo).
5. `--full-stack` forca perfil B/C no ADR (mesmo que descartavel).

## Execucao

Para cada fase pendente:
1. Imprimir cabecalho `[fase N/7] <nome>`.
2. Invocar skill correspondente via `gos-master` (com comprehension gate).
3. Persistir `ref` no session.json apos sucesso.
4. Aplicar decision gate.
5. Avancar.

## Compressao de contexto entre fases

Para evitar inflacao de tokens (problema central do framework):
- A cada fase, comprimir output da anterior via `gos-compress` rate=0.4 antes de passar para a proxima.
- Manter snapshot integral em disco (`docs/intake/...`, `docs/prd/...`, etc.) — apenas o contexto in-memory e comprimido.
- Se `gos-compress` indisponivel: usar resumo manual de 200 palavras + path do arquivo original.

## Regras criticas

- **Sempre perguntar (regra do dono)**: cada gate e obrigatorio. Nunca avancar fase sem confirmacao.
- **Descartavel-first**: se intake marcou descartavel, pular Storybook, E2E, design system robusto.
- **Anti-loop**: limite de 3 iteracoes por fase. Se exceder, sugerir abortar.
- **Output rastreavel**: ao final, gerar `docs/prototypes/PROTO-NNN-<slug>/index.md` com links para todos os artefatos.

## Input

$ARGUMENTS
