# Caveman Compression Rules

> Regras detalhadas de compressao usadas por `gos-caveman`. Atribuicao: https://github.com/JuliusBrussee/caveman (MIT).

## Niveis

### Lite (~30% reducao)
- Mantem coesao narrativa
- Remove articulos opcionais
- Junta sentencas curtas

### Full (~75% reducao) — DEFAULT G-OS
- Estilo telegrafico
- Frases nominais quando possivel
- 1 ideia por linha

### Ultra (~90% reducao)
- Quase pseudo-codigo
- Setas `->` substituem "leva a", "resulta em"
- Preposicoes minimas

## Tabela de transformacoes

| Pattern verboso | Caveman lite | Caveman full | Caveman ultra |
|-----------------|--------------|--------------|---------------|
| "voce deve fazer X" | "faca X" | "X" | "X" |
| "e responsavel por" | ":" | ":" | ":" |
| "que e usado para" | "para" | "p/" | "p/" |
| "no caso de" | "se" | "se" | "se" |
| "a fim de que" | "para" | "p/" | "p/" |
| "por causa de" | "por" | "por" | "<-" |
| "leva a / resulta em" | "leva a" | "->" | "->" |
| "e necessario que" | "deve" | "must" | "!" |
| "nao e necessario" | "nao precisa" | "skip" | "x" |

## Pre-fixos preservados (nunca mexer)

- Codigo: ` ``` `, `<code>`
- Inline code: `` ` ``
- Listas: `-`, `*`, `1.`
- Headers: `#`, `##`, `###`
- Frontmatter: `---` blocks
- Tabelas: `|`
- Links: `[text](url)`

## Anti-padroes

- Comprimir codigo. NUNCA.
- Comprimir mensagem para nao-tecnico. NUNCA.
- Mudar valores numericos. NUNCA.
- Trocar nomes proprios. NUNCA.

## Self-check

Apos comprimir, perguntar mentalmente:
1. Um leitor tecnico recupera 100% da semantica? Se nao -> reduzir nivel.
2. Algum nome/numero/path foi alterado? Se sim -> bug, refazer.
3. A reducao e >=20% (lite) / >=60% (full) / >=80% (ultra)? Se nao -> nao houve compressao real.
