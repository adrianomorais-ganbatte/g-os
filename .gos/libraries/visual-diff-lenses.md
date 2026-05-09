# Visual Diff Lenses

> Referencia das 6 lenses usadas por `figma-print-diff` e `audit-screenshots`. Inspirado em Nielsen Heuristics + design-critique (uxdudu) + WCAG.

## Lens 1 — Layout & hierarquia

Pergunta-mestra: "A estrutura espacial bate?"

Sub-checks:
- Containers principais (sidebar, header, footer, main) presentes em ambos?
- Ordem de filhos dentro de cada container coincide?
- Proporcoes (sidebar 240px, main 1fr) coerentes?
- Densidade visual (cards/lista) similar?

Severity guide:
- high: container ausente/extra
- medium: ordem trocada
- low: proporcao 10-20% diferente

## Lens 2 — Tokens visuais

Pergunta-mestra: "Cor, tipo, espacamento batem com o DS?"

Sub-checks:
- Cor de background dos blocos
- Cor de texto (primary, secondary, muted)
- Borders e radius
- Tipografia (family, size, weight, line-height)
- Spacing (padding/margin/gap)
- Shadows e elevations

Severity guide:
- high: cor de acao primaria errada
- medium: spacing 2x diferente
- low: radius cosmetico

## Lens 3 — Estados

Pergunta-mestra: "Todos os estados estao implementados?"

Sub-checks:
- Loading (skeleton, spinner)
- Empty (placeholder, CTA)
- Error (mensagem, recovery)
- Success (toast, inline)
- Hover/Focus/Active
- Disabled

Severity guide:
- high: empty/error nao implementado
- medium: hover sem feedback
- low: focus ring cosmetico

## Lens 4 — Conteudo

Pergunta-mestra: "Textos e visuais coincidem?"

Sub-checks:
- Textos literais (sem inventar traducao)
- Icones (mesma lib, mesma variante)
- Imagens (placeholder vs real)
- Dados mockados (formato, plausibilidade)

Severity guide:
- high: copy errada que altera significado
- medium: icone trocado
- low: lorem ipsum esquecido

## Lens 5 — Interacao (inferida do estatico)

Pergunta-mestra: "Affordances batem?"

Sub-checks:
- Cursor pointer onde Figma mostra elemento "clicavel"
- Botoes com aparencia de botao (nao texto plano)
- Inputs com aparencia de input (border, placeholder)
- Tooltips/popovers posicionados corretamente quando visiveis

Severity guide:
- high: botao primario sem aparencia de botao
- medium: link disfarcado de texto
- low: cursor em element nao-clicavel

## Lens 6 — Acessibilidade visual

Pergunta-mestra: "Acessivel ao olhar?"

Sub-checks:
- Contraste AA (4.5:1 texto, 3:1 UI components)
- Toque minimo 44x44px em mobile
- Focus indicator distinto de hover
- Texto sem so cor (icone + cor para indicar erro)

Severity guide:
- high: contraste reprovado em texto principal
- medium: toque <44px em mobile
- low: focus mesmo cor que hover

## Composicao das lenses

Ordem fixa: 1 -> 2 -> 3 -> 4 -> 5 -> 6.

Por que essa ordem?
- Layout antes de token (sem layout, token nao importa).
- Token antes de estado (estado depende de tokens corretos).
- Estado antes de conteudo (conteudo so faz sentido com estado completo).
- Interacao depois de conteudo (precisa ver afford).
- A11y por ultimo (gate final).

## Anti-patterns

- Pular lens 3: time esquece estados, codegen sai sem loading/empty/error.
- Inverter 1 e 2: comeca medindo cor e nao percebe que falta sidebar inteira.
- Severity hyperinflation: tudo high -> nada e high.
