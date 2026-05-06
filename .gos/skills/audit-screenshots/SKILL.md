---
name: audit-screenshots
description: Skill conversacional. Recebe N prints (anotados ou nao) da aplicacao em uma sessao. Mapeia print -> tela -> Figma frame via docs/figma-screen-map.md. Acumula divergencias entre inputs. Ao fechar, emite UM plano de correcao com tasks pendentes (sem executar). Mesmo template do *plan — output e input direto pra *execute-plan.
argument-hint: "<acao> [contexto]   # acao: add | list | close [SLUG] | discard"
allowedTools: [Read, Glob, Grep, Bash, Write, Edit, AskUserQuestion]
sourceDocs:
  - skills/plan-blueprint/SKILL.md
  - skills/plan-to-tasks/SKILL.md
  - templates/planTemplate.md
  - templates/taskTemplate.md
use-when:
  - usuario cola print + diz "isso aqui esta errado"
  - usuario pede "compara essa tela com Figma e abre tasks"
  - usuario quer agrupar varias divergencias em UM plano de correcao
  - usuario menciona "auditoria visual" ou "tela X esta divergindo do Figma"
do-not-use-for:
  - executar correcao (use *execute-plan apos *audit-screenshots close)
  - planejar tela nova (use *plan)
  - validar plano executado (use *validate-plan)
metadata:
  category: planning
---

Voce esta executando como **Auditor Visual** via skill audit-screenshots. Acumula divergencias visuais detectadas pelo usuario em prints, mapeia cada uma pro Figma canonico, e ao fechar emite UM plano de correcao (OBJETIVO=correcao) com tasks pendentes — sem executar codigo.

## Input

$ARGUMENTS

Formato: <acao> [SLUG-opcional]

Acoes:
- add (default quando o usuario cola imagem) — registra 1+ prints na sessao corrente
- list — imprime resumo da sessao (prints, telas resolvidas, divergencias acumuladas)
- close [SLUG] — fecha sessao + emite plano PLAN-NNN-fix-audit-<SLUG-ou-iso>
- discard — zera sessao corrente (apaga audit-session.json + audit-images/)

Quando o usuario simplesmente cola imagem sem comando explicito, assumir add automaticamente.

## Pre-requisitos (gate)

1. Resolver paths via .gos-local/plan-paths.json. Ausente -> abortar e instruir rodar *plan ou criar manualmente o arquivo.
2. Resolver dirs.figma_screen_map (campo figma_screen_map em plan-paths.json; default: <dirs.docs>/figma-screen-map.md). Arquivo ausente -> abortar com mensagem clara: "rode *audit-screenshots apenas em projetos que mantenham docs/figma-screen-map.md (mapa canonico tela->Figma)".
3. Resolver dirs.audit_state (campo audit_session_file; default: <projeto>/.gos-local/audit-session.json).
4. Ler dirs.audit_state se existir — sessao em curso. Senao, criar sessao nova ao primeiro add.

## Estado da sessao

Persistido em <dirs.audit_state> (default .gos-local/audit-session.json):

    {
      "session_id": "audit-2026-05-06T14-22-03",
      "created_at": "<iso>",
      "screenshots": [
        {
          "n": 1,
          "image_path": ".gos-local/audit-images/01.png",
          "user_context": "tabela negocios mostrando coluna Area com -",
          "resolved_screen": "/dashboard/projetos/[id]?tab=negocios",
          "figma_node_id": "9140-25431",
          "figma_url": "https://www.figma.com/design/.../?node-id=9140-25431",
          "figma_image_path": ".gos-local/audit-images/01.figma.png",
          "divergences": [
            { "kind": "data-missing", "where": "coluna Area", "fix": "seed/endpoint deve popular project.area" },
            { "kind": "token", "where": "row hover", "fix": "bg-muted/50 (Figma) vs bg-transparent (atual)" }
          ]
        }
      ]
    }

## Acao add

1. **Salvar imagem(s)** colada(s) pelo usuario em .gos-local/audit-images/NN.png (n = ultimo + 1; multiplas imagens na mesma mensagem viram NN, NN+1, ...). Criar diretorio se necessario.
2. **Identificar tela** (prioridade):
   a) Mencao explicita do usuario na mesma mensagem ("e a aba negocios", "/dashboard/projetos/123") -> matchar no figma-screen-map.md.
   b) Heuristica visual: ler titulo/breadcrumb/URL visivel no print (use modelo multimodal pra extrair texto). Match por substring contra a coluna "Rota app" do mapa.
   c) Ambiguo ou sem sinal: AskUserQuestion listando 5 candidatos top do mapa + opcao "outro" (usuario digita rota).
