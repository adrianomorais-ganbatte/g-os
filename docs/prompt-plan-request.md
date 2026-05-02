# Prompts G-OS — criação e execução de plano por tela

> Invocação canônica: `/gos:agents:gos-master`. Plano canônico vive em
> `<PROJETO>/docs/plans/PLAN-NNN-<tela>/plan.md`.
> **Sempre dois turns**: primeiro `*plan` (gera o diretório), depois `*execute-plan`.

---

## 1) Criar o plano (`*plan`)

```
/gos:agents:gos-master *plan {{TELA}}

TELA              = {{nome-da-tela}}
PROJETO           = {{caminho-do-projeto}}
STORYBOOK_DIR     = {{caminho-do-checkout-storybook}}
STORYBOOK_BRANCH  = {{branch-canonica-storybook}}
WORK_BRANCH       = {{branch-base-execucao}}

FIGMA_FRAME       = {{url-figma-frame-principal}}
FIGMA_COMPS       = [
  {{url-figma-componente-1}},
  {{url-figma-componente-2}}
]
FIGMA_FULL        = {{url-figma-tela-completa-opcional}}
FLAGS             = --from-figma-mcp                # remova se não usar Figma MCP
                                                    # +--allow-arch-change se mexer em stack
                                                    # +--parent PLAN-NNN se for plano filho

BACKEND           = {{ex.: supabase cloud (project: <ref>), RLS ON}}
ROLES_TEST        = {{ex.: gestor=gestor@x.com / Senh@_123}}
SEED              = {{ex.: supabase/seed-staging.sql}}
SMOKE_E2E         = {{cenário literal — DoD do plano}}
RLS_DOC           = {{paths das migrations de RLS}}
BUSINESS_RULES    = {{<PROJETO>\docs\regras-de-negocio}}
POSTMAN           = {{<PROJETO>\docs\postman}}

NOTAS = """
{{comportamento da tela em prosa livre — drawer compartilhado, regras visuais, edge cases}}
"""
```

---

## 2) Executar o plano (`*execute-plan`) — turn separado

> Pré-checagem antes de colar: `ls <PROJETO>/docs/plans/PLAN-NNN-<TELA>/plan.md`

```
/gos:agents:gos-master *execute-plan PLAN-NNN-{{TELA}}
```

---

## Versão curta (1 linha — pipeline já quente)

```
/gos:agents:gos-master *plan {{TELA}} --from-figma-mcp \
  --storybook-dir {{STORYBOOK_DIR}} --storybook-branch {{STORYBOOK_BRANCH}} \
  --work-branch   {{WORK_BRANCH}}   --project          {{PROJETO}} \
  --frame {{url}} --comp {{url}} --comp {{url}} --full {{url}}
```

---

## Exemplo preenchido — Fractus / pagina-projetos-inicial

```
/gos:agents:gos-master *plan pagina-projetos-inicial

TELA              = pagina-projetos-inicial
PROJETO           = E:\Github\Ganbatte\packages\fractus
STORYBOOK_DIR     = E:\Github\Ganbatte\tmp\fractus-storybook-cleanup
STORYBOOK_BRANCH  = feat/storybook
WORK_BRANCH       = feat/storybook

FIGMA_FRAME       = https://www.figma.com/design/kXd8uP6dgeSuQypFnPmuQP/FRACTUS?node-id=9140-25387
FIGMA_COMPS       = [
  https://www.figma.com/design/kXd8uP6dgeSuQypFnPmuQP/FRACTUS?node-id=9140-25389,   # row da tabela
  https://www.figma.com/design/kXd8uP6dgeSuQypFnPmuQP/FRACTUS?node-id=9140-25392,   # drawer (skeleton compartilhado)
  https://www.figma.com/design/kXd8uP6dgeSuQypFnPmuQP/FRACTUS?node-id=9140-25393    # specs do drawer
]
FIGMA_FULL        = https://www.figma.com/design/kXd8uP6dgeSuQypFnPmuQP/FRACTUS?node-id=9140-25386
FLAGS             = --from-figma-mcp

BACKEND           = supabase cloud (project: szaxyfuhhgkzxazeexgm), RLS ON
ROLES_TEST        = gestor=gestor@fractus.com.br / Senh@_123
SEED              = supabase/seed-staging.sql + seed-auth-users.sql
SMOKE_E2E         = login gestor → /dashboard/projetos mostra ≥1 row → clicar row OU eye abre drawer view → "Editar" troca para form → "Salvar" persiste + toast + revalida
RLS_DOC           = supabase/migrations/*rls*.sql + 20260429175700_rbac_modular.sql
BUSINESS_RULES    = E:\Github\Ganbatte\packages\fractus\docs\regras-de-negocio
POSTMAN           = E:\Github\Ganbatte\packages\fractus\docs\postman

NOTAS = """
- Drawer único compartilhado entre criar/visualizar/editar.
  Só o título muda: "Novo projeto" | "<nome>" (view) | "Editar: <nome>".
  Mesmo skeleton (header fixo + corpo rolável + footer dinâmico).
- Clicar na row OU no ícone Eye abre o drawer.
- View: <dt>/<dd>, badges para área/tipo/estado, lista de financiadores.
- Edit: mesmos inputs do create (RHF + Zod + projetoSchema reutilizado).
"""
```

