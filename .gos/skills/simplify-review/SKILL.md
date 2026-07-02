---
name: simplify-review
description: >
  Review de over-engineering: acha o que DELETAR. Reinvencao de stdlib, dependencia
  desnecessaria, abstracao especulativa, flexibilidade morta, boilerplate. Uma linha
  por finding: local, o que cortar, o que substitui. Use quando pedir "*simplify-review",
  "revisar over-engineering", "o que da pra deletar", "isso ta over-engineered".
argument-hint: "[<path|--staged>]"
allowedTools: [Read, Glob, Grep, Bash]
sourceDocs:
  - libraries/lazy-dev-policy.md
use-when:
  - review de diff/codigo focado em simplificacao e deleção
  - antes de merge, para cortar complexidade desnecessaria
do-not-use-for:
  - bugs de correcao (use review normal / qa)
  - seguranca (use security-review) ou performance (use perf-review)
metadata:
  category: quality-gate
---

# Skill: Simplify Review

Review de diffs focado **exclusivamente** em complexidade desnecessaria. Acha o que deletar. O melhor resultado do diff e ficar menor. Base: `libraries/lazy-dev-policy.md`.

## Escopo

- `--staged` (default): `git diff --staged`.
- `<path>`: arquivo/diretorio.

## Formato (uma linha por finding)

`L<linha>: <tag> <o que>. <substituto>.` (ou `<file>:L<linha>:` para multi-arquivo).

Tags:
- `delete:` codigo morto, flexibilidade nao usada, feature especulativa. Substituto: nada.
- `stdlib:` coisa feita a mao que a stdlib entrega. Nomear a funcao.
- `native:` dependencia/codigo fazendo o que a plataforma ja faz. Nomear a feature.
- `yagni:` abstracao com uma implementacao, config que ninguem seta, camada com um caller.
- `shrink:` mesma logica, menos linhas. Mostrar a forma curta.

## Exemplos

- `L12-38: stdlib: classe validadora de 27 linhas. "@" no email, 1 linha; validacao real e o email de confirmacao.`
- `L4: native: moment.js pra um format. Intl.DateTimeFormat, 0 deps.`
- `repo.ts:L88: yagni: AbstractRepository com uma implementacao. Inline ate existir a segunda.`
- `L52-71: delete: retry em volta de chamada local idempotente. Nada substitui.`

## Scoring

Terminar com a unica metrica que importa: `net: -<N> linhas possiveis.`
Se nao ha o que cortar: `Enxuto. Pode seguir.` e parar.

## Limites

- Escopo: over-engineering e complexidade. Bugs, seguranca e performance sao OUTRAS reviews — rotear.
- Um smoke test / `assert` minimo NAO e bloat — nunca marcar pra deletar.
- Nunca cortar validacao/seguranca/a11y.
- Nao aplica os fixes, so lista.
