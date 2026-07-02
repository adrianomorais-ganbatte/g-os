# Architecture & Stack Policy (G-OS)

Decisão de arquitetura antes de código. Uma referência é ponto de partida, não decisão travada — e nenhuma implementação relevante começa sem a stack definida e a decisão registrada.

## Referência ≠ decisão arquitetural

Quando o input vem de outro projeto, do Figma Make, do Stitch ou de qualquer referência, o código é **material de triagem** — nunca cópia obrigatória. Antes de reproduzir componente, estrutura ou tecnologia, avaliar:

- Qual é o objetivo real da funcionalidade e em que contexto ela roda.
- Onde a aplicação será hospedada e quais serviços já existem (DB, auth, storage, e-mail, infra).
- Se a tecnologia da referência ainda é a melhor escolha para **este** projeto e este destino.
- Se há alternativa mais simples, coerente, econômica ou fácil de manter (compõe com `libraries/lazy-dev-policy.md`).

Copiar a referência sem essa avaliação é como decisão arquitetural acidental — o que esta policy existe para impedir.

## Stack-first (obrigatória)

Nenhuma implementação relevante começa sem a stack definida. Os artefatos já têm dono único no G-OS — reutilizar, não duplicar:

- **stack-do-projeto** → `docs/stack.md` (stack-of-record), mantido por `stack-profiler` (`*stack refresh|show|drift`). É contrato: todo plano trava `stack_ref: docs/stack.md@<sha>`; mudança de stack exige ADR + flag `--allow-arch-change`.
- **decisões-arquiteturais** → `docs/adr/ADR-NNN-*.md`, mantidas por `adr-tech-decisions`.
- **fluxos/** → `dirs.fluxos` do `plan-paths.json` (default `docs/fluxos/`), onde vivem os diagramas.

A stack não evolui por acidente (por adicionar biblioteca durante o dev): cada escolha relevante tem finalidade clara e compatível com a arquitetura. Faltando informação para decidir, registrar a decisão como **pendente** com as opções e o que muda entre elas — nunca escolher arbitrário.

## Auth & serviços próprios

Não defaultar Supabase Auth / Firebase Auth (ou qualquer serviço) só porque aparece na referência. Avaliar own-vs-managed por contexto — Better Auth, fluxo próprio de cadastro/sessão, SMTP para confirmação/recuperação, DB próprio para usuários/sessões/permissões — pesando complexidade, segurança, personalização, controle dos dados, custo, manutenção, lock-in e compatibilidade com a infra escolhida. Escolher o que atende ao projeto, não o mais conhecido.

## Diagramas Mermaid (padrão)

Gerar diagramas Mermaid para os fluxos que ajudam a entender o produto — sem exigir conhecimento técnico avançado de quem lê: auth, cadastro/confirmação de e-mail, recuperação de senha, sessão, permissões/perfis, fluxos de negócio, integrações entre serviços, processamento de dados, jornada do usuário e arquitetura geral. Vivem no `plan.md` (quando cabe) e em `dirs.fluxos`.

## Comunicação explicável (híbrido)

Commanding em decisão e orquestração. Mas **toda ação ou decisão relevante acompanha uma explicação em nível de produto/negócio** — o quê será feito, por quê e qual o impacto — em linguagem simples, para que qualquer usuário (técnico ou não) saiba minimamente o que está acontecendo. O detalhe técnico é camada opcional: entra sob demanda ou ao registrar a decisão (ADR/stack). Português (pt-BR), explicação simples primeiro, profundidade depois.

## Aplicação no G-OS

- Regra sempre-ativa referenciada pelo `gos-master` (`core_principles`); explicabilidade reforçada no `output_policy` do master.
- Donos dos artefatos: `stack-profiler` (stack.md) e `adr-tech-decisions` (ADRs) — esta policy rege o comportamento, não cria canal novo.
- `plan-blueprint` avalia a referência antes de copiar (Fase 2.3) e emite os diagramas Mermaid de fluxo quando há auth/dados/jornada.
- `check-plan.js` avisa (warn, não bloqueia) quando um plano com auth/fluxo de dados não traz diagrama Mermaid.
