# G-OS Context

G-OS e uma distribuicao enxuta do framework operacional G-OS para:

- converter design em codigo
- organizar squads de entrega
- planejar sprint
- sincronizar backlog no ClickUp

Priorize React e Next.js. Quando houver input vindo de Figma Make ou Stitch, trate o codigo como material de triagem antes de integrar ao projeto final.

## Orquestração

O G-OS herda o modelo de orquestração do .a8z-OS (framework pai):

| Tier | Componente | Função |
|------|-----------|--------|
| 1 | `gos-master` | Orquestrador master — routing matrix, skills, squads, workflows |
| 2 | `workflow-select` | Scoring de workflows (Ralph, SDD, Rapid Bug Fix, Escalation) |
| 2 | `composer` | Sequências de skills com decision gates |
| 2 | `model-router` | Roteamento para modelo mais barato adequado |
| 3 | `agent-teams` / `dispatching-parallel-agents` | Paralelização multi-agente |

Para tarefas complexas multi-domínio, invocar `gos-master` (agents/profiles/gos-master.md).

## Qualidade de Texto

Todo texto gerado deve passar por correção ortográfica e remoção de padrões de IA:
- **Ortografia pt-BR**: Stop hook automático corrige acentos
- **Humanização**: Skill `/humanizer` remove padrões de escrita artificial (26 patterns)
- **Referência**: `libraries/content/ai-writing-patterns.md` (taxonomia de padrões)
