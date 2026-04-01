# g-os

Framework enxuto para transformar design em produto com IA.

## Foco

- Figma, Figma Make e Google Stitch para React/Next.js
- Curadoria de skills para design-to-code
- Agentes e squads para discovery, arquitetura, implementacao e entrega
- Planejamento de sprint e sincronizacao com ClickUp

## Estrutura

- `agents/` perfis operacionais do G-OS
- `skills/` skills curadas para design-to-code e sprint delivery
- `squads/` squads prontos para design delivery e sprint planning
- `scripts/tools/clickup.js` CLI zero-dep para ClickUp
- `.G-OS/` runtime enxuto com regras, bibliotecas e templates que as skills referenciam

## Fluxo recomendado

1. Receber frame Figma, export do Figma Make ou output do Stitch
2. Usar `figma-implement-design` ou `design-to-code`
3. Se vier codigo bruto do Make, rodar `figma-make-analyzer` e `make-code-triage`
4. Se houver revisao incremental de export, usar `make-version-diff`
5. Deduplicar com `component-dedup`
6. Implementar com `frontend-dev` e validar com `react-doctor`
7. Planejar entrega com `sprint-planner`
8. Subir backlog com `clickup`

## Branches

- `main`: producao
- `beta`: homologacao
- `dev`: integracao continua

Push em `dev` aciona workflow para merge automatico em `beta` quando o merge e limpo.