Execução depois (turn separado):

```
/gos:agents:gos-master *execute-plan PLAN-001-pagina-projetos-inicial
```

---

## Exemplo preenchido — plano filho de correção (Fractus / projetos-fix)

```
/gos:agents:gos-master *plan pagina-projetos-fix --parent PLAN-001-pagina-projetos-inicial

TELA              = pagina-projetos-fix
PROJETO           = E:\Github\Ganbatte\packages\fractus
STORYBOOK_DIR     = E:\Github\Ganbatte\tmp\fractus-storybook-cleanup
STORYBOOK_BRANCH  = feat/storybook
WORK_BRANCH       = feat/storybook

FIGMA_FRAME       = https://www.figma.com/design/kXd8uP6dgeSuQypFnPmuQP/FRACTUS?node-id=9140-25387
FIGMA_COMPS       = [
  https://www.figma.com/design/kXd8uP6dgeSuQypFnPmuQP/FRACTUS?node-id=9140-25389,
  https://www.figma.com/design/kXd8uP6dgeSuQypFnPmuQP/FRACTUS?node-id=9140-25392,
  https://www.figma.com/design/kXd8uP6dgeSuQypFnPmuQP/FRACTUS?node-id=9140-25393
]
FIGMA_FULL        = https://www.figma.com/design/kXd8uP6dgeSuQypFnPmuQP/FRACTUS?node-id=9140-25386
FLAGS             = --from-figma-mcp --parent PLAN-001-pagina-projetos-inicial

BACKEND           = supabase cloud (project: szaxyfuhhgkzxazeexgm), RLS ON via has_permission
ROLES_TEST        = gestor=gestor@fractus.com.br / Senh@_123
SEED              = supabase/seed-staging.sql + seed-auth-users.sql + 20260501130000_seed_extended
SMOKE_E2E         = login gestor → /dashboard/projetos lista ≥6 rows → row/eye abre drawer view → "Editar" → "Salvar" persiste + revalida → Esc fecha
RLS_DOC           = supabase/migrations/20260501120000_rbac_modular_rls.sql + 20260429175700_rbac_modular.sql
BUSINESS_RULES    = E:\Github\Ganbatte\packages\fractus\docs\regras-de-negocio
POSTMAN           = E:\Github\Ganbatte\packages\fractus\docs\postman

NOTAS = """
INTENT: corrigir drift entre /dashboard/projetos (impl. PLAN-001) e Storybook canônico.
NÃO reescrever — diagnosticar e patch cirúrgico, 1 task por componente.

Confrontar 1:1 com Storybook: ProjectsTable, ProjectsToolbar, TablePagination,
ProjectDetailDrawer, CustomDrawer, ProjectForm, CreateProjectDialog.

Invioláveis: drawer único com prop `mode`; row inteira clicável OU eye;
view = dt/dd + badges; edit reutiliza projetoSchema; stack inalterada.
"""
```

---

## Flags úteis

| Flag | Quando usar |
|------|-------------|
| `--from-figma-mcp` | Forçar leitura via Figma MCP |
| `--allow-arch-change` | Tela exige stack nova → gera ADR |
| `--parent PLAN-NNN` | Plano filho |
| `--no-progress` | Não atualizar `progress.txt` (raro) |
| `--skip-storybook-sync` | Pular pre-flight do Storybook (no `*plan`) |
| `--skip-visual-gate` | Pular comparação 1:1 com `.stories.tsx` (no `*execute-plan`, raro) |

## Visual gate — DoD obrigatório no `*execute-plan`

Por componente alterado/criado, `execute-plan` compara contra `<Componente>.stories.tsx` em `dirs.storybook`:

- **Anatomia**: ordem de slots/elementos (header → corpo → footer; ícones esquerda/direita).
- **Tokens**: classes Tailwind/CSS batem com DS (cor, raio, espaçamento, tipografia).
- **Variants**: props expostos cobrem variants da story.
- **Densidade**: padding/gap dentro de ±1 step da escala do DS.

E cruza JSX da tela com Figma MCP no nível de árvore (mesmas seções, mesma ordem).

Output: `tasks/T-NNN-NN.notes.md`. Divergência ≥ 1 item crítico → falha o gate, task volta a `em-andamento`. Não passa pra `validacao` sem aprovação do gate.

## Depois que o plano existe

```
*progress show                                # estado atual
*progress status T-NN-NN em-andamento         # iniciar task
*progress status T-NN-NN validacao            # commit preparado, sem push
*progress status T-NN-NN concluido            # após QA humano + smoke E2E
```
