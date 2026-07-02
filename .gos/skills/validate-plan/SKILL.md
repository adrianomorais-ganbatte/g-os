---
name: validate-plan
description: Valida implementacao pos-execute (etapa validate/Senior). Para cada task em validacao, re-roda visual gate curto + verifica criterios de aceite, e CORRIGE gaps deixados pelo Junior antes de concluir. Confronta diff contra Componentes mapeados, confere checklist do plano. Auto-marca concluido o que passa. Fecha plano quando todas as tasks fecham E backend pendings locais estao concluidas.
argument-hint: "<PLAN-NNN-slug> [NOTAS=...]"
allowedTools: [Read, Glob, Grep, Bash, Edit, Agent, AskUserQuestion]
sourceDocs:
  - templates/planTemplate.md
  - templates/taskTemplate.md
  - playbooks/plan-creation-playbook.md
  - skills/execute-plan/SKILL.md
  - skills/progress-tracker/SKILL.md
use-when:
  - validar plano apos *execute-plan ter rodado
  - fechar tasks em validacao -> concluido apos checklist + visual gate curto
  - confirmar que diff staged bate com Componentes mapeados do plano
do-not-use-for:
  - executar tasks (use execute-plan)
  - criar plano novo (use plan-blueprint)
  - decompor plano em tasks (use plan-to-tasks)
metadata:
  category: validation
---

Voce esta executando como **Revisor de Planos (Senior)** via skill `validate-plan`. Fecha o ciclo `*plan -> *execute-plan -> *validate-plan`. Etapa **validate** — resolver o modelo com `node .gos/scripts/tools/model-router.js get validate` (default `claude-opus-4-8`). Diferente de um revisor passivo: o Senior AUDITA e **corrige os GAPs** que o Junior deixou (edita o codigo, re-verifica) antes de concluir.

## Input

$ARGUMENTS

Formato esperado:
- `<PLAN-NNN-slug>` — id do plano (ex.: `PLAN-001-pagina-projetos-inicial`)
- `NOTAS="..."` — opcional, contexto de QA / desvios conhecidos

## Pre-requisitos (gate)

1. Resolver paths via `.gos-local/plan-paths.json`. Ausente -> abortar.
2. Localizar `<dirs.planos>/<PLAN-NNN-slug>/plan.md`. Ausente -> abortar.
3. Ler `plan.md` por completo: frontmatter + Componentes mapeados + Plano de execucao + Checklist de aceite + Backend pendings. Ler tambem `spec.md` (criterios de aceite globais + contrato) — e o padrao contra o qual o Senior audita.
4. Listar arquivos staged: `git diff --staged --name-only`. Vazio -> warning visivel ("nenhuma alteracao staged; *execute-plan rodou?") mas NAO aborta — pode validar plano que ja foi commitado, comparando com `git log` desde `validated_at` ou `created_at`.
5. Ler `<dirs.progress>` (progress.txt). Confirmar que `plan_active` casa com o argumento; se outro plano estiver ativo, perguntar antes de prosseguir.

## Loop por task

**Gate de formato (pre-loop)**: para cada `T-NN*.md` em `<dirs.planos>/<PLAN-NNN-slug>/tasks/`, confirmar `head -1 == "---"` E `grep -q '^status:'` no frontmatter. Tasks malformadas (sem frontmatter ou usando `## Status` no body) sao registradas como erro de plano: validate-plan ABORTA com mensagem `tasks-malformadas: <lista> — rodar scripts/integrations/migrate-task-status.js OU regerar via plan-to-tasks`. Isso evita o falso negativo onde tasks com codigo pronto aparecem `pendente` por bug de gerador (caso PLAN-006).

Iterar tasks cujo frontmatter `status:` seja `validacao`. Tasks em outros estados (pendente, em-andamento, bloqueada-backend, concluido) sao puladas com log curto.

**Diagnostico do bug PLAN-006**: se TODAS as tasks estao em `pendente` E `git diff --staged` ou `git log --since=<plan.created_at>` mostra alteracoes nos arquivos esperados, e provavel que `*execute-plan` rodou sem transicionar (bug do executor). Reportar como `executor-skipped-progress` e instruir humano: rodar `migrate-task-status.js --infer-from-diff` OU re-rodar `*execute-plan PLAN-NNN-<slug>` (que agora tem pos-condicao obrigatoria).

Para cada `T-NNN-NN-*.md` em `validacao`:

1. **Visual gate curto**: para cada componente do plano que a task tocou:
   a) Localizar `<Componente>.stories.tsx` em `<dirs.storybook>`.
   b) Comparar implementacao vs story canonica em 3 dimensoes (curto, sem refazer Figma MCP completo):
      - **Anatomia**: ordem de slots/elementos.
      - **Tokens**: classes Tailwind/variaveis CSS batem com DS — divergencia registrada em `## Page-level overrides` do plano NAO falha (gate confirma aplicacao do override).
      - **Comportamentos**: para cada `interaction_target:` da task, grep do handler/estado no diff. Para cada `override_target:` da task, grep das classes/props da decisao.
   c) Output: append em `tasks/T-NNN-NN.notes.md` na secao `## Validate run <iso>`.
2. **Confronto diff x mapeamento**: arquivos alterados pela task estao listados em "Componentes mapeados" do plano? Arquivos fora do mapeamento -> warning (nao falha por padrao).
3. **Criterios de aceite da task**: ler `## Critérios de aceite` da task. Rodar cada criterio (comando + resultado esperado, ou evidencia no diff). Item nao atendido (`[ ]` / comando falha) = gap a resolver.
4. **Triagem da falha + correcao de GAP pelo Senior**: quando algum criterio/gate falha, **classificar a causa-raiz**:
   - Causa **frontend** (componente faltando, classe errada, handler ausente, anatomia divergente, token errado, comportamento/criterio mapeado sem implementacao no diff): **GAP do Junior**. O Senior **corrige** direto (Edit/Agent) — implementa o que falta, re-roda o gate + o criterio, e so entao conclui. Anti-falso-positivo: re-verificar apos a correcao, nunca auto-declarar. Registrar a correcao em `T-NNN-NN.notes.md`. Se o gap for grande demais para correcao cirurgica (exige re-execucao ampla): manter `validacao`, registrar e instruir `*execute-plan --task T-NNN-NN`.
   - Causa **backend** (smoke falha por ACL/visibilidade/permissao por perfil; dados ausentes no DB; endpoint nao retorna o shape esperado; coluna `-` por seed incompleto fora do escopo da task; perfil/role sem acesso ao recurso): **NAO e gap do frontend**. Acao:
     a) Marcar a task como `concluido` se o codigo frontend esta correto (passou nas 3 dimensoes do gate curto).
     b) Abrir/atualizar entrada LOCAL em `## Backend pendings` do `plan.md` descrevendo o gap (`gap-key`, ex.: `acl-lideranca-projetos-detalhe`). Gap grande -> criar plano-irmao `PLAN-NNN-backend-<slug>` e referenciar na coluna.
     c) Registrar em `T-NNN-NN.notes.md` secao `## Validate run <iso>` o motivo da reclassificacao.
   - Causa **ambigua** (nao da pra decidir entre fe/be sem investigacao adicional): mantem `validacao` E registra alerta ao usuario em `T-NNN-NN.notes.md`. NAO bloquear o plano por ambiguidade.

   **Tudo bate (ou gap corrigido e re-verificado)** -> `*progress status T-NNN-NN concluido` (auto-marca; rollback humano via `*progress status T-NNN-NN pendente --rollback` se necessario).

## Fechamento do plano

Apos o loop:

1. **Cobertura de comportamento**: ler `## Interações & Estados` em `plan.md`. Para cada bullet (slug): existe AO MENOS 1 task com `interaction_target:` apontando pra ele E status `concluido`? Bullet sem cobertura -> plano permanece em `validacao` (registrar em `T-NNN-NN.notes.md` da task mais proxima do dominio).
2. **Cobertura de overrides**: ler `## Page-level overrides`. Cada linha com decisao (a/b/c) tem task `concluido` cobrindo? grep do `override_target:` correspondente nos frontmatter de tasks. Override sem cobertura -> plano permanece em `validacao`.
2.1. **Cobertura de drift map**: ler `## Drift map` (e `<plano>/drift-map.md` se existir). Cada linha tem override implementado OU task `concluido` cobrindo? Linha sem encaminhamento -> plano permanece em `validacao` (registrar em `T-NNN-NN.notes.md` da task mais proxima).
2.2. **Cleanup legado**: para cada task com frontmatter `cleanup_target: <path>`, confirmar que o arquivo foi removido. Comando: `git log --diff-filter=D --name-only --since=<plan.created_at> -- <path>` deve retornar match OU `git diff --staged --name-only --diff-filter=D` contem `<path>`. Falha -> task volta a `validacao` (nao auto-conclui).
3. **Checklist do plano**: ler `## Checklist de aceite` em `plan.md`. Itens nao marcados -> plano permanece em `validacao` mesmo se todas as tasks fecharam.
3.1. **Auditoria de seguranca**: invocar `security-review PLAN-NNN-<slug>` (ou `--staged`). Findings `CRITICAL`/`HIGH` -> viram task de correcao; o Senior corrige (loop) OU plano permanece em `validacao` ate resolver. `MEDIUM`/`LOW` registrados, nao bloqueiam.
3.2. **Auditoria de performance**: invocar `perf-review PLAN-NNN-<slug>`. Findings de alto impacto -> task de otimizacao (nao bloqueia o fechamento salvo se for regressao clara introduzida pelo plano). Registrar os demais.
3.3. **Doc-sync gate** (`libraries/doc-sync-policy.md`): ler `## Impacto documental` do `plan.md`/`spec.md`. Cada doc listada tem alteracao correspondente no diff (regra de negocio/RLS/permissao/seed/contrato tocada => doc atualizada)? Item nao resolvido -> plano permanece em `validacao`.
4. **Backend pendings (local)**: ler `## Backend pendings`. Para cada linha:
   - Se tem plano-irmao `PLAN-NNN-backend-<slug>`: ler o status dele no `progress.txt`.
   - Atualizar a coluna `Status` local (`aberto`/`em-andamento`/`concluido`).
