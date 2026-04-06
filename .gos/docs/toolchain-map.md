# Toolchain Map

## Entradas suportadas

- URL ou frame do Figma
- export do Figma Make
- codigo gerado pelo Google Stitch
- screenshot de UI

## Decisao rapida

- Figma com acesso estruturado: `figma-implement-design`
- Screenshot ou referencia visual: `design-to-code`
- Figma Make bruto: `figma-make-analyzer` -> `make-code-triage` -> `component-dedup`
- diff entre export antigo e novo do Make: `make-version-diff`
- Stitch ou codigo gerado por IA: `make-code-triage` -> `frontend-dev` -> `react-doctor`
- Descoberta e backlog: `sprint-planner`
- Subida para ClickUp: `clickup`
