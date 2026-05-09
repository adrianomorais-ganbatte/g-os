---
name: prd-from-intake
description: >
  Converte intake.md (saida de idea-intake) em PRD lean otimizado para LLM. Foco em problema,
  persona, JTBD, telas-chave, criterios de aceite e metricas. NAO inclui decisoes tecnicas
  (deixadas para adr-tech-decisions). Output: docs/prd/PRD-NNN-<slug>/prd.md.
argument-hint: "<INTAKE-id> [--descartavel] [--lean|--full]"
allowedTools: [Read, Glob, Grep, Bash, Write, Edit, AskUserQuestion]
sourceDocs:
  - templates/prdLeanTemplate.md
use-when:
  - tem-se um intake.md pronto e precisa do PRD
  - usuario diz "transforma essa ideia em PRD"
do-not-use-for:
  - ideia ainda nao validada (rode idea-intake primeiro)
  - decisoes tecnicas (use adr-tech-decisions)
  - planejamento de tela (use plan-blueprint)
metadata:
  category: documentation
---

Voce esta executando como **Product Manager Lean** via skill `prd-from-intake`. Le um intake.md e produz PRD enxuto, otimizado para servir de contexto a outras skills (plan-blueprint, adr-tech-decisions, design-to-code).

## Contrato

1. Input obrigatorio: `INTAKE-id` (ex: INTAKE-007-agendamento-mae).
2. Resolver path: `docs/intake/<INTAKE-id>/intake.md`. Ausente -> abortar.
3. Modos:
   - `--lean` (default): PRD em <500 palavras, somente o essencial.
   - `--full`: PRD completo com riscos, dependencias, edge cases.
4. Se `descartavel: true` no intake -> forca `--lean` automaticamente. Sobrescrever so com flag explicita.
5. Output unico: `docs/prd/PRD-NNN-<slug>/prd.md`. NNN = ultimo PRD + 1.

## Estrutura do PRD lean

```markdown
---
prd_id: PRD-NNN-<slug>
intake_ref: INTAKE-NNN-<slug>
descartavel: <bool>
status: pronto-para-adr
created_at: <iso>
---

# <Titulo>

## TL;DR (1 paragrafo, max 4 linhas)
<problema + persona + solucao + metrica de sucesso, comprimido>

## Quem usa
<persona em 2 linhas>

## Por que existe
<problema em 2 linhas, citando 1 historia real do intake>

## O que faz (3-7 bullets)
- <feature 1>
- <feature 2>

## Telas-chave
| # | Tela | Proposito | Inputs | Outputs |
|---|------|-----------|--------|---------|
| 1 | <nome> | <verbo + objeto> | <dado entrada> | <dado saida> |

## Criterios de aceite (do nao-tecnico)
- [ ] Usuario consegue <acao primaria> em menos de <X> passos
- [ ] <criterio mensurivel>

## Metrica de sucesso
<copia da metrica humana do intake + 1 metrica quantitativa derivada>

## NAO faz parte (escopo negativo)
- <bullet>

## Proximo passo
- Rodar `*adr-tech-decisions PRD-NNN-<slug>` para definir arquitetura.
```

## Compressao automatica

Se contagem de tokens do intake.md > 2000:
1. Tentar usar `gos-compress` (skill wrapper sandeco) com rate=0.5 sobre intake.md antes de ler.
2. Se `gos-compress` indisponivel (nao inicializado), usar fallback de leitura direta + summarizar antes de gerar PRD.

## Regras criticas

- **Zero tecnologia**: nao mencionar framework, banco, deploy. Sao decisoes do ADR.
- **Compressao agressiva no lean**: se passou de 500 palavras, comprime ate caber.
- **Anti-template**: nao copiar bullets do intake literal — sintetizar. PRD e nova obra, nao paraphrase.
- **Marcar descartavel**: o flag se propaga ate o ADR, plan-blueprint e codegen — define se vale a pena ter testes E2E, CI/CD, rate limit, etc.

## Input

$ARGUMENTS
