---
name: stack-profiler
description: Produz e mantém docs/stack.md como fonte canônica da stack-of-record do projeto. Lê arquivos de configuração, design system, Postman, regras de negócio e ADRs (paths resolvidos via .gos-local/plan-paths.json). Usar antes de criar planos ou quando a stack do projeto mudou.
argument-hint: "[refresh|show|drift]"
allowedTools: [Read, Glob, Grep, Bash, Write, Edit, AskUserQuestion]
sourceDocs:
  - templates/stackTemplate.md
  - playbooks/plan-creation-playbook.md
use-when:
  - primeiro setup do projeto no fluxo de planos do G-OS
  - stack mudou (libs, framework, ORM, auth, hosting)
  - drift detectado entre stack.md e arquivos-fonte
  - antes de qualquer execução de plan-blueprint sem stack.md presente
do-not-use-for:
  - decisões pontuais de tela (use plan-blueprint)
  - alteração de stack (gera ADR, não rerruna profiler cego)
metadata:
  category: project-context
---

Você está executando a skill `stack-profiler`. Ela define o contrato técnico do projeto que todas as demais skills do pipeline de planos respeitam.

## Input

$ARGUMENTS

Subcomandos:
- `refresh` (default) — varre fontes e (re)escreve `docs/stack.md`
- `show` — imprime o `stack.md` atual
- `drift` — compara hashes em `.gos-local/stack.lock.json` com arquivos-fonte; alerta se mudaram

## Pré-requisitos

1. Resolver paths via `.gos-local/plan-paths.json`. Se não existir, criar com defaults e perguntar apenas o que não puder inferir.
2. Carregar template `templates/stackTemplate.md`.

## Procedimento — `refresh`

### Fase 1 — Ler fontes canônicas

Ler (quando existirem, todos relativos à raiz do projeto-cliente):
- `package.json`, `tsconfig*.json`
- `next.config.*`, `vite.config.*`, `tailwind.config.*`, `postcss.config.*`
- `prisma/schema.prisma`, `drizzle.config.*`, `supabase/`
- `README.md`, `CLAUDE.md`
- Cada `knowledge_sources[].path` declarado em `plan-paths.json`:
  - `design-system` — extrair tokens, componentes-chave
  - `postman` — listar coleções e endpoints expostos (extrair `name`, `request.method`, `request.url.raw`)
  - `business-rules` — listar arquivos com títulos/escopos
  - `adr` — listar ADRs ativas

### Fase 2 — Inferir e perguntar

Inferir automaticamente:
- Framework principal e versão (`dependencies` em package.json)
- Runtime (Node, Bun, Edge)
- ORM efetivo (Prisma, Drizzle, Supabase client)
- UI lib + design system
- Hosting (vercel.json, netlify.toml, Dockerfile)

Perguntar ao usuário (apenas o que não conseguir inferir, em uma única rodada):
- Auth provider efetivo
- Padrão preferido de fetching (server component, server action, client + SWR, etc.)
- Backend é read-only para a aplicação (sem criar schema novo)?
- Restrições explícitas (ex.: "não introduzir novas libs sem ADR")

### Fase 3 — Gravar `stack.md`

Caminho: o que estiver em `dirs.stack` do `plan-paths.json` (default `docs/stack.md`).

Seções obrigatórias (ver `templates/stackTemplate.md`):
1. Framework & runtime
2. UI / Design System (com link para o doc canônico)
3. Estado & dados
4. Auth
5. Backend / DB (incluir flag `read_only: true|false`)
6. Padrões de fetching
7. Convenções de pastas e rotas
8. Fontes de conhecimento do projeto (lista cada `knowledge_source` com path resolvido + resumo)
9. Restrições
10. Links internos (docs, ADRs ativas)

### Fase 4 — Atualizar lock

Gravar `.gos-local/stack.lock.json`:

```json
{
  "schema": "gos.stack-lock.v1",
  "generated_at": "<iso>",
  "stack_path": "<dirs.stack>",
  "sources": [
    { "path": "package.json", "sha256": "..." },
    { "path": "docs/postman/Fractus.postman_collection.json", "sha256": "..." }
  ]
}
```

## Procedimento — `drift`

1. Ler `.gos-local/stack.lock.json`.
2. Recalcular sha256 de cada `sources[].path`.
3. Listar mudanças. Se houver, sugerir `*stack refresh` e listar planos com `stack_ref` divergente (escanear `dirs.planos`).

## Procedimento — `show`

Imprimir o conteúdo de `dirs.stack`. Se ausente, instruir `*stack refresh`.

## Saída

Após `refresh`:

```
## Stack profilada — <projeto>

- Framework: Next.js 15 (App Router)
- DB: Supabase (read-only)
- Design System: .referencia-storybook
- Knowledge sources: 3 (postman, business-rules, adr)

stack.md: docs/stack.md
lock: .gos-local/stack.lock.json
hashes: 12 arquivos
```

## Model guidance

| Escopo | Modelo |
|--------|--------|
| Refresh em projeto pequeno/médio | `sonnet` |
| Projeto grande com muita ambiguidade | `opus` |
| `show` / `drift` | `haiku` |

## Instructions

1. Sempre resolver paths via `plan-paths.json` antes de tocar filesystem do projeto.
2. Não inventar tecnologia — se não conseguir inferir, perguntar.
3. Nunca propor mudança de stack neste skill — só registrar o que existe.
