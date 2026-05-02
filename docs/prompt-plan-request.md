# Prompt G-OS — `*plan` simplificado

> Invocação canônica: `/gos:agents:gos-master`. Plano vive em
> `<PROJETO>/docs/plans/PLAN-NNN-<tela>/plan.md`.
> **Sempre dois turns**: `*plan` (gera) → `*execute-plan` (executa, no Codex IDE).

---

## Template mínimo

```
/gos:agents:gos-master *plan {{TELA}}

OBJETIVO  = {{implantacao | correcao | refactor}}
FIGMA     = {{url-frame-principal}}
FIGMA+    = [{{url-comp-1}}, {{url-comp-2}}]    # opcional
NOTAS     = """{{prosa livre — comportamento, edge cases, invioláveis}}"""
```

`OBJETIVO` é obrigatório. Tudo o mais é auto-resolvido (ver abaixo).

---

## O que o `gos-master` resolve sozinho (não precisa colar)

Na fase de comprehension, antes de gerar o plano, o orquestrador:

1. **PROJETO** — usa o `cwd` do projeto. Se ambíguo (monorepo na raiz), pergunta uma vez e salva em `~/.claude/.gos-state/last-project.json` para reuso silencioso nos próximos `*plan`.
2. **WORK_BRANCH** — regra fixa:
   - `OBJETIVO=implantacao|correcao|refactor` na app → `dev`
   - tela é Storybook (path bate com `dirs.storybook`) → `feat/storybook`
3. **STORYBOOK_DIR / STORYBOOK_BRANCH** — de `<PROJETO>/.gos-local/plan-paths.json` (`dirs.storybook`, `knowledge_sources.storybook_branch`).
4. **BUSINESS_RULES** — indexa `<PROJETO>/docs/regras-de-negocio/` e registra inventário em `progress.txt` na seção `## Knowledge mapped — PLAN-NNN`.
5. **POSTMAN** — indexa `<PROJETO>/docs/postman/` (contrato backend canônico) e registra inventário no mesmo bloco do progress.
6. **BACKEND / RLS / SEED / SMOKE_E2E** — derivado de `docs/stack.md` + regras-de-negocio + Postman mapeados.

> Workspaces sem `regras-de-negocio/` ou `postman/` não bloqueiam — só ficam fora do contexto. Storybook ausente segue bloqueando (regra do visual gate).

---

## Comportamentos novos do `OBJETIVO`

| Objetivo | Postura do `plan-blueprint` |
|----------|------------------------------|
| `implantacao` | Cria do zero — fluxo padrão (Fase 1 → 2 → 3) |
| `correcao` | Modo cirúrgico — diff vs Storybook canônico, 1 task por componente, sem reescrever |
| `refactor` | Implica `--allow-arch-change` + ADR obrigatória |

---

## Backend gaps → tasks ClickUp automáticas

Postman é o **contrato**: quando o `*plan` detecta uma necessidade de endpoint que não existe (ou existe incompleto / sem o shape exigido pela tela), abre task no ClickUp automaticamente:

- **Assignee**: Douglas Oliveira (`112010775`).
- **Título**: `[Backend] PLAN-NNN: <gap em uma linha>`
- **Descrição**: o que a tela precisa, qual endpoint/coleção do Postman cobre (ou não), referência ao plano.
- **List**: a backend list do projeto (resolvida via `.gos-local/plan-paths.json` → `clickup.backend_list_id`).
- **IDs criados**: registrados no plano em `## Backend pendings` e em `progress.txt`.

Override opcional no prompt: `ASSIGNEE = {{user-id}}` se quiser atribuir a outro dev.

---

## Executar o plano (turn separado)

> Pré-checagem: `ls <PROJETO>/docs/plans/PLAN-NNN-<tela>/plan.md`

```
/gos:agents:gos-master *execute-plan PLAN-NNN-{{TELA}}
```

> Ambiente: **Codex IDE Extension** (executor). Visual gate roda por task.

---

## Exemplos

**Implantação nova:**
```
/gos:agents:gos-master *plan pagina-projetos-inicial

OBJETIVO = implantacao
FIGMA    = https://www.figma.com/design/kXd8uP6dgeSuQypFnPmuQP/FRACTUS?node-id=9140-25387
FIGMA+   = [
  https://www.figma.com/design/kXd8uP6dgeSuQypFnPmuQP/FRACTUS?node-id=9140-25389,
  https://www.figma.com/design/kXd8uP6dgeSuQypFnPmuQP/FRACTUS?node-id=9140-25392
]
NOTAS = """
Drawer único entre criar/visualizar/editar — só o título e o footer mudam.
Row inteira clicável OU ícone Eye abre o drawer view.
"""
```

**Correção (plano filho):**
```
/gos:agents:gos-master *plan pagina-projetos-fix --parent PLAN-001-pagina-projetos-inicial

OBJETIVO = correcao
FIGMA    = https://www.figma.com/design/kXd8uP6dgeSuQypFnPmuQP/FRACTUS?node-id=9140-25387
NOTAS    = """
Diff cirúrgico vs Storybook canônico. 1 task por componente.
Invioláveis: drawer único com prop `mode`; stack inalterada.
"""
```

---

## Flags úteis

| Flag | Quando usar |
|------|-------------|
| `--from-figma-mcp` | Forçar leitura via Figma MCP (default quando `FIGMA=` URL Figma) |
| `--allow-arch-change` | Implícito em `OBJETIVO=refactor` |
| `--parent PLAN-NNN` | Plano filho |
| `--no-progress` | Não atualizar `progress.txt` (raro) |
| `--skip-storybook-sync` | Pular pre-flight Storybook (no `*plan`) |
| `--skip-visual-gate` | Pular comparação 1:1 com `.stories.tsx` (no `*execute-plan`, raro) |
| `--skip-clickup` | Não criar tasks de backend automáticas |

---

## Visual gate — DoD do `*execute-plan`

Por componente alterado/criado, compara contra `<Componente>.stories.tsx` em `dirs.storybook`:

- **Anatomia**: ordem de slots/elementos.
- **Tokens**: classes Tailwind/CSS batem com DS.
- **Variants**: props expostos cobrem variants da story.
- **Densidade**: padding/gap dentro de ±1 step da escala do DS.

E cruza JSX da tela com Figma MCP (mesmas seções, mesma ordem).

Output: `tasks/T-NNN-NN.notes.md`. Divergência crítica → falha o gate, task volta a `em-andamento`.

---

## Depois que o plano existe

```
*progress show                                # estado atual
*progress status T-NN-NN em-andamento         # iniciar task
*progress status T-NN-NN validacao            # commit preparado, sem push
*progress status T-NN-NN concluido            # apenas após QA humano + smoke E2E
```
