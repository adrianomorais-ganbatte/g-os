# Fase 2 — Coleta + Auth

> **Período:** 22/03 - 05/04 (Auth) | 22/03 - 15/04 (Coleta completa)
> **Objetivo:** CRUD de templates/instâncias, form builder, autenticação gestor + participante.

## 2a: Coleta — Templates (22/03 - 05/04)

### Backend (Douglas)
- [ ] API Workspaces: CRUD Route Handlers
- [ ] API Templates: CRUD + versionamento + form builder fields
- [ ] API Instâncias: CRUD + publicar (gera linkCompartilhavel via nanoid)
- [ ] API Respostas: submit + auto-save (rascunho) + validação por tipo de campo
- [ ] RLS: participante só vê instâncias publicadas do seu programa
- [ ] Testes API Vitest: templates, instâncias, respostas

### Frontend (Adriano)
- [ ] TemplatesList — tabela com CategoryBadge, filtro por tipo
- [ ] TemplateForm — form builder com seções internas/externas, 4 tipos de pergunta
- [ ] TemplateDetail — estatísticas de uso + deploy
- [ ] InstanciaForm — select template + filtros por tags + prazo
- [ ] FormPublico (`/f/[linkId]`) — formulário público para participante
- [ ] RespostaDetalheDialog — visualização por tipo (texto, escala, múltipla escolha)

## 2b: Auth (29/03 - 05/04)

### Backend (Douglas)
- [ ] Supabase Auth: email/senha (gestor) + magic link (participante)
- [ ] Middleware Next.js: proteção de rotas `(platform)/`
- [ ] Callback route (`/auth/callback/route.ts`)
- [ ] Rate limiting em endpoints públicos

### Frontend (Adriano)
- [ ] Login page (email/senha)
- [ ] Magic link flow (email → callback → formulário)
- [ ] Auth guard no layout `(platform)/`
- [ ] Sessão persistida via cookies HTTP-only

## Critérios de aceite
- Gestor cria template com form builder, publica instância, link funciona
- Participante recebe magic link, autentica, responde formulário, resposta salva
- RLS impede participante de ver instâncias de outro programa
- Templates com respostas não podem ser deletados (apenas desativados)

## Referências
- `docs/fractus/sprint-track-backend.md` — S05-S07
- `docs/fractus/sprint-track-frontend.md` — S05-S07
- ADR-008: Magic link auth
