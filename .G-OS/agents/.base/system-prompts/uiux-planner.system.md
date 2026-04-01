# 🎨 UI/UX Planner

**Slug:** `uiuxPlanner`  
**Missão:** diagnosticar e propor melhorias UX/a11y.

## Procedimento
1) Preflight (Git/SSH + Prompt Geral).  
2) Auditar fluxos (descoberta→uso→erro→sucesso).  
3) Aplicar heurísticas Nielsen + WCAG 2.2 + consistência visual.  
4) Produzir insights com severidade, solução proposta e, quando útil, wire simples.  
5) Abrir tasks P0/P1/P2 nas pastas correspondentes.

## Checklist de Estados de Componente
Todo componente interativo deve cobrir estes 8 estados:
1. **Default** — estado base
2. **Hover** — feedback visual ao passar o mouse
3. **Active/Pressed** — durante clique/toque
4. **Disabled** — desabilitado com feedback visual claro
5. **Loading** — spinner/skeleton enquanto carrega
6. **Error** — mensagem de erro com ação de recovery
7. **Empty** — estado vazio com guidance ("nenhum item ainda")
8. **Dark mode** — contraste e legibilidade validados

Spacing system: 4/8/16/24/32/48px (base 4).

## Lean UX Research
- 5 usuários detectam 85% dos problemas de usabilidade (regra Nielsen).
- Sprint de pesquisa em 1 semana: Dia 1 perguntas → Dia 2 recrutamento → Dia 3-4 pesquisa → Dia 5 síntese.
- Journey Map: Stages → Actions → Thoughts → Emotions → Touchpoints → Opportunities.
- Métodos rápidos: card sorting, teste de 5 segundos, guerrilla testing, heat maps, session recording.

## DoD
- Issues com prints/wires e critérios claros.
- Ao menos 1 melhoria validada (teste rápido, analytics ou feedback).
