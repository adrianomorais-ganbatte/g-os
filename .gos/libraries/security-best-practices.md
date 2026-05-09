# Security Best Practices — G-OS

> Checklist de seguranca aplicavel ao stack default (React + Workers + Supabase). Aplicado por `ui-guardrails`, `adr-tech-decisions` e validado por `validate-plan` quando viavel.

## Principio: defense-in-depth pragmatico

MVP descartavel: priorize itens **must**. Continuo: cobrir todos.

## 1. Secrets e variaveis de ambiente

### Must
- [ ] **Nunca** committar `.env`, `.dev.vars`, `wrangler.toml` com secrets.
- [ ] `.env.example` apenas com chaves vazias.
- [ ] Workers: secrets via `wrangler secret put` (nao `vars` em wrangler.toml).
- [ ] Pages: env vars sensiveis somente em "encrypted" no dashboard.
- [ ] Front (Vite): apenas `VITE_*` vars publicas. **NUNCA** `service_role` Supabase no front.

### Should
- [ ] Rotation de chaves a cada 90 dias em prod.
- [ ] Audit log de quem acessou secret.

## 2. Supabase — Row Level Security (RLS)

### Must
- [ ] **RLS sempre ON** em toda tabela com dados de usuario.
- [ ] Policy `permissive` baseada em `auth.uid()` para `select|insert|update|delete`.
- [ ] Tabelas publicas (read-only): `policy USING (true)` em SELECT, sem INSERT/UPDATE/DELETE.
- [ ] Frontend usa SOMENTE `anon_key`. `service_role_key` SO em Workers/Edge Functions.

### Should
- [ ] View de auditoria de RLS (ver `docs-tools/supabase/guia-rls.md` no projeto base).
- [ ] Testes que tentam acessar dado de outro user e devem falhar.
- [ ] `BYPASSRLS` documentado caso a caso (admin queries).

### Pattern padrao para tabela "minha"
```sql
alter table public.<tabela> enable row level security;

create policy "select_own"
  on public.<tabela> for select
  using (auth.uid() = user_id);

create policy "insert_own"
  on public.<tabela> for insert
  with check (auth.uid() = user_id);

create policy "update_own"
  on public.<tabela> for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "delete_own"
  on public.<tabela> for delete
  using (auth.uid() = user_id);
```

## 3. Auth (Supabase)

### Must
- [ ] Magic link OU OAuth — evitar password como primary.
- [ ] Email allowlist em projeto interno (via RLS ou Edge Function).
- [ ] `auth.uid()` sempre referenciada no front via `supabase.auth.getUser()` (nao trust local cache).
- [ ] Logout invalida sessao remota (`supabase.auth.signOut({ scope: 'global' })`).

### Should
- [ ] MFA (TOTP) para admin.
- [ ] Rate limit em endpoints de auth via Supabase config.

## 4. CORS & CSRF

### Must
- [ ] Workers retornam `Access-Control-Allow-Origin` SO para origens conhecidas (nao `*` em prod).
- [ ] CSRF: tokens em forms sensiveis OU SameSite=Strict cookies.
- [ ] Anti-clickjacking: `X-Frame-Options: DENY` em paginas auth.

## 5. Inputs e validacao

### Must
- [ ] Validar todo input do usuario com Zod no front E backend (defense-in-depth).
- [ ] SQL: usar parametrizadas (Supabase JS ja faz). NUNCA concatenar string.
- [ ] HTML: nunca renderizar conteudo do usuario como HTML bruto — sempre sanitizar via lib dedicada (DOMPurify) antes de injetar.
- [ ] File upload: validar mime type + tamanho server-side (em Workers ou Supabase Storage policy).

## 6. Logs e observabilidade

### Must
- [ ] Nao logar PII (email, telefone, CPF) em texto plano.
- [ ] Mascarar tokens em logs (regex `[A-Za-z0-9]{32,}` -> `***`).
- [ ] Wrangler tail apenas em dev — desabilitar em prod.

### Should
- [ ] Sentry ou Cloudflare Logs para erros nao-tratados.

## 7. Dependencias

### Must
- [ ] `npm audit` em CI (falha em high/critical).
- [ ] Lockfile committed (`package-lock.json` ou `pnpm-lock.yaml`).
- [ ] Atualizar deps com versao patch a cada sprint (renovate-bot opcional).

## 8. Deployment

### Must
- [ ] HTTPS forced (Cloudflare ja faz por default).
- [ ] HSTS header em paginas auth.
- [ ] Wrangler `compatibility_date` recente (max 6 meses atras).

### Should
- [ ] Branch protection no GitHub (require PR + review + checks).
- [ ] Preview deploys com auth (Cloudflare Access).

## 9. RLS audit checklist (pre-launch)

```
[ ] Toda tabela com user data tem RLS ON?
[ ] Toda RLS tem policy permissive baseada em auth.uid()?
[ ] anon role consegue SELECT em tabelas publicas?
[ ] anon role NAO consegue SELECT em tabelas privadas?
[ ] authenticated role enxerga apenas suas linhas?
[ ] service_role key NAO esta em codigo do front?
[ ] Trigger updated_at em todas as tabelas?
[ ] Constraints UNIQUE em colunas-chave (email, slug)?
```

## 10. MVP descartavel — relax permitido

Quando `descartavel: true` no PRD:
- RLS pode ser unico (todos veem tudo) se publico — declarar no ADR.
- Auth pode ser opcional (Cloudflare Access free).
- Sentry/observabilidade -> Cloudflare Logs nativos sao suficientes.
- npm audit medium permitido se nao afeta runtime.

## Referencias

- `docs-tools/supabase/guia-rls.md` — auditoria de RLS no projeto base.
- `docs-tools/docs/engineering/banco-dados/` — patterns de Postgres.
- OWASP Top 10 (https://owasp.org/Top10/).
- Supabase Hardening Checklist (https://supabase.com/docs/guides/platform/going-into-prod).