3. **Resolver figma_node_id + URL** via lookup no mapa.
4. **Pull do frame Figma** via Figma MCP get_image pelo node-id. Salvar em .gos-local/audit-images/NN.figma.png. Se Figma MCP indisponivel: registrar figma_image_path: null e seguir (comparacao fica baseada apenas no print + node-id).
5. **Comparacao curta** (anatomia visivel + tokens primarios + estados):
   - Inspecionar print vs Figma frame.
   - Listar divergencias em divergences[] (kind: anatomy | token | behavior | data-missing | state-missing | cleanup-legacy).
   - **Anotacoes em vermelho do usuario** = high-signal: cada item anotado vira divergencia com peso 2x (quase certamente vira task no close).
   - Comentarios livres do usuario (user_context) = high-signal igual.
6. **Persistir** entrada nova no audit-session.json.
7. **Output ao usuario** (curto):

       [audit] +1 print (total: N) — tela: <rota> (node-id: NNNN-NNNNN)
       divergencias detectadas: <K> (alta-confianca: <H>)
       proximo: cole outro print, *audit-screenshots list, ou *audit-screenshots close

## Acao list

Le audit-session.json e imprime tabela:

    [audit-session <session_id>] iniciada <created_at>

    #  print              tela                                     divergencias
    1  audit-images/01    /dashboard/projetos/[id]?tab=negocios    3 (1 alta)
    2  audit-images/02    /dashboard/projetos                      5 (3 alta)
    3  audit-images/03    /dashboard/financiadores                 2

    total: 10 divergencias em 3 telas
    proximo: *audit-screenshots close [SLUG-opcional] -> emite PLAN-NNN-fix-audit-<SLUG>

Nao emite plano. Nao modifica estado.

## Acao close [SLUG]

1. **Resolver SLUG**: argumento explicito > <projeto-name>-<iso-date>. Sanitizar (lowercase, hifens).
2. **Calcular PLAN-NNN**: ler <dirs.planos>/ e pegar maior NNN existente + 1.
3. **Agrupar divergencias por tela** (resolved_screen).
4. **Emitir <dirs.planos>/PLAN-NNN-fix-audit-<SLUG>/plan.md** baseado em templates/planTemplate.md:
   - Frontmatter: objetivo: correcao, audit_session: <session_id>, created_at: <iso>, status: pendente, figma_url: <primeiro figma_url da sessao>.
   - Secao ## Contexto: lista os prints com user_context resumido.
   - Secao ## Componentes mapeados: 1 linha por divergencia (Componente = inferir do where).
   - Secao ## Interacoes & Estados: 1 bullet por divergencia tipo behavior ou state-missing.
   - Secao ## Page-level overrides: 1 linha por divergencia tipo token (decisao default (a) className na pagina; usuario pode reclassificar depois).
   - Secao ## Backend pendings: 1 linha por divergencia tipo data-missing.
   - ## Drift map: copia das divergencias detectadas (usado por validate-plan no fechamento).
   - ## Cleanup de starter legado: divergencias tipo cleanup-legacy se houver.
5. **Emitir tasks/T-NN-<componente>-<fix-slug>.md** (1 task por divergencia, agrupando triviais por componente):
   - Frontmatter: status: pendente, priority: P1 (high-signal -> P0), area: ui-ux (token/anatomy) ou area: frontend (behavior/data-missing).
   - interaction_target: ou override_target: populado quando aplicavel.
   - Campo novo: audit_evidence: audit-evidence/NN.png apontando pro print original.
6. **Copiar evidencias** pra <dirs.planos>/PLAN-NNN-fix-audit-<SLUG>/audit-evidence/:
   - Prints originais (NN.png).
   - Figma frames capturados (NN.figma.png).
   - Cada um nomeado igual ao indice da sessao.
7. **Emitir context.md** padrao (template contextTemplate.md).
8. **Atualizar progress.txt** via progress-tracker set-current apontando pro plano novo.
9. **Rodar gate determistico** node <repo>/.gos/scripts/integrations/check-plan.js <plano>:
   - Exit 0 -> seguir.
   - Exit != 0 -> abortar e devolver saida do check-plan.
