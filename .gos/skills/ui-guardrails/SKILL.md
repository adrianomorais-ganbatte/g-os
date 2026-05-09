---
name: ui-guardrails
description: >
  Pre-flight obrigatorio antes de codar uma tela. Verifica que cada task de tela tem
  estados (loading/empty/error/success), responsividade, a11y e tokens declarados.
  Bloqueia codegen se faltar — evita que erros de UI sejam descobertos tarde.
  Pensado para reduzir o "trabalho extra de corrigir o que nao foi previsto".
argument-hint: "<plan-id-ou-task-path>"
allowedTools: [Read, Glob, Grep, Edit, AskUserQuestion]
sourceDocs:
  - libraries/ui-guardrails-checklist.md
use-when:
  - antes de design-to-code/figma-implement-design rodar
  - validar plano de UI antes de execute-plan
  - usuario reclama "esqueceram do estado vazio de novo"
do-not-use-for:
  - tasks de backend (sem UI)
  - bug fixes pontuais (use react-doctor)
metadata:
  category: validation
---

Voce esta executando como **UI Guardrails Validator** via skill `ui-guardrails`. Verifica que cada task de UI tem cobertura completa antes de codegen — bloqueia execucao se faltar.

## Contrato

1. Le um plano (`docs/plans/PLAN-NNN/`) ou task individual (`tasks/T-NN-...md`).
2. Para cada task com `area: ui-ux` ou `area: frontend`, aplica checklist (ver `libraries/ui-guardrails-checklist.md`).
3. Se faltar item -> output structured com gaps + sugestao de adicao + opcao de `AskUserQuestion` para corrigir inline OU abortar.
4. Se passar -> output curto "OK, N tasks validadas, codegen liberado".

## Checklist (resumo — detalhe na library)

Para CADA task de UI:

### A. Estados visuais (5 obrigatorios)
- [ ] Loading: **skeleton OBRIGATORIO** (shadcn `Skeleton`) para listas/cards/tabelas; spinner Lucide `Loader2` so para botoes ou acoes pontuais.
- [ ] Empty: copy + Lucide icon (h-12 w-12 text-muted-foreground) + CTA primario.
- [ ] Error: mensagem + Lucide `AlertTriangle` + recovery action (botao retry).
- [ ] Success (quando aplicavel): Lucide `CheckCircle2` em toast/inline.
- [ ] Default (renderizado normal).

**Regra critica**: **SEMPRE skeleton ao carregar dados**, **SEMPRE empty state quando lista vazia**. Sem excecoes mesmo em descartavel.

### B. Responsividade (3 breakpoints minimos)
- [ ] Mobile (<768px): layout declarado
- [ ] Tablet (768-1024px): comportamento declarado
- [ ] Desktop (>1024px): default

### C. A11y (4 minimos)
- [ ] Roles ARIA quando aplicavel (button, dialog, listbox)
- [ ] Labels em inputs (htmlFor + id ou aria-label)
- [ ] Focus order definido se mais de 3 elementos interativos
- [ ] Contraste AA verificado (lens 6 do figma-print-diff)

### D. Tokens do DS (todos via referencia)
- [ ] Cores via tokens (`bg-primary`, NUNCA hex direto)
- [ ] Spacing via scale (`gap-4`, NUNCA `gap-[17px]`)
- [ ] Typography via classes (`text-base`, NUNCA `text-[15px]`)
- [ ] Border-radius via scale (`rounded-md`, NUNCA `rounded-[7px]`)

### F. Lucide React (zero-emoji policy)
- [ ] Import de icones SO de `lucide-react` (nunca FontAwesome/Heroicons/outra lib).
- [ ] **Zero emoji unicode em strings de UI** (regex `/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u`).
- [ ] Icon-only button com `aria-label` obrigatorio.
- [ ] Tamanhos canonicos: `h-3.5 w-3.5` inline, `h-4 w-4` button, `h-5 w-5` heading, `h-12 w-12` empty state, `h-16 w-16` hero.

Detalhe: `libraries/lucide-icons-policy.md`.

### E. Interacao (quando aplicavel)
- [ ] Trigger -> acao -> resultado declarado em `## Interacoes & Estados`
- [ ] Edge case: o que acontece se trigger duplicar (debounce)?
- [ ] Edge case: o que acontece se backend demorar >3s?

## Niveis de violacao

| Tipo | Severidade | Acao |
|------|-----------|------|
| A faltando (estado) | high | Bloqueia codegen. Pede correcao via AskUserQuestion. |
| B faltando (responsivo) | high | Bloqueia se task e tela full. Warning se componente isolado. |
| C faltando (a11y) | medium | Warning. Codegen continua mas adiciona TODO no codigo. |
| D faltando (tokens) | medium | Warning. Codegen pode prosseguir mas relatorio ao final. |
| E faltando (interacao) | high (se ha trigger) | Bloqueia. plan-blueprint ja exige isso — caso aqui e detectar regressao. |
| F faltando (Lucide/emoji) | high | Bloqueia. Recusar codigo com emoji em UI ou icone nao-Lucide. |

## Output

```
[ui-guardrails] PLAN-NNN — N tasks de UI validadas

[OK]   T-01: cards-projeto-list           A B C D E
[FAIL] T-02: drawer-edit-projeto          A . C D E   (faltando: empty state, hover focus)
[WARN] T-03: tooltip-status               A B . D E   (a11y: sem aria-label)

bloqueado: 1 task (T-02). Corrija antes de design-to-code.
warnings: 1 (T-03 — a11y).
```

## Hook em pipeline

`prototype-orchestrator` (fase 5 -> 6) e `plan-blueprint` (apos plan-to-tasks) DEVEM chamar `ui-guardrails` automaticamente em produtos NAO-descartaveis. Para descartaveis, oferecer skip via flag `--no-guardrails`.

## Regras criticas

- **Descartavel relax**: se plan tem `descartavel: true` no frontmatter, A/B viram warning (nao block).
- **Codegen sem guardrails**: violacao da regra do dono ("muito trabalho corrigindo erros nao previstos"). Bloqueia.
- **Self-update**: se task tem `interaction_target` mas falta `## Interacoes & Estados` no plano, sugerir patch automatico.

## Input

$ARGUMENTS
