---
name: audit-screenshots
description: Skill conversacional de auditoria visual STREAMING. Abre UM plano de correcao (status aberto) e escreve cada task NA HORA por insumo (print/screenshot + Figma URL), em vez de enfileirar e processar no fim. Cada divergencia passa pelo gate de reuso de componente (design-to-code): mapeia -> checa biblioteca -> reuse/create/merge. Usa Figma MCP (expected), Playwright (actual), figma-print-diff (confronto). Modo validate confronta Figma x implementado varrendo figma-screen-map.md. check-plan.js roda so no finalize.
argument-hint: "<acao> [SLUG|tipo-tela]   # acao: open | add | validate | list | finalize [SLUG] | discard"
allowedTools: [Read, Glob, Grep, Bash, Write, Edit, AskUserQuestion]
sourceDocs:
  - skills/figma-print-diff/SKILL.md
  - skills/component-dedup/SKILL.md
  - skills/plan-blueprint/SKILL.md
  - libraries/component-reuse-gate.md
  - libraries/visual-diff-lenses.md
  - templates/planTemplate.md
  - templates/taskTemplate.md
  - playbooks/audit-streaming-playbook.md
use-when:
  - usuario cola print + diz "isso aqui esta errado" (vira task na hora no plano aberto)
  - usuario pede "compara essa tela com Figma e abre a correcao"
  - usuario quer auditar varias telas de um tipo (validate) confrontando Figma x implementado
  - acumular correcoes de N telas em UM plano de fix, com task escrita por insumo
do-not-use-for:
  - executar correcao (use *execute-plan apos *audit-screenshots finalize)
  - planejar tela nova (use *plan / plan-blueprint)
  - validar plano executado (use *validate-plan)
metadata:
  category: planning
---

Voce esta executando como **Auditor Visual Streaming** via skill `audit-screenshots`. Ao inves de
enfileirar prints e materializar o plano so no fim, voce **abre UM plano de correcao imediatamente**
(`status: aberto`) e **escreve cada task na hora** que recebe um insumo (print/screenshot + Figma URL +
contexto). Cada divergencia passa pelo **gate de reuso de componente** (design-to-code) antes de virar
task. O plano so e' fechado e validado por `check-plan.js` no `finalize`.

## Por que streaming (pivot do modelo de fila)

O modelo antigo (`add` acumula em `audit-session.json` -> `close` materializa tudo) perdia contexto e
nao funcionava bem. O modelo novo:

- **Plano-primeiro**: `open` cria `plan.md` (draft) antes de qualquer insumo. O diretorio do plano E' o
  estado — nao existe mais `audit-session.json`.
- **Task-por-insumo**: cada print/tela vira task `status: pendente` na hora, com sua evidencia anexada.
- **Gate de reuso por divergencia**: divergencia de table/card/form -> reusa primitiva existente ou cria
  (nunca patch one-off). Ver `libraries/component-reuse-gate.md`.

## Contrato atomico x streaming (CRITICO — nao quebrar check-plan.js)

`check-plan.js` exige todas as tasks `status: pendente` NA CRIACAO e e' byte-identico ao canonico.
NUNCA modificar o gate. A conciliacao e' por status do plano:

1. `open` escreve `plan.md` com **`status: aberto`** (draft). **NAO** roda check-plan.
2. `add`/`validate` escrevem cada `T-NN*.md` ja com **`status: pendente`** (eager).
3. `finalize` flipa `plan.md` para **`status: pendente`** e **so entao** roda `check-plan.js`.

Plano `aberto` e' um estado valido intermediario; plano so vira input de `*execute-plan` apos `finalize`.

## Contrato single-pass do `add` (CRITICO — fix do gargalo de contexto)

A comparacao actual vs Figma deve ser SEMPRE single-pass dentro de `add`, delegada a `figma-print-diff`:

1. Capturar actual (print colado OU Playwright) -> imagem em disco + em contexto.
2. Pull do frame Figma via MCP -> 2 imagens em contexto.
3. `figma-print-diff` aplica lenses 1-6 (`libraries/visual-diff-lenses.md`) IMEDIATAMENTE, ambas visiveis.
4. Divergencias materializadas em texto COMPLETO (`where`, `expected`, `actual`) — NUNCA "ver imagem".
5. Gate de reuso de componente roda sobre as divergencias estruturais.
6. Task escrita na hora, self-contained. Imagens ficam em `audit-evidence/` para historico.

