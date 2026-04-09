# ADR-010: Storybook-first para componentes customizados

**Status:** Aceita
**Data:** 2026-03-15
**Decisores:** Time Fractus

## Contexto

O Fractus possui 12 compostos customizados (StatusBadge, StatCard, FilterButton, etc.) e 20+ componentes de domínio que extendem primitivos shadcn/ui. Sem documentação visual, o dev FE não tem referência clara de variantes, props e estados.

## Decisão

Adotar **Storybook-first**: todo composto customizado deve ter stories criadas **antes** de ser usado em pages. Primitivos shadcn/ui não precisam de stories (já documentados no registry).

## Workflow

```
1. Criar componente em components/ui/ (ex: StatusBadge.tsx)
2. Criar story em components/ui/StatusBadge.stories.tsx
3. Validar todas as variantes no Storybook
4. Só então usar o componente em pages
```

## Escopo

| Camada | Storybook obrigatório? | Quantidade |
|--------|----------------------|-----------|
| Primitivos shadcn/ui | Não (já documentados) | 34 |
| Compostos customizados | Sim | 12 (~45 stories) |
| Componentes de domínio | Recomendado | 20+ |

## Consequências

### Positivas
- Dev FE tem catálogo visual de todas as variantes antes de montar pages
- Review de UI é feita no Storybook, não no deploy
- Onboarding de novos devs é mais rápido (catálogo self-service)
- Chromatic ou Storybook Test Runner para visual regression (futuro)

### Negativas
- Setup inicial do Storybook adiciona complexidade ao projeto
- Cada componente exige manutenção de stories (overhead)

## Referências
- `docs/prompts/start-projeto.md` seção "Inventário de componentes para Storybook"
