# Sprint Planner — Playbook Operacional

> Guia a execucao completa do sprint-planner: do input ate sprint montada com PRD, ADR, roadmap e tasks.

## Objetivo

Transformar qualquer input (caminho de projeto, design Figma, transcricao, documento)
em um pacote completo de sprint com artefatos prontos para execucao.

## Pre-requisitos

- [ ] Input disponivel (caminho de projeto, design, transcricao ou descricao)
- [ ] Acesso ao projeto/codebase (se for project-path)
- [ ] Usuario disponivel para loops de discovery (15-30 min)
- [ ] Branch correta (`dev` para framework, feature branch para projetos)

## Step 1 — Triage do Input (5 min)

- [ ] Classificar tipo: project-path | design | transcription | document | free-text | mixed
- [ ] Se project-path: executar `/project-brief <path>` para contexto
- [ ] Se design: analise visual — extrair telas, fluxos, componentes
- [ ] Se transcription: extrair requisitos, fluxos, restricoes, decisoes
- [ ] Se document: ler, sumarizar, identificar gaps
- [ ] Gerar `input-analysis.md`
- [ ] Apresentar resumo ao usuario

## Step 2 — Discovery Loops (15-30 min)

- [ ] Loop 1: Contexto e Objetivo (SCQA + Analise de Premissas)
- [ ] Loop 2: Usuarios e Escopo (Task-Oriented Thought + Brainstorming)
- [ ] Loop 3: Fluxos e Regras (Verificacao de Consistencia)
- [ ] Loop 4 (se necessario): Dados e Restricoes (ReAct + Feynman)
- [ ] Avaliar clarity checklist (>= 70%?)
- [ ] Se < 70% apos 4 loops: consolidar e sinalizar gaps

## Step 3 — PRD (20-30 min)

- [ ] Gerar `sprint-planner/<slug>/PRD.md`
- [ ] Escopo IN/OUT explicito
- [ ] Criterios de aceite verificaveis (Given/When/Then)
- [ ] Decisoes menores embedded (contexto, opcoes, escolha)
- [ ] **GATE: Usuario aprova PRD**

## Step 4 — Arquitetura & Schema (15-30 min)

- [ ] Identificar decisoes arquiteturais significativas
- [ ] Gerar `ADR-NNN.md` para cada decisao com 3+ opcoes e trade-offs
- [ ] Se projeto envolve banco: gerar `schema.dbml`
- [ ] Se projeto envolve APIs: listar endpoints com contratos
- [ ] **GATE: Usuario aprova ADRs e schema**

## Step 5 — Roadmap (10 min)

- [ ] Classificar complexidade: simples | medio | complexo
- [ ] Gerar `ROADMAP.md` com fases, duracoes e entregaveis
- [ ] Validar: soma duracoes <= total + 20% margem
- [ ] Validar: cada fase tem pelo menos 1 entregavel concreto
- [ ] **GATE: Fases e prazos validados**

## Step 6 — Task Decomposition (15-20 min)

- [ ] Executar `/plan-to-tasks` no PRD
- [ ] Validar: cada task max 1 dia, DoD mensuravel
- [ ] User stories em Given/When/Then
- [ ] Complexidade scoring (1-25) por story
- [ ] Ordenar por dependencias

## Step 7 — Setup Tasks (10 min)

- [ ] Detectar necessidades: contas, credenciais, infra, repos
- [ ] Gerar tasks P0 com area devops/general
- [ ] Incluir instrucoes passo-a-passo
- [ ] Vincular como pre-requisitos das tasks de dev

## Step 8 — Sprint Assembly (10 min)

- [ ] Gerar `SPRINT-OVERVIEW.md` consolidando tudo
- [ ] Registrar decisoes no `memory/decision-log.json`
- [ ] Apresentar resumo final ao usuario
- [ ] Indicar proximos passos (qual skill usar para executar)

## Armadilhas Comuns

| Armadilha | Sintoma | Solucao |
|-----------|---------|---------|
| Discovery infinito | Mais de 5 loops sem convergir | Consolidar o que tem, sinalizar gaps |
| Scope creep no PRD | PRD com 20+ tasks | Dividir em 2+ sprints |
| ADR para tudo | ADR para decisoes triviais | Embedded no PRD se < 3 opcoes |
| Schema sem RLS | Tabelas sem politicas de seguranca | Sempre incluir nota sobre RLS |
| Setup esquecido | Dev trava por falta de credencial | Phase 6 existe para isso |
| Pular gates | Avancar sem aprovacao | Cada fase TEM que ter aprovacao |

## Tempo Estimado

| Complexidade | Tempo total |
|-------------|-------------|
| Simples (escopo claro, 3-5 tasks) | 45-60 min |
| Medio (ambiguidade moderada, 5-15 tasks) | 60-90 min |
| Complexo (multi-dominio, 15+ tasks) | 90-150 min |

## Continuacao

Apos sprint-planner concluir, o usuario escolhe como executar:

| Objetivo | Comando |
|----------|---------|
| Executar spec-driven (completo) | `/sdd sprint-planner/<slug>/PRD.md` |
| Orquestrar execucao (composicao) | `/compose TASK-YYYYMM-001` |
| Refinar backlog | `@sm` ou `@po` |
| Frontend direto | `/fe` com tasks geradas |
| Backend direto | `/be` com tasks geradas |

## Referencias

- `skills/sprint-planner/SKILL.md` — skill completa
- `templates/adr-tmpl.yaml` — template ADR
- `playbooks/story-creation-playbook.md` — formato de stories
- `playbooks/gsd-agent-decomposition-playbook.md` — padrao de handoff por artefatos
- `skills/sdd/SKILL.md` — para continuacao com execucao
- `skills/plan-to-tasks/SKILL.md` — decomposicao em tasks

## Cadencia Sugerida

- Ao iniciar qualquer projeto novo (greenfield)
- Ao receber novo escopo ou fase de projeto existente (brownfield)
- Quando receber designs Figma ou transcricoes de reuniao para planejar
- Antes de sprints que envolvem multiplos dominios (FE + BE + infra)