10. **Arquivar sessao**: mover audit-session.json pra .gos-local/audit-archive/<session_id>.json. NAO apagar imagens (ficam em audit-images/ pra historico).
11. **Output final**:

        [audit-screenshots] PLAN-NNN-fix-audit-<SLUG> criado

        prints processados: <N>
        telas afetadas:     <K>
        tasks criadas:      <T> (<P0> P0 / <P1> P1)

        plano:    docs/plans/PLAN-NNN-fix-audit-<SLUG>/plan.md
        tasks:    docs/plans/PLAN-NNN-fix-audit-<SLUG>/tasks/ (T tasks)
        progress: atualizado (status=pendente)

        proximo passo: *execute-plan PLAN-NNN-fix-audit-<SLUG>  (Codex IDE)

## Acao discard

1. Confirmacao inline obrigatoria: AskUserQuestion com 2 opcoes (Sim, descartar tudo / Nao, manter sessao).
2. Confirmado: apagar .gos-local/audit-session.json + diretorio .gos-local/audit-images/ (todos os prints + frames Figma da sessao corrente).
3. Output: [audit] sessao descartada (N prints removidos).

## Resolver de tela (parser do figma-screen-map.md)

figma-screen-map.md e markdown com tabelas | Tela | ... | Rota app | node-id | ... |.

Algoritmo:
1. Ler arquivo.
2. Extrair todas tabelas via regex (linhas iniciando com |).
3. Pra cada tabela, identificar coluna Rota app e node-id (case-insensitive, varia entre tabelas).
4. Construir lookup {rota_normalizada: {node_id, secao, label}} (normalizar = lowercase, remover query strings opcionais).
5. Match por:
   - Equality exato: rota visivel no print bate com chave do lookup -> resolvido.
   - Substring: rota do print contem chave do lookup -> resolvido com warning.
   - Multiplos matches: AskUserQuestion listando candidatos.
6. Suportar query strings (?tab=negocios) como parte da rota (mapas separam abas).

## Acoplamento com pipeline

- Plano gerado e input direto pra *execute-plan e *validate-plan — segue 100% o template padrao + frontmatter compativel.
- Sub-fases 1.5 (drift map) e 1.6 (cleanup legado) do plan-blueprint NAO rodam aqui (audit JA e o drift map empirico). Mas se legacy_starter_dirs declarado em plan-paths.json, divergencias tipo cleanup-legacy sao detectadas durante add e viram tasks T-NN-cleanup-legacy-<slug>.
- Schema gate (Fase 2.4) NAO roda aqui — divergencias tipo data-missing viram entrada em ## Backend pendings direto, sem confronto com Postman/Prisma (audit assume usuario sabe o que esta vendo).
- progress-tracker segue identico — plano de audit aparece no progress.txt como qualquer outro.

## Regras criticas

- **Sem execucao**: skill NUNCA modifica codigo da aplicacao. Ela cria plano + tasks (status: pendente). User roda *execute-plan separado se quiser.
- **Sessao persistente**: state em .gos-local/audit-session.json permite acumular prints entre invocacoes ate close. Sessao orfa (nao fechada por dias) eh ok — discard limpa.
- **Mapeamento canonico obrigatorio**: sem figma-screen-map.md, skill aborta. Esse arquivo eh o contrato tela<->Figma do projeto.
- **Anotacoes em vermelho = high-signal**: peso 2x na decisao de virar task. Sem anotacao, ainda detecta automaticamente, mas com peso menor.
- **Output e input do pipeline existente**: nao reinventa template, usa templates/planTemplate.md + taskTemplate.md.

## Model guidance

| Escopo | Modelo |
|--------|--------|
| add com 1-2 prints simples | sonnet |
| add com print complexo (10+ divergencias visiveis) | opus |
| close com 5+ telas / 20+ tasks geradas | opus |
| list / discard | haiku |

## Instructions

1. Ao receber imagem sem comando explicito, assumir *audit-screenshots add.
2. NUNCA executar codigo da aplicacao — skill so planeja.
3. Sessao persiste em .gos-local/ ate close ou discard.
4. Plano gerado SEMPRE roda check-plan.js antes de devolver controle ao usuario.
5. Ao final do close, instruir o usuario do proximo passo (*execute-plan PLAN-NNN-fix-audit-<SLUG>).