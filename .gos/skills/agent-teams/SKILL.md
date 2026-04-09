---
name: agent-teams
description: >
  Use quando o usuario quiser coordenar multiplos agentes Claude Code em time,
  mencionar "agent teams", "teammates", "multiple agents", "time de agentes",
  ou precisar de exploracao paralela de um problema complexo.
use-when:
  - feature complexa full-stack que pode ser dividida em modulos independentes (FE, BE, testes)
  - research exploratoria onde multiplas hipoteses precisam ser investigadas em paralelo
  - refactor de grande escala com modulos desacoplados
  - debug multi-camada com problemas independentes em frontend, backend e infra
do-not-use-for:
  - tarefas que editam os mesmos arquivos (use subagents sequenciais para evitar conflitos)
  - problemas onde o contexto de uma investigacao depende do resultado de outra (use dispatching-parallel-agents com contexto compartilhado)
  - tarefas simples ou de escopo unico (o overhead de agent teams nao compensa)
metadata:
  category: workflow-automation
---

# Skill: Orquestracao de Agent Teams

## Pre-requisitos

- Claude Code com Opus 4.6
- Habilitar: `settings.json` > `env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=true`
- Recomendado: tmux ou Zellij para split-pane

## Quando usar Agent Teams (vs Subagents)

| Cenario | Usar | Justificativa |
|---------|------|---------------|
| Research + review paralelo | Teams | Multiplas perspectivas |
| Features independentes | Teams | Cada teammate num modulo |
| Debug com hipoteses competitivas | Teams | Convergencia mais rapida |
| Tarefa especifica, so resultado importa | Subagent | Menos overhead |
| Edicoes no mesmo arquivo | Subagent | Evita conflitos |

## Prompt template para criar time

```
Crie um time de agentes para [tarefa]:
- Teammate 1: [papel] — foco em [aspecto]
- Teammate 2: [papel] — foco em [aspecto]
- Teammate 3: [papel] — foco em [aspecto]

Cada teammate deve explorar independentemente e reportar ao team lead.
Depois da exploracao, sintetize um plano unificado.
```

## Gestao de contexto

- Cada teammate = janela de contexto independente (~200K tokens)
- Team lead coordena via task list compartilhada
- Se team lead atingir <5% contexto, solicite criacao de novos teammates
- Custo: ~3-5x mais tokens que sessao unica

## Boas praticas

1. **Definir papeis claros** — cada teammate com escopo especifico
2. **Evitar overlap** — teammates nao devem editar os mesmos arquivos
3. **Monitorar custo** — agent teams consomem tokens significativamente
4. **Limitar tamanho** — 2-4 teammates e o ideal; mais que isso dilui coordenacao
5. **Usar tmux** — cada pane para um teammate facilita acompanhamento

## Cenarios ideais

- **Feature complexa full-stack**: Teammate FE, Teammate BE, Teammate Tests
- **Research exploratoria**: Cada teammate investiga uma hipotese
- **Refactor grande**: Cada teammate cuida de um modulo
- **Debug multi-camada**: Frontend, backend, infra em paralelo

## Do not use
- Fora do escopo descrito; prefira a skill apropriada.

## Instructions
1) Siga o passo-a-passo principal da skill.
2) Valide saa com checklists desta skill ou do workflow.
3) Registre decises relevantes se aplic5vel.
