# Supabase Stack KB — Free Tier (2026-05)

> Referencia consultada por `adr-tech-decisions`. Data: 2026-05.
> Sempre verificar https://supabase.com/pricing para limites atuais.

## Filosofia G-OS para Supabase

1. Usar quando precisa Postgres real, auth pronta, ou Realtime escalavel.
2. Combina bem com Cloudflare Pages (front) + Supabase (backend completo).
3. Free tier projetos pausam apos 7 dias inativos — atencao para MVPs descartaveis em demo.
4. **Anti-vendor-lock**: Postgres standard, Auth pode ser substituida (Auth.js, Lucia).

## Free tier (2 projetos ativos simultaneos)

### Database (Postgres)
- 500MB storage
- 2GB bandwidth/mes
- 50k MAU em Auth
- 5GB storage de arquivos (Storage)
- 7 dias de inatividade -> projeto pausa (precisa logar e dar resume)

### Auth (free 50k MAU)
- Email/password, magic link, OAuth (Google, GitHub, ~20 providers)
- Row Level Security (RLS) Postgres-based
- JWT signing automatico
- **Limite: 4 social providers em free, 30 em pro**

### Realtime (free)
- Postgres logical replication -> canais por tabela
- 200 conexoes simultaneas
- 2M mensagens/mes
- **Limite: 200 conexoes pode ser baixo para chat publico; suficiente para dashboard interno**

### Storage (free)
- 5GB
- 5GB egress/mes
- Image transformations (resize, format)

### Edge Functions (free)
- 500k invocations/mes
- 2s execution time
- Deno-based
- Bom para webhooks, cron jobs, API routes leves

## Patterns recomendados

### Pattern: Front Cloudflare + Back Supabase (recomendado MVP rapido)

```
[Cloudflare Pages]            [Supabase]
   Vite + React               Postgres + Auth + Storage
   |                          |
   +--- supabase-js client ---+
        (direto do browser, RLS protege)
```

Pros:
- Sem Workers necessarios
- Auth pronta em 1 hora
- RLS substitui boa parte de backend

Contras:
- Vendor lock no Auth (mas Postgres e portavel)
- Cold start de project apos 7 dias de inatividade

### Pattern: Cloudflare Workers + Supabase Postgres (apenas DB)

Use quando:
- Quer logica de servidor (Workers) mas precisa Postgres real (D1 nao basta).
- Auth simples ou via Cloudflare Access.

## Realtime: Supabase Realtime vs Cloudflare DO+WS

| Criterio | Supabase Realtime | Cloudflare DO+WS |
|----------|-------------------|------------------|
| Custo MVP | Free 200 conn | Free 1M ops/mes |
| Modelo | Postgres-based (subscribe a INSERT/UPDATE) | Codigo livre (qualquer mensagem) |
| Boa para | Notificacoes vindas de DB | Chat, jogo, presenca |
| Limite escala | 200 conn free / 500 pro | 32k por DO, infinito DOs |
| Latencia | ~100ms | ~50ms (edge) |
| Setup | `.from('table').on('INSERT', ...)` | Implementar `webSocketMessage()` |

**Regra G-OS**: usuario indicou "chat ao vivo" sem DB transacional -> DO+WS. Indicou "notificacao quando alguem cadastra X" -> Supabase Realtime.

## Anti-patterns

- Free project como demo permanente: pausa em 7 dias, demo quebra.
- RLS desabilitado em prod: vazamento de dados.
- service_role key exposta no front: bypassa RLS — NUNCA por no Pages.
- Storage publico sem moderacao: ataques de upload em MVP.

## Bindings (Cloudflare Workers consumindo Supabase)

```typescript
import { createClient } from '@supabase/supabase-js'

export default {
  async fetch(req: Request, env: Env) {
    const supabase = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_ANON_KEY  // ou SERVICE_ROLE pra ops privilegiadas
    )
    // ...
  }
}
```

`wrangler secret put SUPABASE_URL` e `SUPABASE_ANON_KEY`.

## Limites para alarmar

| Recurso | Limite free | Alarme |
|---------|-------------|--------|
| DB storage | 500MB | >300MB |
| MAU auth | 50k | >30k |
| Realtime conn | 200 | >100 sustentadas |
| Edge Function invocations | 500k/mes | >300k/mes |
| Inatividade | 7 dias | demos publicas precisam ping |

## Ferramentas

- **CLI**: `npm i -g supabase` — `supabase init`, `supabase db push`, migrations
- **Studio**: dashboard web em supabase.com — SQL editor, table editor, Auth users
- **Local dev**: `supabase start` (precisa Docker) — sobe Postgres + Auth + Storage local
