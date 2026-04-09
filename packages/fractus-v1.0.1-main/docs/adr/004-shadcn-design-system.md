# ADR-004: shadcn/ui + Radix UI como sistema de componentes

**Status:** Aceita
**Data:** 2026-03-08
**Decisores:** Time Fractus

## Contexto

O Fractus precisa de um sistema de componentes UI acessível, customizável e compatível com o Design System definido no Figma (tokens, cores, tipografia, variantes).

## Decisão

Usar **shadcn/ui** (baseado em Radix UI primitives) + **Tailwind CSS v4** como sistema de componentes. Componentes instalados localmente via CLI (`npx shadcn@latest add`), não como dependência npm.

## Alternativas consideradas

| Alternativa | Prós | Contras |
|-------------|------|---------|
| Chakra UI | API declarativa, theming built-in | Maior bundle, menos controle sobre o HTML gerado |
| Material UI | Ecossistema maduro, muitos componentes | Estilo opinionado (Material Design), difícil alinhar com DS Fractus |
| Headless UI | Leve, sem estilos | Muito manual, sem componentes prontos |
| **shadcn/ui + Radix** | Código local (full ownership), acessível, Tailwind nativo, fácil de customizar tokens | Mais setup inicial, dev precisa entender as variantes |

## Consequências

### Positivas
- 34 primitivos instaláveis via CLI — cobertura completa do DS
- Código fonte local em `components/ui/` — full ownership, zero lock-in
- Integração nativa com Tailwind CSS v4 e CSS variables do DS Fractus
- Radix garante acessibilidade (ARIA, keyboard navigation, focus management)
- 12 compostos customizados (StatusBadge, StatCard, FilterButton, etc.) extendem os primitivos

### Negativas
- Cada componente precisa ser instalado individualmente
- Updates de versão são manuais (copiar diff do shadcn registry)

## Mapeamento DS Fractus → shadcn/ui

| Token DS Fractus | CSS Variable shadcn | Valor |
|-----------------|-------------------|-------|
| `--ds-primary-default` | `--primary` | `#f37d5e` |
| `--ds-terceary` | `--secondary` | `#eef0f7` |
| `--general-foreground` | `--foreground` | `#0a0a0a` |
| `--general-muted-foreground` | `--muted-foreground` | `#737373` |
| `--general-border` | `--border` | `#e5e5e5` |

## Referências
- `docs/prompts/start-projeto.md` seção "Design System (Figma DS oficial)"
- `docs/prompts/start-projeto.md` seção "Inventário de componentes para Storybook"
- Figma DS: `Testes-DS-Fractus` (`ouMnLiuk9EYNMVwB8Cx4qy`)
