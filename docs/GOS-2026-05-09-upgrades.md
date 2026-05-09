# G-OS Upgrades — 2026-05-09

> Aperfeicoamentos para 2 fluxos: ideia->prototipo (usuario nao-tecnico) e validacao print<->Figma + token optimization. Solicitado via `/gos:agents:gos-master`.

## Sumario das mudancas

### Skills NOVAS (8)

| Slug | Categoria | Proposito |
|------|-----------|-----------|
| `idea-intake` | discovery | Entrevista Mom Test/SPIN para nao-tecnicos -> intake.md |
| `prd-from-intake` | documentation | Converte intake em PRD lean |
| `adr-tech-decisions` | architecture | ADR interativo com KB Cloudflare/Supabase, sempre pergunta antes de chumbar |
| `prototype-orchestrator` | orchestration | Pipeline ideia->prototipo end-to-end com decision gates |
| `gos-caveman` | optimization | Comprime OUTPUT (~75%) sem tocar codigo |
| `gos-compress` | optimization | Comprime INPUT via LLMLingua-2 (sandeco wrapper) |
| `figma-print-diff` | visual-qa | Single-pass diff print<->Figma (sem fila) |
| `ui-guardrails` | validation | Pre-flight obrigatorio antes de codegen — bloqueia se faltar estados/a11y/tokens |

### Skills REFACTORED (3)

- `audit-screenshots` — enforce single-pass na acao `add` (lenses 1-6 com ambas imagens em contexto AGORA, divergencias sempre self-contained); `close` NUNCA re-le imagens, opera so sobre JSON.
- `plan-blueprint` — chama `ui-guardrails` apos plan-to-tasks; flags `--no-compress`, `--no-guardrails`, `--compress-context`; comprime ## Contexto e ## Notas via gos-caveman por default.
- `plan-to-tasks` — embeda checklist UI Guardrails (estados/responsivo/a11y/tokens) em toda task de UI, com relax para `descartavel: true`.

### Libraries NOVAS (5)

- `cloudflare-stack-kb.md` — limites free tier, patterns A/B/C, anti-patterns
- `supabase-stack-kb.md` — auth, postgres, realtime, comparacao com DO+WS
- `intake-questions-mom-test.md` — banco de perguntas em PT-BR para nao-tecnicos
- `caveman-rules.md` — regras detalhadas dos 3 niveis de compressao
- `gos-compress-setup.md` — guia setup do LLMLingua-2
- `visual-diff-lenses.md` — 6 lenses (layout/tokens/estados/conteudo/interacao/a11y)
- `ui-guardrails-checklist.md` — detalhe de cada item bloqueante

### Templates NOVOS (2)

- `intakeTemplate.md`
- `prdLeanTemplate.md`

### Adapters Claude (8 novos `.claude/commands/gos/skills/*.md`)

Todos os 8 skills novos tem adapter Claude correspondente. Pattern existente preservado.

---

## Como o gos-master orquestra

Pipeline tipica para usuario nao-tecnico que chega com uma ideia:

```
*gos-master  (ou direto)
  -> *prototype-orchestrator "minha ideia bruta aqui"
       -> idea-intake (15 perguntas em PT-BR, gate de validacao)
       -> prd-from-intake (PRD lean ou full)
       -> adr-tech-decisions (sempre pergunta — Cloudflare/Supabase, free tier)
       -> [opcional] Stitch/Figma generate-design
       -> plan-blueprint por tela
            -> plan-to-tasks (com guardrails embedados)
            -> ui-guardrails (bloqueia se faltar)
       -> design-to-code + figma-implement-design
       -> figma-print-diff (validacao visual single-pass pos-codegen)
```

Para correcao visual existente (ja existe app rodando):

```
*figma-print-diff <print> <figma-url>     # 1 print, single-pass, sem fila
   OU
*audit-screenshots add                     # multiplos prints acumulados
*audit-screenshots close <slug>           # plan + tasks
*execute-plan PLAN-NNN-fix-audit-<slug>
```

---

## Criterios de aceite (DoD)

### Fluxo 1 — Ideia -> Prototipo

- [ ] `idea-intake` aceita frase curta + roda 15 perguntas em PT-BR sem jargao.
- [ ] `idea-intake` persiste sessao em `.gos-local/intake-session.json` com retomada via `continuar`.
- [ ] `idea-intake` marca `descartavel: true` automaticamente quando sinais de problema fraco.
- [ ] `prd-from-intake` produz PRD <500 palavras em modo lean.
- [ ] `adr-tech-decisions` SEMPRE pergunta antes de chumbar (regra do dono confirmada).
- [ ] `adr-tech-decisions` consulta `cloudflare-stack-kb.md` e `supabase-stack-kb.md`.
- [ ] `adr-tech-decisions` para perfil A (descartavel) recusa pago e propoe Pages-only.
- [ ] `prototype-orchestrator` tem decision gate em cada fase (3 opcoes: aprovar/iterar/abortar).
- [ ] Adapters Claude funcionam via `/gos:skills:idea-intake`, etc.

### Fluxo 2 — Token + visual + codegen

- [ ] `gos-caveman` comprime so prosa, NUNCA codigo/yaml/tabelas.
- [ ] `gos-compress` requer setup unico (~1GB modelo), depois e idempotente.
- [ ] `audit-screenshots add` valida self-contained ANTES de persistir (where + expected + actual).
- [ ] `audit-screenshots close` aborta se algum print esta incompleto (pede re-add em vez de re-comparar).
- [ ] `figma-print-diff` recusa multiplos prints (direciona para audit-screenshots).
- [ ] `ui-guardrails` bloqueia codegen se faltar estado/responsivo/a11y em task de UI nao-descartavel.
- [ ] `plan-blueprint` chama `ui-guardrails` apos plan-to-tasks no pipeline default.
- [ ] `plan-to-tasks` embeda secoes obrigatorias em toda task de UI.

### Distribuicao

- [ ] `skills/registry.json` lista os 8 novos slugs.
- [ ] `.claude/commands/gos/skills/<slug>.md` existe para os 8.
- [ ] Arquivos copiados para `E:\Github\Ganbatte\.gos\` (regra do MEMORY: sem commit em Ganbatte).
- [ ] Commit em `E:\Github\.G-OS\` via SSH alias `git@github-adriano`.
- [ ] Push para o remote.

---

## Caveats e riscos conhecidos

1. **gos-compress requer setup pesado** (~1GB download de modelo HuggingFace). Para MVPs descartaveis, pode nao valer a pena — usar gos-caveman (puro prompt rule, sem instalacao).
2. **Caveman atribuicao MIT**: feita em `gos-caveman/SKILL.md` (linha `attribution`).
3. **prototype-orchestrator chama varias skills** — se uma falhar/abortar, sessao fica em estado intermediario. Retomar via `continuar` (le `prototype-session.json`).
4. **adr-tech-decisions assume MCP Figma** so quando rodar fase 4 (gerar mockups). MVP descartavel pode pular.
5. **ui-guardrails como bloqueio** pode irritar em descartaveis — flag `--no-guardrails` libera. Alternativa: marcar plan como `descartavel: true` no frontmatter.

---

## Proximos passos sugeridos (fora deste deploy)

1. Smoke test do `prototype-orchestrator` em uma ideia ficticia ("agendamento para minha mae").
2. Benchmark de tokens: 3 PLANs do fractus antes/depois de gos-caveman default.
3. Hook automatico pos-`design-to-code` -> `figma-print-diff` se houver screenshot disponivel.
4. Skill complementar `intake-to-stitch` para gerar mockups iniciais via Stitch API antes de Figma.
