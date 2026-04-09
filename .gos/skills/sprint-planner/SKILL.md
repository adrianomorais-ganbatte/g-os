---
name: sprint-planner
description: >
  Orquestra planejamento completo de sprint a partir de qualquer input (caminhos de projeto,
  designs Figma, transcricoes, documentos). Gera PRD, ADR, roadmap, schema DBML e backlog
  executavel com tasks decompostas. Trabalha em loops interativos de descoberta.
argument-hint: "[caminho do projeto, arquivo de design, transcricao, ou descricao livre]"
allowedTools: [Read, Glob, Grep, Bash, Write, Edit, Agent, AskUserQuestion]
sourceDocs:
  - playbooks/sprint-planner-playbook.md
  - templates/adr-tmpl.yaml
  - playbooks/story-creation-playbook.md
  - playbooks/gsd-agent-decomposition-playbook.md
use-when:
  - transformar ideia ou projeto em sprint completa
  - planejar sprint de projeto novo ou existente (greenfield ou brownfield)
  - gerar PRD + ADR + roadmap + tasks a partir de qualquer input
  - receber designs Figma, transcricoes ou documentacao e montar backlog
  - preparar ambiente completo (contas, credenciais, infra, DBML)
do-not-use-for:
  - execucao de tasks ja planejadas — use /sdd ou /compose
  - refinamento de backlog existente — use @sm ou @po
  - hotfix ou ajuste pontual sem necessidade de planejamento formal
  - analise de um unico link — use /link-insight
metadata:
  category: workflow-automation
---

# sprint-planner

Voce esta executando a skill `sprint-planner`.

## Conceito

O Sprint Planner e um orquestrador que transforma qualquer input em uma sprint completa
e executavel. Diferente do SDD (que assume requisitos claros), o Sprint Planner comeca
com descoberta interativa e constroi o entendimento progressivamente.

**Nao executa codigo** — para apos produzir o pacote completo da sprint.
Para executar, use `/sdd <PRD.md>` ou `/compose <TASK-NNN>`.

## Task

$ARGUMENTS

Se nenhum input foi fornecido, solicite ao usuario imediatamente.

## Leitura Obrigatoria

Antes de iniciar, leia:
- `playbooks/sprint-planner-playbook.md` — workflow detalhado com checklists
- `templates/adr-tmpl.yaml` — template de ADR para fase 3
- `rules/spec-as-contract.md` — principios do contrato de especificacao

## Phase 0 — Triage & Input Normalization

**Objetivo:** Classificar o input e preparar material para descoberta.

1. Classificar tipo de input recebido:

| Tipo | Deteccao | Acao |
|------|----------|------|
| `project-path` | Caminho para codebase | Executar `/project-brief <path>` |
| `design` | Screenshot, Figma frame, export Figma Make | Analise visual — extrair telas, fluxos, componentes |
| `transcription` | Texto de reuniao, audio transcrito | Extrair requisitos, fluxos, restricoes, decisoes |
| `document` | PRD, spec, briefing existente | Ler, sumarizar, identificar gaps |
| `free-text` | Descricao livre do usuario | Iniciar discovery loop diretamente |
| `mixed` | Combinacao de tipos acima | Processar cada tipo, consolidar |

2. Gerar `input-analysis.md` com:
   - Tipo(s) de input detectado(s)
   - Resumo do material (10-15 linhas)
   - Gaps identificados (o que falta para planejar)
   - Prerequisitos para discovery

**Gate:** Input normalizado. Apresentar resumo ao usuario antes de continuar.

## Phase 1 — Discovery (Loops Interativos)

**Objetivo:** Coletar requisitos via loops de 2-3 perguntas por vez.

### Motor de Tecnicas

Em cada loop, selecionar 2-4 tecnicas conforme o estagio e tipo de incerteza:

| Tecnica | Quando usar |
|---------|-------------|
| SCQA | Enquadrar contexto rapidamente (Situacao → Complicacao → Questao → Acao) |
| Analise de Premissas | Quando houver "nao sei", lacunas, ambiguidades ou suposicoes |
| ReAct | Quando faltar conhecimento de dominio — pesquisar, trazer fontes, confirmar |
| Task-Oriented Thought | Para decompor entendimento em backlog |
| Tree of Thoughts | Para gerar opcoes de caminho quando ha multiplas abordagens |
| Brainstorming Estruturado | Para alternativas e decisoes de escopo |
| Verificacao de Consistencia | Para checar lacunas entre requisitos e criterios de aceite |
| Feynman | Para explicar de forma simples a quem nao e tecnico |

### Checklist de Coleta

1. **Contexto**: Qual produto/modulo/tela? Qual problema e por que agora?
2. **Objetivo**: Qual resultado esperado (metrica/impacto)?
3. **Usuarios**: Perfis, permissoes e stakeholders
4. **Escopo**: O que entra e o que NAO entra nesta Sprint
5. **Fluxos**: Passo a passo do usuario e telas envolvidas
6. **Regras de negocio**: Validacoes, estados, permissoes
7. **Dados**: Campos, integracoes, origem/destino, relatorios
8. **Restricoes**: Prazo, LGPD/compliance, performance, padroes
9. **Criterios de aceite**: Sucesso/erro/excecao
10. **Time/capacidade**: Papeis (FE/BE/QA/UX), duracao da Sprint, prioridades

### Formato de Cada Loop

```
### Tecnicas escolhidas
- [Tecnica] — (1 frase do porque)
- [Tecnica] — (1 frase do porque)

### Resultado parcial
- (5-10 linhas com entendimento e pendencias)
- Confirmado: [lista]
- A confirmar: [lista]
- Pesquisa necessaria: [lista]

### Perguntas
1. ...
2. ...
3. ...
```

### Diferenciar Fontes

- Confirmado pelo usuario
- Assumido como padrao de mercado (a confirmar)
- Baseado em pesquisa (com referencia)

**Gate:** Clarity >= 70% no checklist. Se < 70% apos 4 loops, consolidar o que tem e sinalizar gaps explicitamente no PRD.

## Phase 2 — Requirements Crystallization (PRD)

**Objetivo:** Consolidar descobertas em PRD formal.

1. Gerar `sprint-planner/<slug>/PRD.md` contendo:
   - Visao geral e objetivo
   - Problema que resolve
   - Escopo: IN e OUT (explicito)
   - Usuarios e perfis
   - Requisitos funcionais (numerados)
   - Requisitos nao-funcionais
   - Criterios de aceite (Given/When/Then)
   - Dependencias externas
   - Riscos e assuncoes
   - **Decisoes Menores (Embedded ADR)**: decisoes que nao justificam arquivo separado, cada uma com contexto, opcoes, escolha e justificativa

2. Reuso: patterns do agente `@pm` (Morgan) e template `prd-for-ralph.template.md`

**Gate:** Usuario aprova PRD antes de avancar. Se houver rejeicao, voltar a Phase 1 para refinar.

## Phase 3 — Architecture & Schema

**Objetivo:** Definir arquitetura, decisoes estruturais e schema de dados.

### ADR (Architecture Decision Records)

Para cada decisao arquitetural significativa (3+ opcoes com trade-offs):
1. Gerar `sprint-planner/<slug>/ADR-NNN.md` usando template de `templates/adr-tmpl.yaml`
2. Decisoes tipicas: stack tecnologico, banco de dados, autenticacao, hospedagem, arquitetura de API

Decisoes menores (escolha obvia, < 3 opcoes) ficam embedded no PRD (Phase 2).

### Schema DBML

Se o projeto envolve banco de dados:
1. Gerar `sprint-planner/<slug>/schema.dbml` em formato DBML
2. Incluir: tabelas, campos com tipos, relacoes (1:1, 1:N, N:N), indexes, enums
3. Anotar RLS policies quando aplicavel (Supabase/Postgres)
4. Exemplo de formato:

```dbml
Table users {
  id uuid [pk, default: `gen_random_uuid()`]
  email varchar [unique, not null]
  created_at timestamp [default: `now()`]
}

Table projects {
  id uuid [pk]
  owner_id uuid [ref: > users.id]
  name varchar [not null]
  status project_status [default: 'draft']
}

Enum project_status {
  draft
  active
  archived
}
```

