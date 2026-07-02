# Atualizacao do G-OS — Julho/2026

Registro do que mudou nesta rodada. Branch: `dev`. Fonte da demanda: `tmp/update-g-os.md` (10 itens) + adendo de foco. Design detalhado: `tmp/update-g-os-RELATORIO.md`. Plano de execucao: `~/.claude/plans/resilient-humming-hummingbird.md`. O bloco principal (10 itens) foi `97bd713`..`8c7f2b8`; o follow-up de release/docs esta na secao final.

## Resumo em uma linha

O G-OS deixou de ser "design-to-code com entrega via ClickUp/Slack" e virou **framework de desenvolvimento** — prototipacao, codigo, otimizacao, seguranca, banco — com pipeline de planos onde o Senior planeja, o Junior executa e o Senior audita, e uma unica porta de entrada que roteia tudo.

## O que mudou, por item

### 1. Modelo/provider configuravel por etapa
- Novo bloco `stageModels` em `.gos/config.json` (default: `plan`=Opus/Senior, `execute`=Sonnet/Codex/Junior, `validate`=Opus/Senior).
- Novo `.gos/scripts/tools/model-router.js` resolve a etapa; override local em `.gos-local/models.json` (gitignored).
- `gos init` gera o `models.json` local. Consulta: `node .gos/scripts/tools/model-router.js get <plan|execute|validate>`.
- Regra persistida no `CLAUDE.md` (secao "Model routing por etapa").

### 2. Documentacao sempre sincronizada
- Nova `libraries/doc-sync-policy.md`: regra de negocio criada/alterada/removida obriga atualizar as docs impactadas no mesmo PR.
- Nova secao `## Impacto documental` no `planTemplate.md` e no `specTemplate.md`.
- `validate-plan` bloqueia o fechamento do plano quando um item de impacto documental fica sem atualizacao.

### 3. Auditoria de seguranca
- Novo `libraries/security-audit-playbook.md` (RLS/policy, edge functions sem authz, service-role no client, secrets, SQL/D1 injection, CORS/headers, Zod no boundary, mass-assignment).
- Novo perfil `agents/profiles/security-auditor.md` e skill `security-review`.
- Roda no fechamento do `validate-plan` e sob demanda (`*security-review`). CRITICAL/HIGH bloqueiam o `concluido`.

### 4. Auditoria de performance
- Novo `libraries/performance-audit-playbook.md` (cache, filas, background, cron, N+1, views/materialized, paginacao por filtro/search, over-fetch, indices, bundle). Presets Supabase e Cloudflare D1.
- Novo perfil `agents/profiles/perf-optimizer.md` e skill `perf-review`.
- Roda no fechamento e sob demanda (`*perf-review`).

### 5. Absorcao dos 4 repositorios analisados
Conceitos adaptados ao idioma do G-OS (skill + config + scripts curtos), sem portar runtime:
- **improve**: audit-playbook (categorias de auditoria), plano self-contained com verification gates e STOP conditions, verdict de execucao. Base dos itens 3, 4 e 8.
- **ponytail**: ladder anti-over-engineering (YAGNI -> reuso -> stdlib -> native -> dep -> 1 linha -> minimo) virou `libraries/lazy-dev-policy.md` + skill `simplify-review`.
- **aiox-core / aiox-squads**: model routing por etapa, executor types, quality gates, recovery loop e o padrao de dispatch — viraram o `stageModels`, os gates de skill e a logica de roteamento do master.
- Rejeitado (marketing/nao-dev): brand, seo, curator, education, legal-analyst, kaizen-org-health.

### 6. Remocao de "Douglas"
- Removido como assignee-default de backend em skills, templates, perfis e prosa.
- `LICENSE` preservado (copyright Douglas Oliveira) e acrescido do GitHub do autor (`https://github.com/imdouglasoliveira`).

### 7. Remocao de ClickUp e Slack
- Deletados: skills `clickup`, `slack-review`, `sprint-planner`, `weekly-update`; squad `sprint-planning`; scripts `clickup*.js`, `slack-notify.js`, `post-commit-notify.js`; docs/templates/schemas dedicados; server MCP `clickup`.
- Limpas as referencias em registry, manifest, config, `package.json`, `.mcp.json`, settings, prompts e prosa.

### 8. Novos planos com spec.md + criterios de aceite + loop
- `*plan` passou a emitir tambem `spec.md` (novo `templates/specTemplate.md`): O QUE / ONDE / COMO / POR QUE + contrato backend/frontend + criterios de aceite globais.
- Cada task tem `## Criterios de aceite` verificavel (comando + resultado, ou evidencia no diff).
- **8.2 loop de correcao** no `execute-plan`: criterio OK -> segue; inconclusivo -> bypass + alerta; nao atendido -> corrige ate passar (teto 3, verificacao re-executada, sem falso-positivo).
- `validate-plan` (Senior) **corrige os gaps** deixados pelo Junior e re-verifica antes de concluir.
- Gate deterministico `check-plan.js` reforcado: exige `spec.md` e `## Criterios de aceite` por task.

