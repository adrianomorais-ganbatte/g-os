---
name: react-doctor
description: >
  Use when React files/components changed and you need deterministic health diagnostics
  before final review or commit. Triggers: "run react doctor", "check React quality",
  "frontend regression scan". Do NOT use for non-React repositories or backend-only changes.
allowedTools: [Bash, Read, Glob, Grep]
sourceDocs:
  - docs/sources/frontend/react-doctor-patterns.md
  - docs/sources/frontend/react-best-practices-vercel.md
  - rules/workflow-execution.md
use-when:
  - arquivos React foram modificados e e preciso validar qualidade antes de commit
  - gate de pre-merge em PR com mudancas de componentes frontend
  - diagnosticar regressoes ou problemas de performance em componentes React
  - verificar saude geral do frontend antes de revisao final
do-not-use-for:
  - repositorios sem React (backends, scripts, CLIs puras)
  - escrita de testes unitarios (use qa)
metadata:
  category: mcp-enhancement
---

# Skill: React Doctor

## Input
- Scope: changed files only (`diff`) or full project (`full`).
- Context: local branch, PR, or pre-merge gate.

## Process
1. Detect if project has React runtime/dependencies.
2. Run baseline scan:
```bash
npx -y react-doctor@latest . --verbose
```
3. For PR-focused validation, prefer diff mode:
```bash
npx -y react-doctor@latest . --diff main --verbose
```
4. Collect score and diagnostics:
- severity distribution,
- highest impact rules,
- files requiring immediate fix.
5. Prioritize fixes in this order:
- security/correctness errors,
- performance/architecture warnings,
- dead code cleanup.
6. Referenciar guias de apoio:
- `docs/sources/frontend/react-best-practices-vercel.md` para otimizações críticas (waterfalls, bundle, cache).
- `skills/composition-patterns` quando houver proliferação de boolean props ou necessidade de compound components.

## Output
- Health score (0-100) and label.
- Top diagnostics with file path and action.
- Recommended next gate:
  - `>= 75`: proceed to QA review,
  - `50-74`: fix warnings before merge,
  - `< 50`: block merge and execute focused remediation.

## Guardrails
- Skip execution when React is not present.
- Do not suppress rules without explicit rationale.
- Keep CI usage in diff mode when repository scale is large.

## When to Use
- Use according to the triggers described in the description/use-when list.

## Do not use
- Fora do escopo descrito; prefira a skill apropriada.

## Instructions
1) Siga o passo-a-passo principal da skill.
2) Valide saa com checklists desta skill ou do workflow.
3) Registre decises relevantes se aplic5vel.