Violacao -> bug. Insumo cuja task ficar incompleta/vazia: re-rodar `add` daquele print.

## Input

$ARGUMENTS

Formato: `<acao> [SLUG-ou-tipo-tela]`

Acoes:
- `open [SLUG]` — abre o plano de correcao (draft). Default do SLUG: `<projeto>-<iso-date>`.
- `add` (default quando o usuario cola imagem) — registra 1+ insumos -> 1 task cada, NA HORA.
- `validate <tipo-tela|--all>` — sweep: varre `figma-screen-map.md`, captura+confronta cada tela do tipo.
- `list` — resumo do plano aberto (telas, tasks, decisoes de componente).
- `finalize [SLUG]` — fecha + valida (`check-plan.js`).
- `discard` — aborta o plano aberto.

Quando o usuario cola imagem sem comando explicito: se existe plano aberto -> `add`; senao -> `open`
(criar plano com SLUG default) e em seguida `add`.

## Pre-requisitos (gate)

1. Resolver paths via `.gos-local/plan-paths.json`. Ausente -> abortar e instruir rodar `*plan` ou criar manualmente.
2. Resolver `dirs.figma_screen_map` (campo `figma_screen_map`; default `<dirs.docs>/figma-screen-map.md`).
   Arquivo ausente -> abortar: "rode *audit-screenshots apenas em projetos que mantenham docs/figma-screen-map.md".
3. Resolver `dirs.audit_evidence` (campo `audit_evidence`; default `<plano>/audit-evidence`).
4. Resolver **plano aberto corrente** via `progress.txt` (set-current). Se o plano corrente nao tem
   `status: aberto`, `add`/`validate` exigem um `open` antes (ou abrem um novo).

## Acao open [SLUG]

1. **Resolver SLUG**: argumento explicito > `<projeto-name>-<iso-date>`. Sanitizar (lowercase, hifens).
2. **Calcular PLAN-NNN**: ler `<dirs.planos>/` e pegar maior NNN + 1.
3. **Escrever `<dirs.planos>/PLAN-NNN-fix-<SLUG>/plan.md`** de `templates/planTemplate.md`:
   - Frontmatter: `objetivo: correcao`, **`status: aberto`**, `audit_streaming: true`, `created_at: <iso>`,
     `figma_url:` (preenchido no primeiro `add`).
   - Secoes vazias prontas para append: `## Contexto`, `## Componentes mapeados`, `## Interacoes & Estados`,
     `## Page-level overrides`, `## Backend pendings`, `## Drift map`.
4. **Escrever `context.md`** (template `contextTemplate.md`).
5. **Criar `tasks/` vazio** e `audit-evidence/`.
6. **progress-tracker set-current** apontando o plano novo (status aberto).
7. **NAO rodar check-plan.js** (plano e' draft).
8. Output:

       [audit] PLAN-NNN-fix-<SLUG> ABERTO (status: aberto)
       cole prints (add) ou rode *audit-screenshots validate <tipo-tela> | finalize

## Acao add

Para cada insumo (print colado OU rota a capturar):

1. **Identificar tela** (prioridade):
   a) Mencao explicita do usuario ("aba negocios", "/dashboard/projetos/123") -> match no figma-screen-map.
   b) Heuristica visual: ler titulo/breadcrumb/URL do print (multimodal) -> substring contra "Rota app".
   c) Ambiguo: `AskUserQuestion` com 5 candidatos top do mapa + "outro".
2. **Resolver figma_node_id + URL** via lookup no mapa.
3. **Capturar ACTUAL**:
   - Print colado pelo usuario -> salvar em `<audit_evidence>/NN.png`.
   - Sem print -> **Playwright** captura a rota viva (`browser_navigate` + `browser_take_screenshot`,
     headless) -> `<audit_evidence>/NN.png`. Casos interativos (hover/drawer aberto) -> browser-use.
4. **Pull EXPECTED**: Figma MCP `get_image` pelo node-id -> `<audit_evidence>/NN.figma.png`. MCP
   indisponivel: seguir so com actual + node-id (registrar `figma_image_path: null`).
5. **Confrontar (single-pass)**: invocar `figma-print-diff <audit_evidence>/NN.png <figma-url>` -> JSON de
   divergencias (lenses 1-6, cada uma com `where`/`expected`/`actual`/`kind`/`severity`/`fix`).
