# Atualizacao do G-OS — Julho/2026

Registro do que mudou nesta rodada. Branch: `dev` (10 commits, `97bd713`..`8c7f2b8`). Fonte da demanda: `tmp/update-g-os.md` (10 itens) + adendo de foco. Design detalhado: `tmp/update-g-os-RELATORIO.md`. Plano de execucao: `~/.claude/plans/resilient-humming-hummingbird.md`.

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