### APIs

Se o projeto envolve APIs:
- Listar endpoints: metodo, path, request/response schema, autenticacao

**Gate:** ADR(s) e schema revisados e aprovados pelo usuario.

## Phase 4 — Roadmap Generation

**Objetivo:** Gerar roadmap com fases e prazos realistas.

1. Aplicar logica de `proposals/gerar-roadmap-por-fases-com-prazos`:

| Complexidade | Fases | Duracao tipica |
|-------------|-------|----------------|
| Simples | 2-3 | Ate 15 dias |
| Medio | 4-5 | 15-45 dias |
| Complexo | 5-6 | 45+ dias |

2. Fases recomendadas por complexidade:

**Simples (2-3 fases):**
1. Setup & Core
2. Testes & Deploy

**Medio (4-5 fases):**
1. Descoberta & Briefing (3-5 dias)
2. Arquitetura & Setup (5-8 dias)
3. Desenvolvimento Core (10-15 dias)
4. Testes, QA & Deploy (5-10 dias)

**Complexo (5-6 fases):**
1. Descoberta & Briefing (3-5 dias)
2. Design UX/UI — Figma (5-7 dias, apenas se ha interface)
3. Arquitetura & Setup (5-10 dias)
4. Desenvolvimento Core (10-20 dias)
5. Observabilidade & Integracoes (5-10 dias)
6. Testes, QA & Go-Live (5-10 dias)

3. Gerar `sprint-planner/<slug>/ROADMAP.md` com fases, duracoes, entregaveis e condicoes de inicio

**Validacao:**
- Soma das duracoes <= total + 20% margem
- Cada fase tem pelo menos 1 entregavel concreto
- Nenhuma fase com menos de 2 dias

**Gate:** Roadmap com fases e prazos validados pelo usuario.

## Phase 5 — Task Decomposition

**Objetivo:** Decompor roadmap em tasks executaveis e detalhadas o suficiente para que qualquer pessoa (tecnica ou nao) entenda o que deve ser feito.

1. Executar `/plan-to-tasks sprint-planner/<slug>/PRD.md`
2. Cada task segue formato padrao:
   - ID: `TASK-YYYYMM-NNN`
   - Titulo imperativo
   - Area: FE / BE / QA / UX / DevOps / General
   - Prioridade: P0 (bloqueante) / P1 (importante) / P2 (nice-to-have)
   - Estimativa: max 1 dia por task
   - DoD mensuravel
3. User stories em Given/When/Then (padrao `story-creation-playbook.md`)
4. Ordenar por dependencias — tasks sem dependencia primeiro
5. Scoring de complexidade (1-25) conforme playbook de story creation

### Regras de Enriquecimento Obrigatorio

Cada task DEVE conter os seguintes campos com nivel de detalhe minimo:

| Campo | Regra | Exemplo |
|-------|-------|---------|
| `description` | Min 2 sentencas: O QUE fazer + POR QUE fazer | "Inicializar o projeto Next.js com App Router. Necessario para estabelecer a base de codigo do projeto." |
| `context` | Motivacao para leitor nao-tecnico. Por que esta task existe no contexto do projeto | "Primeiro passo do projeto. Todas as demais tasks dependem desta estrutura estar funcional." |
| `acceptanceCriteria` | Formato DADO/QUANDO/ENTAO. Min 2 criterios verificaveis | "DADO que o repo foi clonado QUANDO rodar pnpm dev ENTAO o servidor sobe sem erros" |
| `steps` | Passo a passo de implementacao (3-7 steps acionaveis) | "1. Rodar pnpm create next-app 2. Configurar Prettier 3. Criar estrutura de pastas" |
| `points` | Story points obrigatorio (1, 2, 3, 5, 8, 13) | 3 |
| `files` | Paths especificos, NAO diretorios genericos | `app/layout.tsx` em vez de `app/` |
| `dependencies` | Array de T-IDs que bloqueiam esta task (vazio se nenhum) | `["T-005"]` ou `[]` |
| `dod` | Definition of Done resumido em 1 linha | "Projeto roda localmente, estrutura match spec, preview Vercel OK" |
| `subtasks` | Obrigatorio para tasks >5 pontos | Array de sub-items |
| `businessRules` | IDs de regras de negocio (vazio se nenhuma) | `["BR-001"]` ou `[]` |