6. **Gate de reuso de componente** (`libraries/component-reuse-gate.md`) por divergencia estrutural
   (table/card/form/list/modal/toolbar):
   - Mapear elemento -> componente DS candidato (indexar `dirs.components/` + `.stories.tsx`, estilo
     `plan-blueprint` Fase 1.3).
   - Rodar `component-dedup` (candidato vs biblioteca) -> decisao `reuse | create | merge` + score.
   - Heuristica DataTable: divergencia de tabela -> `component_target` = primitiva existente (ex.:
     `components/ui/data-table.tsx`); correcao e' nas `columns`/dados OU na primitiva — nunca `<table>` novo.
7. **Escrever task(s) NA HORA** em `tasks/T-NN-<componente>-<fix-slug>.md` (1 task por divergencia,
   agrupando triviais por componente), modelo **O QUE / ONDE / COMO / POR QUE**:
   - Frontmatter: **`status: pendente`**, `priority` (high-signal/anotacao vermelha -> P0), `area`
     (`ui-ux` token/anatomy | `frontend` behavior/data-missing), `audit_evidence: audit-evidence/NN.png`,
     `figma_url:`, `component_decision: reuse|create|merge`, `component_target:`, e quando aplicavel
     `interaction_target:` / `override_target:` / `depends_on_backend:`.
   - `## Contexto` (por que: a divergencia), `## Objetivo`+`### Entrega` (o que), `## Arquivos` (onde: path
     concreto criar/editar), `## Plano de execucao` (como). Task sem path concreto e' malformada.
   - `create` gera task de criacao da primitiva ANTES da task de uso (`depends_on`).
8. **Append no plano**: 1 linha em `## Componentes mapeados`, divergencia em `## Drift map`, behavior em
   `## Interacoes & Estados`, token em `## Page-level overrides` (decisao a/b/c), data-missing em
   `## Backend pendings`.
9. **Output curto**:

       [audit] +1 tela: <rota> (node-id NNNN-NNNNN) -> <T> task(s) escritas
       divergencias: <K> (alta <H>) | reuso: <reuse>R <merge>M <create>C
       proximo: cole outro print | *audit-screenshots validate <tipo> | list | finalize

## Acao validate <tipo-tela|--all>

Sweep sistematico Figma x implementado, alimentando o mesmo fluxo de `add`:

1. Ler `figma-screen-map.md` e filtrar telas por `tipo-tela` (coluna de secao/categoria) ou todas (`--all`).
2. Para cada tela: resolver rota + node-id; **Playwright** captura actual; Figma MCP pull expected;
   `figma-print-diff` confronta; gate de reuso; **escrever task(s) na hora** (passos 5-8 do `add`).
3. Telas sem node-id no mapa -> warning, pular (registrar em `## Notas` do plano).
4. Output: tabela tela x divergencias x tasks geradas + total.

Requer `open` previo (ou abre plano novo `PLAN-NNN-fix-validate-<tipo>`).

## Acao list

Le `tasks/` do plano aberto (NAO re-le imagens) e imprime:

    [audit PLAN-NNN-fix-<SLUG>] status: aberto

    #  task                              tela                       decisao   priority
    1  T-01-data-table-area-column       /dashboard/projetos        reuse     P1
    2  T-02-stat-card-flat               /dashboard                 merge     P1

    total: N tasks em K telas | reuso: R reuse / M merge / C create
    proximo: *audit-screenshots finalize <SLUG>  ->  roda check-plan.js

## Acao finalize [SLUG]

**REGRA**: `finalize` opera sobre os arquivos ja escritos (tasks + plan). NAO re-le imagens, NAO re-confronta.

1. **Resolver plano aberto** (progress.txt set-current) ou pelo SLUG.
2. **Validar self-contained**: cada `T-NN*.md` tem `## Arquivos` com path concreto, `## Objetivo`,
   `## Plano de execucao`, e frontmatter `status: pendente`. Faltando -> abortar listando tasks incompletas
   (instruir re-rodar `add` daquele insumo). `finalize` nao conserta.
3. **Flip do plano**: `plan.md` frontmatter `status: aberto` -> **`status: pendente`**. Preencher `## Contexto`
   consolidado (lista de telas auditadas).
