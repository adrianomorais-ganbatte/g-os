# G-OS Master Proactive + Stack Default — 2026-05-09 (segundo deploy)

> Atualizacao complementar ao deploy principal de 2026-05-09. Ensina o `gos-master`
> a sugerir proativamente o stack default, padroes UI (Lucide, skeleton, empty),
> e abstrai padroes recorrentes (typeform, timer, Cloudflare Pages setup).

## Sumario

### Skills NOVAS (3)

| Slug | Categoria | Proposito |
|------|-----------|-----------|
| `cloudflare-pages-setup` | infrastructure | Setup interativo de Pages + Workers (init/add-binding/deploy/env) |
| `typeform-form-pattern` | ui-pattern | Gera form passo-a-passo (uma pergunta por vez) com state, validacao, animacao |
| `timer-component-pattern` | ui-pattern | Gera componente Timer (countdown) com state machine, atalhos, persistencia |

### Libraries NOVAS (6)

- `default-stack-kb.md` — stack canonico G-OS (React+TS+Vite, TanStack, Tailwind+shadcn, Lucide, Cloudflare Pages+Workers, Supabase)
- `security-best-practices.md` — RLS, secrets, CORS, validacao Zod, RLS audit checklist
- `engineering-best-practices.md` — TypeScript strict, React patterns, TanStack Query patterns, file structure, naming, testing
- `lucide-icons-policy.md` — zero-emoji policy + tabela emoji->Lucide + tamanhos canonicos
- `typeform-pattern-spec.md` — anatomia abstrata (questions[], state, navegacao, animacao, validacao)
- `timer-pattern-spec.md` — state machine, hook reutilizavel, persistencia, atalhos, beep

### Master agent (`ganbatte-os-master.md`) atualizacoes

Adicionados 3 blocos novos no YAML do master:

#### `proactive_suggestions`
Triggers que disparam sugestoes automaticas:
- **novo_projeto** -> sugerir prototype-orchestrator + stack default + cloudflare-pages-setup.
- **form_de_coleta** -> sugerir typeform-form-pattern.
- **timer** -> sugerir timer-component-pattern.
- **ui_data_load** -> lembrar skeleton+empty+error obrigatorios.
- **decisao_arquitetural** -> rotear para adr-tech-decisions.

Cada trigger tem `output_template` que o master usa textualmente.

#### `output_policy`
4 regras de saida obrigatorias:
- `zero_emoji_em_codigo` — bloqueado por ui-guardrails seccao F.
- `lucide_only` — unica lib de icones aceita.
- `skeleton_empty_obrigatorios` — vale ate em descartavel.
- `no_emoji_em_resposta_default` — chat tambem zera emoji por default.

#### `default_stack`
Documenta stack canonico que master propoe quando usuario nao especifica:
- Frontend: Vite+React+TS+TanStack+Tailwind+shadcn+Lucide+RHF+Zod+Sonner.
- Backend: Workers+Supabase Postgres+Auth+Realtime+Storage.
- Hosting: Cloudflare Pages + Workers no /api.
- Tooling: pnpm, wrangler, supabase CLI, Biome.

### Refatorados

- `ui-guardrails/SKILL.md` ganhou seccao **F (Lucide / zero-emoji)** + reforcou skeleton/empty obrigatorios em estados visuais. Severity F = high (bloqueia codegen).

---

## Como o master orquestra agora

### Cenario A — usuario chega com ideia nova

```
Usuario: "queria fazer um app que..."

Master (proativamente):
  1. Detecta novo_projeto trigger.
  2. Sugere /gos:skills:prototype-orchestrator.
  3. Apresenta stack default em 1 paragrafo.
  4. Oferece /gos:skills:cloudflare-pages-setup init para configurar tudo.
  5. Pergunta: "Topa esse caminho ou prefere outro?"
```

### Cenario B — usuario pede form

```
Usuario: "preciso de um cadastro de leads"

Master:
  1. Detecta form_de_coleta trigger.
  2. Sugere typeform-pattern (uma pergunta por tela, conversao maior).
  3. Roda /gos:skills:typeform-form-pattern apos confirmacao.
  4. ui-guardrails valida estados+lucide+a11y antes de codar.
```

### Cenario C — usuario pede timer/pomodoro

```
Usuario: "preciso de um timer pomodoro"

Master:
  1. Detecta timer trigger.
  2. Roda /gos:skills:timer-component-pattern com defaults pomodoro (1500s).
  3. Codigo gerado com state machine, atalhos, Lucide controls.
```

### Cenario D — usuario pede tela com lista

```
Usuario: "tela de projetos com cards"

Master:
  1. Detecta ui_data_load trigger.
  2. Reforca: codigo vai incluir skeleton + empty + error states.
  3. Plan-blueprint aplica ui-guardrails -> bloqueia se faltar.
  4. design-to-code gera com Lucide icons (zero emoji).
```

---

## Criterios de aceite (DoD)

### Master
- [ ] `proactive_suggestions` no YAML, com 5 triggers.
- [ ] `output_policy` com 4 regras estritas.
- [ ] `default_stack` documentado.
- [ ] core_principles cita zero-emoji, Lucide, skeleton+empty, default stack.

### Skills novas
- [ ] `cloudflare-pages-setup` cobre init/add-binding/deploy/env, sempre pergunta antes de gravar.
- [ ] `typeform-form-pattern` gera estrutura completa (container + hook + 5 question types + Zod schema).
- [ ] `timer-component-pattern` gera state machine + hook + componente + utils.

### Libraries
- [ ] `default-stack-kb.md` lista todas as libs do stack default + setup rapido.
- [ ] `security-best-practices.md` cobre RLS Supabase, secrets, CORS, validacao Zod.
- [ ] `engineering-best-practices.md` documenta TypeScript strict, patterns React/TanStack.
- [ ] `lucide-icons-policy.md` mapeia 30+ emojis -> Lucide + tamanhos canonicos.
- [ ] `typeform-pattern-spec.md` e `timer-pattern-spec.md` sao auto-suficientes.

### UI Guardrails
- [ ] Seccao F (Lucide/zero-emoji) bloqueia codegen com emoji.
- [ ] Skeleton e empty state sao **obrigatorios** mesmo em descartavel.

### Distribuicao
- [ ] Registry atualizado com 3 novos slugs.
- [ ] Adapters Claude criados para cada um.
- [ ] Arquivos copiados para `Ganbatte/.gos/` (sem commit la).
- [ ] Commit em G-OS via `git@github-adriano`.

---

## Fontes referenciadas (importadas/abstraidas)

- `E:\Github\template-lp-wanderson\.a8z\skills\designkit\templates\form.tsx.template` — base do form pattern.
- `E:\Github\body-metrics-edge\.examples\tsx\old\body-metrics-quiz-typeform.tsx` — referencia primaria do typeform-pattern.
- `E:\Github\code-kata-timer\script.js` + `style.css` — base do timer-pattern (state machine + tema dark/light + persistencia).
- `E:\Github\docs-tools\supabase\guia-rls.md` — RLS audit (citado em security-best-practices).
- `E:\Github\docs-tools\docs\engineering\dev\02-padroes-codigo.md` — TypeScript patterns.
- `E:\Github\docs-tools\docs\engineering\stack\stack-base.md` — base do default-stack.