### Exemplo de Task Enriquecida

```json
{
  "id": "T-006",
  "title": "Scaffold Next.js App Router",
  "description": "Inicializar o projeto Next.js com App Router, TypeScript, Tailwind v4, ESLint e Prettier. Configurar a estrutura de pastas conforme a especificacao arquitetural (secao 2.1 do ADR) para garantir consistencia e escalabilidade do codebase.",
  "context": "Este e o primeiro passo do projeto Fractus. Todos os demais tasks (backend e frontend) dependem desta estrutura base estar correta e funcional. A estrutura de pastas define convencoes que serao seguidas por toda a equipe.",
  "priority": "P0",
  "area": "backend",
  "points": 3,
  "assignee": "Douglas Oliveira",
  "steps": [
    "Rodar pnpm create next-app@latest com App Router, TypeScript, Tailwind, ESLint",
    "Configurar Prettier com regras do projeto (.prettierrc)",
    "Criar estrutura de pastas: app/, components/ui/, lib/, hooks/, types/, services/",
    "Configurar path aliases no tsconfig.json (@/ para src/)",
    "Adicionar scripts no package.json (dev, build, lint, format)",
    "Validar que pnpm dev sobe sem erros",
    "Fazer deploy preview no Vercel e confirmar que a pagina padrao renderiza"
  ],
  "acceptanceCriteria": [
    "DADO que o repo foi clonado QUANDO rodar pnpm install && pnpm dev ENTAO o servidor sobe em localhost:3000 sem erros",
    "DADO a estrutura de pastas QUANDO comparar com secao 2.1 do ADR ENTAO todos os diretorios listados existem",
    "DADO o projeto deployado QUANDO acessar a preview URL no Vercel ENTAO a pagina renderiza com status 200"
  ],
  "files": [
    "package.json", "tsconfig.json", "next.config.ts", "tailwind.config.ts",
    ".prettierrc", ".eslintrc.json", "app/layout.tsx", "app/page.tsx"
  ],
  "dependencies": [],
  "businessRules": [],
  "dod": "Projeto roda localmente, estrutura match spec, preview Vercel funcional"
}
```

### Validacao Pre-Import

O CLI `clickup.js sprint import` agora valida cada task automaticamente (score 0-100). Tasks com score < 30 bloqueiam o import. Use `--skip-validation` para bypass.

**Gate:** Tasks acionaveis, detalhadas e sem interpretacao subjetiva.

## Phase 6 — Environment & Setup Tasks

**Objetivo:** Gerar tasks de preparacao de ambiente que precedem o desenvolvimento.

1. Detectar necessidades de setup a partir do PRD e ADRs:

| Categoria | Exemplos |
|-----------|----------|
| Contas de servicos | Supabase, Vercel, Cloudflare, APIs externas |
| Credenciais | API keys, secrets, env vars, OAuth apps |
| Repositorio | Criar repo, configurar branches, CI/CD |
| Backend | Migrations iniciais, seeds, RLS policies |
| Frontend | Scaffold, design tokens, tema base |
| DBML | Gerar schema.dbml, validar com dbdiagram.io |
| Infraestrutura | DNS, dominios, certificados, storage |

2. Gerar tasks com area `devops` ou `general`, prioridade P0
3. Marcar como pre-requisitos das tasks de desenvolvimento
4. Incluir instrucoes passo-a-passo (criar conta → obter credenciais → configurar .env)

**Gate:** Nenhuma task de dev depende de setup nao planejado.

## Phase 7 — Sprint Assembly & Summary

**Objetivo:** Consolidar todos os artefatos em visao geral da sprint.

