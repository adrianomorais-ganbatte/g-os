---
name: cloudflare-pages-setup
description: >
  Guia interativo para configurar projeto novo em Cloudflare Pages + Workers. Cobre
  wrangler.toml, bindings (D1/KV/R2/DO), Pages Functions vs Workers separados,
  preview vs production, custom domain. Pergunta antes de chumbar.
argument-hint: "<acao: init|add-binding|deploy|env> [args]"
allowedTools: [Read, Glob, Grep, Bash, Write, Edit, AskUserQuestion]
sourceDocs:
  - libraries/cloudflare-stack-kb.md
  - libraries/security-best-practices.md
  - libraries/default-stack-kb.md
use-when:
  - novo projeto precisa configurar Cloudflare Pages
  - usuario quer adicionar binding (D1, KV, R2, DO) a Workers existente
  - configurar custom domain ou env vars no Pages
  - deploy primeiro (push) ou troubleshoot CI Pages
do-not-use-for:
  - Vercel/Netlify/AWS (stack alternativo, usar deploy-to-vercel ou similar)
  - apenas Workers sem Pages (ja existe wrangler init)
metadata:
  category: infrastructure
---

Voce esta executando como **Cloudflare Setup Helper** via skill `cloudflare-pages-setup`. Conduz setup interativo, sempre perguntando antes de gravar arquivo.

## Acoes

### `init` — projeto novo (Pages + Workers)

1. Ler `package.json` se existir. Se nao, propor `npm create vite@latest` primeiro.
2. AskUserQuestion sequencial:
   - "Project name (slug Cloudflare):"
   - "Custom domain (deixe vazio para usar `<slug>.pages.dev`):"
   - "Backend: Pages Functions (mesmo repo, /functions/) ou Worker separado (/api/*)?"
   - "DB: Supabase Postgres / D1 / nenhum?"
   - "Auth: Supabase Auth / Cloudflare Access / nenhum?"
   - "Storage: R2 / Supabase Storage / nenhum?"
3. Gerar `wrangler.toml` apropriado (ver templates abaixo).
4. Gerar `.env.example` + `.gitignore` (entradas para `.env`, `.dev.vars`, `node_modules`).
5. Gerar `package.json` scripts: `dev`, `build`, `preview`, `deploy:preview`, `deploy:prod`.
6. Mostrar `wrangler login` + `wrangler secret put <NAME>` para credentials.

### `add-binding` — adicionar D1/KV/R2/DO

1. Ler `wrangler.toml` existente.
2. Pergunta: "Tipo de binding?" (D1, KV, R2, DO).
3. Pergunta: "Nome do binding (variavel JS):" — ex `DB`, `KV`, `IMAGES`, `ROOM`.
4. Para D1: `wrangler d1 create <name>` + adicionar bloco `[[d1_databases]]`.
5. Para KV: `wrangler kv:namespace create <name>` + adicionar bloco `[[kv_namespaces]]`.
6. Para R2: `wrangler r2 bucket create <name>` + bloco `[[r2_buckets]]`.
7. Para DO: gera class skeleton em `src/durable-objects/<Name>.ts` + bloco `[[durable_objects.bindings]]` + migration.
8. Gerar tipos TypeScript (`worker-configuration.d.ts`).

### `deploy` — deploy preview ou production

1. Pergunta: "Preview ou production?"
2. Validar `wrangler.toml` parseavel.
3. Validar build local: `npm run build`.
4. Preview: `wrangler pages deploy dist --branch=<slug>` -> retorna URL temporaria.
5. Prod: `wrangler pages deploy dist --branch=main` (somente se branch atual e main).
6. Mostrar URL final + dashboard link.

### `env` — gerenciar env vars / secrets

1. Pergunta: "List, add, remove, ou pull?"
2. List: `wrangler secret list` + `wrangler pages project list`.
3. Add: `wrangler secret put <NAME>` (interativo, esconde valor digitado).
4. Remove: `wrangler secret delete <NAME>` (confirma antes).
5. Pull: copia env do dashboard pra `.dev.vars` local.

## Templates

### wrangler.toml — Pages Functions (recomendado MVP)

```toml
name = "<slug>"
compatibility_date = "2026-05-01"
compatibility_flags = ["nodejs_compat"]

# Pages config
pages_build_output_dir = "dist"

# Bindings (descomente os que usar)
# [[d1_databases]]
# binding = "DB"
# database_name = "<name>"
# database_id = "<uuid>"

# [[kv_namespaces]]
# binding = "KV"
# id = "<uuid>"

# [[r2_buckets]]
# binding = "R2"
# bucket_name = "<name>"
```

### wrangler.toml — Workers separado

```toml
name = "<slug>-api"
main = "src/worker/index.ts"
compatibility_date = "2026-05-01"
compatibility_flags = ["nodejs_compat"]

[vars]
PUBLIC_VAR = "value"

# Secrets sao via `wrangler secret put`, nao em vars.

[[d1_databases]]
binding = "DB"
database_name = "<name>"
database_id = "<uuid>"
```

### Pages Functions structure

```
project/
  functions/
    api/
      [[path]].ts        # catch-all com Hono opcional
  src/
    main.tsx              # Vite entry
  dist/                   # build output
  wrangler.toml
```

```ts
// functions/api/[[path]].ts
import { Hono } from 'hono';

type Bindings = {
  DB: D1Database;
  // SUPABASE_URL: string;
  // SUPABASE_SERVICE_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/projects', async (c) => {
  const result = await c.env.DB.prepare('select * from projects').all();
  return c.json(result.results);
});

export const onRequest = (ctx: any) => app.fetch(ctx.request, ctx.env, ctx);
```

## Custom domain

1. `wrangler pages project list` -> confirma projeto.
2. Dashboard -> Pages -> projeto -> Custom domains -> Add.
3. Adicionar CNAME no DNS apontando para `<slug>.pages.dev`.
4. Aguardar SSL (1-15min).

## Checklist de seguranca pos-setup

(Aplica `libraries/security-best-practices.md`)

- [ ] `.env`, `.dev.vars` no `.gitignore`.
- [ ] `service_role_key` Supabase NUNCA em `vars` do wrangler.toml — sempre `wrangler secret put`.
- [ ] CORS configurado para origem conhecida (`Access-Control-Allow-Origin: https://<slug>.pages.dev`).
- [ ] HTTPS forced (Cloudflare default).
- [ ] `compatibility_date` recente (max 6 meses).

## Troubleshooting comum

| Erro | Causa | Fix |
|------|-------|-----|
| "wrangler: command not found" | nao instalado | `npm i -D wrangler` + `npx wrangler ...` |
| "Authentication required" | nao logou | `wrangler login` (abre browser) |
| Build falha em CI Pages | env var faltando | adicionar no dashboard Pages > Settings > Env |
| `Workers limit exceeded` | excedeu free tier | `wrangler tail` + verificar trafego |
| D1 query lenta | sem indice | `wrangler d1 execute <db> --command="explain query plan ..."` |

## Input

$ARGUMENTS
