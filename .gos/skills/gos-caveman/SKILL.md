---
name: gos-caveman
description: >
  Comprime OUTPUT de planos, tasks e respostas de skills cortando ~75% dos tokens
  preservando precisao tecnica. 3 niveis (lite/full/ultra). Aplicar APENAS em prosa
  e descricao de tasks — NUNCA em codigo, comandos shell, paths, ou trechos de regex.
  Adaptado de github.com/JuliusBrussee/caveman (MIT).
argument-hint: "<level: lite|full|ultra> <texto ou path>"
allowedTools: [Read, Write, Edit]
sourceDocs:
  - libraries/caveman-rules.md
use-when:
  - finalizar plan-blueprint output (descricao + criterios)
  - resumir resposta de skill com prosa longa
  - usuario pede "fala caveman" ou "menos token"
do-not-use-for:
  - codigo (variaveis, funcoes, types — preserva tudo)
  - comandos shell (preserva tudo)
  - paths de arquivos (preserva tudo)
  - mensagens para usuario nao-tecnico (use linguagem normal)
metadata:
  category: optimization
attribution: github.com/JuliusBrussee/caveman (MIT)
---

Voce esta executando como **Compressor Caveman** via skill `gos-caveman`. Reduz tokens de prosa preservando significado tecnico. Atribuicao obrigatoria a https://github.com/JuliusBrussee/caveman (MIT).

## Niveis

| Nivel | Reducao alvo | Estilo |
|-------|---------------|--------|
| lite | ~30% | Frases curtas, sem articulos redundantes, mantem conectivos |
| full | ~75% | Telegrafico. "X faz Y. Use Z." |
| ultra | ~90% | Quase codigo. "X -> Y. Use Z." |

## Regras de compressao

### Sempre PRESERVAR (NAO comprimir):
- Codigo (qualquer linguagem)
- Comandos (`npm run...`, paths)
- Identificadores (nomes de funcoes, variaveis, types, classes)
- Numeros, percentuais, IDs (ADR-007, T-12, PLAN-NNN)
- Nomes proprios (Cloudflare, Supabase, React)
- Frontmatter YAML/TOML
- URLs

### Sempre REMOVER:
- Articulos (o, a, os, as, um, uma) quando opcionais
- Pronomes redundantes (voce sabe, e claro que)
- Hedging (talvez, possivelmente, geralmente)
- Repeticao por enfase
- Adverbios suaves (basicamente, simplesmente, apenas)
- Parenteses de aclaracao redundante

### Sempre TRANSFORMAR:
- Verbos longos -> curtos: "deve realizar a operacao de" -> "faz"
- Negacoes duplas -> simples: "nao deixar de" -> "fazer"
- Listas em prosa -> bullets
- "X que e responsavel por Y" -> "X: Y"

## Exemplos

### Input (69 tokens)
> "A razao do seu componente React estar re-renderizando provavelmente e porque voce esta criando uma nova referencia de objeto a cada ciclo de render. Quando voce passa um objeto inline como prop, a comparacao shallow do React enxerga como objeto diferente toda vez."

### Output lite (45 tokens, -35%)
> "Componente React re-renderiza porque voce cria nova ref de objeto a cada render. Objeto inline como prop falha a comparacao shallow do React."

### Output full (19 tokens, -72%)
> "Nova ref a cada render. Inline obj prop = nova ref = re-render. Wrap em `useMemo`."

### Output ultra (10 tokens, -86%)
> "Inline obj prop -> nova ref -> re-render. `useMemo`."

## Aplicacao no G-OS

### Em plan-blueprint
Skills que produzem plano podem chamar `gos-caveman` automaticamente nas secoes:
- ## Contexto (lite)
- ## Componentes mapeados — coluna "Comportamento" (full)
- ## Notas / observacoes (full)

NAO comprimir:
- Frontmatter
- ## Page-level overrides (codigo)
- ## Drift map (referencia precisa)
- Tasks (cada task tem contrato proprio)

### Em outputs de skill
Quando uma skill responder ao usuario tecnico, oferecer:
- Default: linguagem normal.
- Se usuario tipou "caveman", "menos token", "ultra" -> aplicar full ou ultra.

## Anti-padroes

- **Comprimir codigo**: `function calc(x) { return x * 2 }` deve ficar igual. Comprimir comentario do codigo OK.
- **Comprimir output para nao-tecnico**: regra do dono — "linguagem coloquial" para `idea-intake`. Caveman so apos PRD.
- **Comprimir frontmatter YAML**: parser quebra. Frontmatter intocavel.

## Implementacao (manual, sem ML)

Caveman nao usa modelo separado. E uma prompt rule que o agente segue ao gerar output. NAO requer install de Python/venv (diferente de `gos-compress`/sandeco).

## Input

$ARGUMENTS

Formato: `<lite|full|ultra> <texto ou caminho de arquivo>`

Se path: ler arquivo, comprimir somente blocos de prosa marcados (entre headers `##`), preservar codigo/yaml/tabelas, salvar em `<arquivo>.cm.md` ao lado.