1. Gerar `sprint-planner/<slug>/SPRINT-OVERVIEW.md` com:
   - Nome e objetivo da sprint
   - Entregaveis (com links para artefatos gerados)
   - Fora de escopo (explicito)
   - Assuncoes e riscos
   - Dependencias externas
   - Resumo do backlog (tabela com todas as tasks, area, prioridade, estimativa)
   - Ordem de execucao sugerida
   - Proximos passos (qual skill usar para executar)

2. Registrar decisoes em `.G-OS/memory/decision-log.json`

### ClickUp-Ready Output (Opcional)

Se o projeto usa ClickUp para gestao, gerar tambem o JSON de import:

1. Gerar `sprint-planner/<slug>/sprint-import.json` no formato do schema `data/schemas/sprint-clickup.schema.json`
2. Cada task com TODOS os campos de enriquecimento obrigatorio (ver Phase 5):
   - `id`, `title`, `description`, `context`, `priority`, `area`, `points`
   - `assignee`, `steps`, `acceptanceCriteria` (DADO/QUANDO/ENTAO)
   - `files` (paths especificos), `dependencies`, `businessRules`, `dod`
   - `subtasks` (obrigatorio para tasks >5 pontos)
   - `estimatedHours` (0.5-16), `technicalNotes` (quando aplicavel)
3. Criterios de aceite viram checklist "Acceptance Criteria" no ClickUp automaticamente
4. Steps viram checklist "Implementation Steps" no ClickUp automaticamente
5. Campo `assignee` com nome do responsavel (resolvido pelo CLI via `--team-id`)
6. Textos passam por sanitizacao automatica (correcao de acentos + deteccao de padroes de IA)
7. Importar via: `node scripts/tools/clickup.js sprint import --folder-id <id> --file sprint-import.json --team-id <id>`
8. Para enriquecer tasks ja importadas: `node scripts/tools/clickup.js task enrich --file enriched.json`

### Artefatos Finais

```
.G-OS/sprint-planner/<slug>/
  input-analysis.md
  PRD.md
  ADR-001.md (... ADR-NNN.md)
  schema.dbml (se aplicavel)
  ROADMAP.md
  SPRINT-OVERVIEW.md
  sprint-import.json (se ClickUp habilitado)

.G-OS/tasks/
  TASK-YYYYMM-001.md
  TASK-YYYYMM-002.md
  ...
```

### Continuacao apos Sprint Planner

| Objetivo | Comando |
|----------|---------|
| Executar spec-driven | `/sdd sprint-planner/<slug>/PRD.md` (pula fases 1-3 do SDD) |
| Orquestrar execucao | `/compose TASK-YYYYMM-001` |
| Refinar backlog | `@sm` ou `@po` revisam stories |
| Implementar frontend | `/fe` com tasks geradas |
| Implementar backend | `/be` com tasks geradas |

## Regras Criticas

1. **Nao executar codigo** — Sprint Planner para apos produzir o pacote da sprint.
2. **Nao assumir requisitos** — se faltar informacao, perguntar no loop de discovery.
3. **Nao pular gates** — cada fase precisa de aprovacao antes de avancar.
4. **Internalizar tudo** — nenhuma referencia a caminhos externos no output final.
5. **Priorizar setup** — tasks de ambiente sempre precedem desenvolvimento.
6. **DBML quando houver banco** — sempre gerar schema mesmo para projetos simples.
7. **ADR para decisoes grandes** — 3+ opcoes com trade-offs = ADR separado.

## Model Guidance

| Escopo | Modelo recomendado |
|--------|-------------------|
| Projeto simples (escopo claro, 3-5 tasks) | `sonnet` |
| Projeto medio (ambiguidade moderada, 5-15 tasks) | `opus` |
| Projeto complexo (multi-dominio, 15+ tasks, Figma + backend) | `opus` (obrigatorio) |
| Discovery apenas (fases 0-1) | `sonnet` |
| Full pipeline (fases 0-7) | `opus` (recomendado) |

## When to Use
- Use according to the triggers described in the description/use-when list.

## Do not use
- Fora do escopo descrito; prefira a skill apropriada.

## Instructions
1) Siga o passo-a-passo principal da skill.
2) Valide saa com checklists desta skill ou do workflow.
3) Registre decises relevantes se aplic5vel.