4. **Disparar `ui-guardrails <plano>`** — trava task de UI sem estados/responsivo/a11y/tokens.
5. **progress-tracker set** (status pendente).
6. **Rodar gate deterministico** `node <repo>/.gos/scripts/integrations/check-plan.js <plano>`:
   - Exit 0 -> seguir.
   - Exit != 0 -> abortar e devolver a saida literal do check-plan.
7. Output final:

       [audit-screenshots] PLAN-NNN-fix-<SLUG> FINALIZADO (status: pendente)

       telas auditadas:  <K>
       tasks:            <T> (<P0> P0 / <P1> P1) | reuso: <R>R <M>M <C>C
       plano:    docs/plans/PLAN-NNN-fix-<SLUG>/plan.md
       progress: atualizado (status=pendente)

       proximo passo: *execute-plan PLAN-NNN-fix-<SLUG>

## Acao discard

1. Confirmacao inline (`AskUserQuestion`: Sim, descartar / Nao, manter).
2. Confirmado: remover `<dirs.planos>/PLAN-NNN-fix-<SLUG>/` (plano + tasks + audit-evidence) e limpar
   progress set-current. Output: `[audit] plano aberto descartado (T tasks, N evidencias removidas)`.

## Resolver de tela (parser do figma-screen-map.md)

`figma-screen-map.md` e' markdown com tabelas `| Tela | ... | Rota app | node-id | ... |`.

1. Ler arquivo. Extrair todas as tabelas (linhas iniciando com `|`).
2. Identificar colunas `Rota app` e `node-id` por tabela (case-insensitive).
3. Construir lookup `{rota_normalizada: {node_id, secao, label}}` (lowercase, query strings opcionais).
4. Match: equality exato > substring (warning) > multiplos (`AskUserQuestion`).
5. Suportar query strings (`?tab=negocios`) como parte da rota.

## Acoplamento com pipeline

- Plano gerado e' input direto de `*execute-plan` e `*validate-plan` — segue o template padrao + frontmatter.
- `figma-print-diff` e' a primitiva de confronto (single-pass) — esta skill nao reimplementa lenses.
- `component-dedup` + `libraries/component-reuse-gate.md` resolvem reuse/create/merge — nao duplicar.
- Sub-fases 1.5 (drift) e 1.6 (cleanup legado) do `plan-blueprint` NAO rodam aqui (o audit JA e' drift
  empirico). Se `legacy_starter_dirs` em plan-paths.json, divergencias `cleanup-legacy` viram task.
- Schema gate (Fase 2.4) NAO roda; divergencias `data-missing` viram `## Backend pendings` direto.
- `plan-blueprint` e' "1 tela = 1 plano"; o audit e' "N telas -> 1 plano de fix" (orquestracao por cima).

## Regras criticas

- **Sem execucao**: skill NUNCA modifica codigo da aplicacao. So cria plano + tasks (status: pendente).
  User roda `*execute-plan` separado.
- **Plano-primeiro**: `open` antes de qualquer insumo. O diretorio do plano E' o estado (sem audit-session.json).
- **Eager + self-contained**: cada insumo vira task na hora, com evidencia textual completa. `finalize` so valida.
- **Gate de reuso obrigatorio**: divergencia estrutural sempre passa por reuse/create/merge antes de virar task.
- **check-plan.js so no finalize**: nunca na abertura. Nunca modificar o gate.
- **Mapeamento canonico obrigatorio**: sem `figma-screen-map.md`, skill aborta.
- **Anotacoes em vermelho = high-signal**: peso 2x (P0).

## Model guidance

| Escopo | Modelo |
|--------|--------|
| add com 1-2 prints simples | sonnet |
| add com print complexo (10+ divergencias) / gate de reuso denso | opus |
| validate sweep (5+ telas) | opus |
| list / discard | haiku |

## Instructions

1. Ao receber imagem sem comando: plano aberto existe -> `add`; senao -> `open` + `add`.
2. NUNCA executar codigo da aplicacao — skill so planeja.
3. Estado vive no diretorio do plano aberto (status: aberto) ate `finalize` ou `discard`.
4. `add`/`validate` escrevem tasks `status: pendente` na hora; `finalize` flipa o plano e roda check-plan.js.
5. Confronto visual delegado a `figma-print-diff`; reuso a `component-dedup` + `component-reuse-gate.md`.
6. Ao final do `finalize`, instruir `*execute-plan PLAN-NNN-fix-<SLUG>`.