### 9. Autonomia backend vs frontend (tracking local)
- `plan-blueprint` decide, antes das tasks de frontend, se o backend pronto atende; se nao, gera plano-irmao `PLAN-NNN-backend-<slug>`.
- Tracking 100% local (`## Backend pendings` no `plan.md` + `progress.txt`), sem servico externo.
- Execucao prioriza **backend-first** para destravar o frontend; a garantia "frontend nunca bloqueado" (bypass/`depends_on_backend`/`bloqueada-backend`) foi preservada.

### 10. Duas portas de entrada
- So dois slash commands user-facing: `/gos:agents:gos-master` e `/gos:agents:ux-design-expert`.
- O `gos-master` analisa o input e decide quais skills, agents, subagents e squads acionar, e executa.
- As 34 skills continuam existindo como auto-discoveraveis (o master as invoca); os subagents ficam disponiveis para delegacao.
- Adapters gerados para 6 IDEs: Claude Code, Codex, Qwen, Opencode, Gemini CLI, Antigravity.

## Nova squad e agentes

- Squad **`code-quality`**: seguranca + performance + anti-over-engineering, em nivel de codigo (nao org-health/DORA).
- Agentes: `security-auditor`, `perf-optimizer`.
- Skills: `security-review`, `perf-review`, `simplify-review`.

## Numeros

- Skills: 34 (removidas 4, adicionadas `security-review`, `perf-review`, `simplify-review`).
- Agentes: 11 (adicionados `security-auditor`, `perf-optimizer`).
- Squads dev-focused: `design-delivery`, `design-squad`, `git-operations`, `code-quality`.
- `gos doctor`: 63 checks, workspace saudavel.

## Pontos em aberto (decisao do usuario)

- **Gates sao instrucao, nao script.** O unico gate deterministico (executavel) e o `check-plan.js` na criacao de plano. As auditorias de seguranca/performance, o doc-sync e o loop de criterios de aceite sao regras em markdown que o modelo segue — consistente com o resto do G-OS, mas um modelo pode pular. Enforcement duro exigiria hook/script.
- **Drift de docs de IDE.** `.gos/integrations/registry.json` ainda marca `gemini-cli`/`antigravity`/`cursor`/`kilo-code` como `active` e alguns textos citam "7 IDEs". O gerador cobre 6 (Cursor/Kilo consomem regras via arquivo, nao adapters gerados).

## Como usar depois desta atualizacao

- Criar plano: `*plan <tela>` (emite plan + context + spec + tasks com criterios de aceite + progress).
- Executar: `*execute-plan PLAN-NNN-<slug>` (Junior, visual gate + criterios + loop, backend-first).
- Validar: `*validate-plan PLAN-NNN-<slug>` (Senior, corrige gaps + seguranca + performance + doc-sync).
- Auditar sob demanda: `*security-review`, `*perf-review`, `*simplify-review`.
- Trocar modelo de uma etapa: editar `.gos-local/models.json`.
- Regenerar adapters apos mudar skills/agents: `npm run sync:ides`.

## Commits

| Commit | Descricao |
|--------|-----------|
| `97bd713` | remove integracoes clickup/slack e assignee hardcoded |
| `5afb6c5` | model/provider configuravel por etapa (stageModels) |
| `a80b581` | spec.md + criterios de aceite + loop de correcao + backend-first local |
| `c71e2a2` | auditorias de seguranca e performance + doc-sync gate |
| `1e965d4` | squad code-quality dev-focused + lazy-dev policy |
| `1a3a1a2` | colapsa slash commands a 2 entrypoints; master roteia tudo |
| `f1d216c` | entrypoints tambem em .codex/skills/ (picker do Codex) |
| `de366dd` | github do autor no LICENSE + limpa permissoes de sessao |
| `82ea678` | cleanup de adapters escopado ao prefixo gos- |
| `8c7f2b8` | mantem adapters p/ Gemini + Antigravity (6 IDEs alvo) |

## Follow-up: release beta→main + simplificacao dos docs do NPM

### Resolucao do PR beta→main

A promocao `beta → main` conflitava: a `main` (linha publicada no npm) ainda carregava os arquivos ClickUp/Slack/weekly-update que `dev`/`beta` removeram — dai 5 conflitos `modify/delete` + 2 de conteudo.

- **5 arquivos** (`gos-slack-review`, `gos-weekly-update` em `.agents`, `slack-notify.js`, `weekly-update/CHANGELOG.md`, `weekly-update/SKILL.md`): **deletados** (aceita a remocao do beta).
- **`.env-example`**: versao nova do beta (dev-focused, sem tokens).
- **`package.json`**: merge manual — mantida a `version` da main (nao regredir a linha publicada) + description nova + sem script `clickup`.
- Merge commit `58ba2ba` em `beta`; `merge-tree` confirma `beta→main` limpo. `doctor` OK (63 checks).

