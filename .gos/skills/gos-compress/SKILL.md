---
name: gos-compress
description: >
  Comprime INPUT de prompts longos antes de enviar a outra skill ou subagent, usando
  LLMLingua-2 da Microsoft (modelo XLM-RoBERTa local). Reducao tipica 40-60% sem perda
  semantica. Wrapper sobre sandeco-token-reduce. Requer setup unico (~1GB modelo HuggingFace).
argument-hint: "<acao: setup|compress|init> [args]"
allowedTools: [Read, Write, Bash]
sourceDocs:
  - libraries/gos-compress-setup.md
use-when:
  - precisa passar contexto longo (>2000 tokens) para subagent/skill
  - usuario pede "comprimir contexto" ou "reduzir tokens"
  - prototype-orchestrator avancando entre fases com PRD/intake longos
do-not-use-for:
  - textos curtos (<500 tokens — nao compensa)
  - codigo (perde semantica precisa)
  - frontmatter, tabelas estruturadas (parser quebra)
metadata:
  category: optimization
attribution: github sandeco/sandeco-token-reduce + microsoft/llmlingua-2
---

Voce esta executando como **Compressor de Input** via skill `gos-compress`. Wrapper sobre sandeco-token-reduce + LLMLingua-2 da Microsoft.

## Pre-flight: setup unico

Antes do primeiro uso, o `.venv` precisa existir em `skills/gos-compress/.venv/`.

### Verificar
```bash
test -d <skill-dir>/.venv && echo "ready" || echo "needs-setup"
```

### Setup (1x apenas, ~1GB download)
```bash
python "<skill-dir>/scripts/setup.py"
```

Setup faz:
- Cria `.venv`
- Instala `llmlingua` + `anthropic`
- Baixa `microsoft/llmlingua-2-xlm-roberta-large-meetingbank` (~1GB) em `~/.cache/huggingface/`
- Idempotente

## Acoes

### `setup` — instala/atualiza modelo
```
*gos-compress setup
```

### `compress` — comprime arquivo ou texto
```
*gos-compress compress --file path/to/long.md --rate 0.4
*gos-compress compress --file path/to/long.md --rate 0.4 --output path/comprimido.md
*gos-compress compress --text "texto longo" --rate 0.5
```

Parametros:
| Flag | Default | Descricao |
|------|---------|-----------|
| `--rate` | 0.4 | Fracao de tokens a manter (0.5 leve, 0.2 agressivo) |
| `--file` | — | Path do arquivo |
| `--text` | — | Texto direto |
| `--output` | — | Salva resultado em arquivo |
| `--json` | false | Output JSON com stats |

### `init` — alias para setup

## Taxa recomendada por uso

| Caso | Rate | Justificativa |
|------|------|---------------|
| Intake -> PRD | 0.5 | Preservar nuance |
| PRD -> ADR | 0.4 | Decisoes precisam contexto |
| ADR -> Plan | 0.4 | Padrao |
| Long thread -> resumo | 0.3 | Pode perder detalhe |
| Codigo (NAO USAR) | — | Use Read direto |

## Pipelines no G-OS

### Em prototype-orchestrator
Entre fases consecutivas, comprimir output da fase anterior antes de passar:

```
intake.md (4000 tokens)
  -> gos-compress rate=0.5
  -> intake.compressed (2000 tokens)
  -> input para prd-from-intake
```

### Em plan-blueprint
Quando rodando com `--compress-context`, comprimir `docs/stack.md` + `docs/prd/PRD-NNN/prd.md` + `docs/adr/*.md` antes de injetar no contexto.

## Output JSON (programatico)

```json
{
  "compression": {
    "compressed_prompt": "<texto>",
    "origin_tokens": 312,
    "compressed_tokens": 124,
    "ratio": 2.52,
    "saving": 188,
    "rate_requested": 0.4
  }
}
```

## Anti-uso

- Codigo: LLMLingua remove tokens "menos relevantes" semanticamente, mas codigo precisa preservacao exata.
- Tabelas: estrutura `|---|` quebra.
- YAML frontmatter: idem.
- Skill `idea-intake` outputs: usuario nao-tecnico pode confundir prosa fragmentada.

## Pre-processamento automatico (sandeco)

Antes de comprimir, sandeco aplica `strip_markdown()`:
- Remove `---`, grid de tabelas, `**bold**` (mantem texto), `##` headers (mantem texto), checkboxes, code fences, linhas vazias multiplas.

Reducao base ~6% antes do modelo entrar.

## Force tokens preservados

Sempre preservados pelo modelo (sandeco config):
- `\n`, `.`, `,`, `?`, `!`, `:`
- Negacoes PT: `nao`, `sem`, `nenhum`, `nunca`, `nem`, `nenhuma`
- Tokens com digitos (IDs, ms, percentuais) via `force_reserve_digit=True`

## Input

$ARGUMENTS
