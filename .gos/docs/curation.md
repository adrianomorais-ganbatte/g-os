# Curadoria do G-OS

## Escopo

O `G-OS` foi montado como uma distribuicao enxuta para cobrir apenas:

- design to code
- Figma MCP
- Figma Make import/update
- React e Next.js
- sprint planning
- ClickUp import e acompanhamento
- branch ops para entrega

## Skills incluidas

- `clickup`
- `component-dedup`
- `design-to-code`
- `figma-implement-design`
- `figma-make-analyzer`
- `frontend-dev`
- `make-code-triage`
- `make-version-diff`
- `react-best-practices`
- `react-doctor`
- `sprint-planner`

## Agentes incluidos

- `architect`
- `dev`
- `devops`
- `po`
- `qa`
- `sm`
- `squad-creator`
- `ux-design-expert`

## Squads incluidas

- `design-squad`
- `sprint-planning`

## Camada `.G-OS`

Foram mantidos apenas os suportes exigidos pelas skills copiadas:

- rules de arquitetura e especificacao
- libraries frontend e SSH multi-account
- system prompts base usados pelo `frontend-dev`
- playbook e template de ADR do sprint planner

## Fora do escopo

- proposals
- marketing squads
- memoria completa do framework
- CLI legada do framework anterior
- runtime multi-IDE integral

## Decisoes de Curadoria

### Lessons Loop / `tasks/lessons.md`

O `G-OS` NAO ativa o loop de `tasks/lessons.md` e NAO replica o `Livro de Ouro` do framework principal.

Motivos:

- esta distribuicao nao inclui o subsistema completo de memoria do `.a8z-framework`
- o custo de manter memoria graduada localmente aqui seria desproporcional ao escopo enxuto do `G-OS`
- o ciclo canonico desta distribuicao permanece: `implementation_plan.md` -> `task.md` -> `walkthrough.md`

Decisao operacional:

- nao criar `tasks/lessons.md` neste repo
- nao adicionar hooks de captura automatica de lessons
- registrar aprendizados duraveis por curadoria manual em `docs/curation.md` ou promover direto para `rules/` quando houver padrao estavel