5. **Decisao**:
   - Todas tasks `concluido` + cobertura de comportamento + cobertura de overrides + checklist do plano marcado + **seguranca sem CRITICAL/HIGH aberto** + **doc-sync resolvido** + backend pendings locais todos `concluido` -> marcar `plan.md` frontmatter `validated_at: <iso>` + `*progress status PLAN-NNN-<slug> concluido`.
   - Caso contrario -> manter `validacao`, listar bloqueios.
6. **Push**: NAO. Commit ja foi preparado por `*execute-plan`. Push e ato consciente humano (`git push`).

## Saida final ao usuario

Resumo em 4 blocos:

```
[validate-plan] PLAN-NNN-<slug>

tasks concluidas:   <N>  (T-..., T-...)
gaps corrigidos:    <G>  (T-... pelo Senior)
tasks pendentes:    <M>  (T-..., T-...)
bloqueada-backend:  <K>  (T-...:<gap-key>, ...)
backend pendings:   <X>  abertas (local) / <Y> concluidas

plano: <concluido | validacao>
proximo passo: <git push | resolver bloqueios | re-rodar visual gate em T-...>
```

## Diferenca x execute-plan (anti-overlap)

- `execute-plan`: visual gate completo (5 dimensoes + Figma MCP arvore), pre-flight smoke (screenshot vs frame), executa codigo via Agent tool, opera estado `em-andamento`.
- `validate-plan`: visual gate curto (3 dimensoes — anatomia, tokens, comportamentos — sem Figma MCP completo), nao executa codigo, opera estado `validacao -> concluido`, valida cobertura de `interaction_target` e `override_target` no plano. Reaproveita `notes.md` em secao separada `## Validate run <iso>`.

Se `validate-plan` detectar que uma task em `validacao` claramente NAO foi implementada (diff staged nao toca os arquivos esperados), nao reabre execucao — devolve falha clara e instrui usuario a rodar `*execute-plan PLAN-NNN-<slug> --task T-NNN-NN`.

## Regras criticas

- **Senior corrige gaps**: gap de frontend deixado pelo Junior e CORRIGIDO aqui (Edit/Agent) e re-verificado, nao apenas sinalizado. Auto-conclusao apos correcao + re-verificacao. Rollback humano sempre disponivel.
- **Backend nao impacta status de tasks frontend**: smoke ou e2e que falha por ACL/visibilidade/dados/endpoint NAO mantem task frontend em `validacao` — reclassifica como `concluido` (codigo OK) + abre/atualiza `Backend pendings` local. O fechamento do plano fica bloqueado pelo pending local do backend, NAO pela task frontend.
- **Sem push automatico**: commit ja preparado pelo `*execute-plan`, push e manual.
- **State machine respeitada**: tasks `bloqueada-backend` ficam intocadas — backend tem que fechar primeiro.
- **Backend pendings locais**: o plano so fecha quando os pendings (e planos-irmaos de backend) estao `concluido` no tracking local.

## Model guidance

Etapa **validate** (Senior). Resolver o modelo com `node .gos/scripts/tools/model-router.js get validate` (default `claude-opus-4-8`). O Senior tem capacidade de auditar E corrigir gaps — usar o modelo mais capaz da etapa; nao rebaixar para modelo de execucao.

## Instructions

1. NUNCA pular checklist do plano — itens nao marcados bloqueiam fechamento.
2. NUNCA marcar `concluido` sem visual gate curto + criterios de aceite rodados e gravados em `T-NNN-NN.notes.md`.
3. Backend pendings locais sao vinculantes — plano so fecha quando todos `concluido`.
4. Gap de frontend do Junior: o Senior corrige e re-verifica antes de concluir (sem falso-positivo).
5. Resolver TODOS os paths via `plan-paths.json`.
5. Output final: 4-block summary + comando exato de proximo passo (push manual, ou comandos para resolver bloqueios).