### Simplificacao dos docs que vao para o NPM

Os 4 arquivos que o pacote npm envia (`files[]`) foram alinhados ao modelo de **2 entrypoints** (antes apresentavam skills como slash `/gos:skills:` — que nao resolvem — e tabelas de 9 agentes-comando):

- **`README.md`** (pagina do npm): instalacao **global** como caminho primario; 2 portas de entrada; skills reagrupadas por capacidade (invocadas pelo master); secao de update enxugada (tri-nivel → tabela) e dump de `plan-paths.json` removido; `doctor` 42+ → 63; licenca alinhada ao `LICENSE` (MIT/Douglas Oliveira).
- **`CLAUDE.md` / `AGENTS.md` / `GEMINI.md`**: mesma correcao — 2 entrypoints slash, agentes internos nao-slash (`+security-auditor`/`perf-optimizer`), 34 skills auto-discoveraveis, pipeline com `spec.md`/`execute-plan`/`validate-plan`; removidos "entrega de sprint"/"sync com stakeholders"; paths corrigidos.

### Commits do follow-up (dev)

| Commit | Descricao |
|--------|-----------|
| `5209c0a` | simplifica README do NPM p/ modelo de 2 entrypoints |
| `147f690` | alinha CLAUDE/AGENTS/GEMINI ao modelo de 2 entrypoints |

> Os docs so aparecem na pagina do npm apos o fluxo `dev → beta → main → publish` (o merge do PR beta→main dispara `publish.yml`, bump `0.2.41 → 0.2.42`).

## Rodada 2 — Arquitetura antes de codigo + master explicavel

Diretriz do usuario absorvida como **regra de operacao sempre-ativa** (nao skill nova): decidir arquitetura antes de codigo, avaliar referencia antes de copiar, nao defaultar auth/deploy/DB por habito, gerar diagramas Mermaid de fluxo, e um `gos-master` que explica cada acao em nivel de produto/negocio para tecnico e nao-tecnico.

Decisoes travadas com o usuario: **reaproveitar o que ja existe** (`docs/stack.md`=stack-do-projeto, `docs/adr/`=decisoes, `dirs.fluxos`=fluxos) em vez de criar `docs/arquitetura/` paralela — o contrato/`stack_ref`/sha-lock do pipeline fica intacto; e **tom hibrido** (commanding em decisao, didatico/produto em explicacao).

### O que mudou

- **Policy canonica** `.gos/libraries/architecture-stack-policy.md` (nova): referencia != decisao; stack-first; auth/servicos own-vs-managed; Mermaid como padrao; comunicacao explicavel. Molde de `lazy-dev-policy.md`, com secao `## Aplicacao no G-OS`.
- **Ligacao aos docs do npm**: nova secao `## Arquitetura & Stack` no `CLAUDE.md`; blocos equivalentes no `AGENTS.md` e `GEMINI.md`.
- **Master explicavel** (`ganbatte-os-master.md`): novo `core_principle` "arquitetura antes de codigo"; nova regra `output_policy.explicabilidade_produto` (toda acao relevante vem com explicacao de produto/negocio, tecnico como camada opcional); `communication.tone_hibrido`; `proactive_suggestions.decisao_arquitetural` enriquecido com "avaliar referencia antes de copiar + own-vs-managed". Cleanup: `complementary_rules` apontava 3 arquivos inexistentes (`research-discipline`/`think-before-act`/`context-first-antes-acao`) → trocados pelos 2 reais (`demand-elegance.md`, `plan-mode.md`).
- **Pipeline**: `plan-blueprint` ganhou **Fase 2.3 "Avaliar referencia antes de copiar"** (preventiva, antes do schema gate) + emissao de Mermaid quando ha auth/dados/jornada; `sourceDocs` da policy em `plan-blueprint`/`stack-profiler`/`adr-tech-decisions`.
- **Templates**: `planTemplate.md` — `## Fluxo de navegacao`/`## Fluxo de dados` viram blocos ```mermaid e ganha `## Fluxo de auth` (condicional). `stackTemplate.md` — secao 10 linka os diagramas em `dirs.fluxos`.
- **Gate**: `check-plan.js` — aviso **nao bloqueante** quando um plano com `## Fluxo de auth/dados` nao traz bloco ```mermaid.
- **Config**: `scripts/tools/plan-paths.js` — `dirs.fluxos` ganhou default `docs/fluxos/` (antes `null`; chave nao consumida, mudanca segura).

### Validacao

`sync:ides` OK (2 entrypoints, 11 subagents, 34 skills — sem regressao); `check:ides` OK; `gos doctor` 63 checks saudavel. Nenhuma pasta `docs/arquitetura/` criada; `stack_ref`/gates de drift inalterados. Adapters `.codex`/`.gemini`/`.opencode`/`.claude/skills` sao gitignored; `.qwen`/`.agent` regeneraram identicos (nao embutem o corpo do profile).
