---
paths: "**"
---

# Plan Mode — Planejamento Obrigatório Antes de Agir

## Quando Ativar

Ativar **PLAN MODE** automaticamente sempre que o input do usuário envolver **qualquer** dos triggers abaixo:

### Triggers de Conteúdo
- Verbos de intenção: `analisar`, `planejar`, `criar tasks`, `arquitetar`, `refatorar`, `redesign`, `implementar`, `criar`, `construir`, `organizar`, `estruturar`, `migrar`, `integrar`
- Escopo: tarefa com **>3 passos** em múltiplos domínios
- Criação: novo feature, nova skill, novo agente, novo componente, novo módulo
- Sprint: histórias, backlog, roadmap, planning
- Arquitetura: revisão cross-cutting, redesign de sistema, decisão técnica
- Análise de código/codebase com intenção de mudança

### Exceções — NÃO ativar plan mode
- Git operations: `commit`, `push`, `pull`, `branch`, `merge`, `status`, `log`
- Leitura e explicação: "o que é", "como funciona", "onde está", "mostre", "explique"
- Edições simples: 1 arquivo, 1 mudança isolada (ex: corrigir typo, ajustar 1 linha)
- Correções de lint, typo, formatação, ortografia
- Quando o usuário inclui: `"só faça"`, `"execute direto"`, `"sem plano"`, `"direto ao ponto"`
- Comandos de retomada ou continuação: `"continue"`, `"continuar"`, `"retomar"`, `"resume"`, `"prosseguir"`, `"segue"`
- Aprovações após um plano já apresentado: `"ok"`, `"aprovado"`, `"go"`, `"execute"`, `"pode ir"`, `"sim"`, `"proceed"`
- Quando plan mode já foi ativado ou aprovado na sessão atual

---

## Protocolo de 4 Fases

### Fase 1 — RESEARCH
- Investigar o problema sem alterar nenhum arquivo
- Ler arquivos relevantes, entender arquitetura, identificar dependências

### Fase 2 — PLAN
- Criar o artefato `implementation_plan.md` com:
  - Objetivo e contexto
  - Mudanças propostas agrupadas por componente
  - Arquivos a criar `[NEW]`, modificar `[MODIFY]`, deletar `[DELETE]`
  - Plano de verificação
- **Apresentar o plano ao usuário e aguardar aprovação na resposta principal, sem bloquear via hook**

### Fase 3 — AWAIT APPROVAL
- Aguardar aprovação explícita do usuário (`"ok"`, `"aprovado"`, `"go"`, etc.)

### Fase 4 — EXECUTE + TRACK
- Criar `task.md` com checklist de tarefas
- Executar as tarefas marcando progresso
- Criar `walkthrough.md` ao finalizar

---

## Artefatos

| Fase | Artefato | Propósito |
|------|----------|-----------|
| PLAN | `implementation_plan.md` | Plano técnico para revisão do usuário |
| EXECUTE | `task.md` | Checklist de progresso |
| DONE | `walkthrough.md` | Resumo do que foi implementado |

Referência central: `rules/plan-mode.md` (G-OS context)
