# Cloudflare Stack KB — Free Tier First (2026-05)

> Referencia consultada por `adr-tech-decisions` ao decidir arquitetura. Data: 2026-05.
> Sempre verificar https://developers.cloudflare.com/ para limites atuais antes de chumbar.

## Filosofia G-OS para Cloudflare

1. **Free tier primeiro**: para MVPs descartaveis, recusar opcoes pagas.
2. **Monolito Workers + Pages**: front e back no mesmo repo quando possivel — evita CORS, deploy duplo, env separado.
3. **Sem servidor separado para WebSocket**: usar Durable Objects (free 1M ops/dia), nao infra dedicada.
4. **Anti-vendor-lock**: documentar saida (R2 -> S3, D1 -> Postgres) no ADR.

## Compute

### Workers (free)
- 100k requests/dia
- 10ms CPU/request (sem extender — paid sobe pra 30s)
- Sem cold start
- Compativel com Hono, itty-router, ts-rest

### Pages (free)
- Builds ilimitados
- 500 builds/mes
- 100 dominios custom
- Functions inclusos (Workers embutido na Pages)
- 20k requests/dia para Functions no free

### Workers Paid ($5/mes)
- 10M requests/mes incluido
- 30s CPU/request
- Workers Logs

## Storage

### D1 (free)
- 5GB total
- 5M reads/dia
- 100k writes/dia
- SQLite-compatible
- Boa para CRUD ate ~10k registros ativos
- **Limitacao: 1 banco por Workers binding (sem cross-db queries)**

### KV (free)
- 100k reads/dia
- 1k writes/dia (BAIXO — atencao)
- 1GB total
- Eventually consistent (~60s replication)
- Boa para feature flags, sessions, cache leve
- **Anti-uso: nao usar como banco transacional**

### R2 (free)
- 10GB storage
- 1M Class A ops/mes (writes/lists)
- 10M Class B ops/mes (reads)
- Sem egress fee (vs S3)
- S3-compatible API
- Boa para uploads de usuario, assets, backups

### Durable Objects (free)
- 1M requests/mes
- 400k GB-seconds/mes
- WebSocket support nativo
- Storage: 50ms reads/writes locais
- Boa para: chat rooms, contadores, locks distribuidos, real-time games
- **Custo invisivel: alarms persistem mesmo se DO esta idle (cobra GB-s)**

## Real-time

### WebSocket via DO (recomendado para descartavel)
- Free 1M ops/mes
- Suporta hibernation (DO desliga e reativa em ~10ms quando WS reconnect)
- Codigo: `state.acceptWebSocket(ws)` + `webSocketMessage(ws, msg)`
- Limite: 32k WS conexoes por DO (mas 1 DO ja basta para MVP)

### Quando NAO usar DO+WS:
- Mais de 10k usuarios simultaneos -> usar Supabase Realtime (Postgres-based, escala melhor)
- Precisa pubsub cross-DO -> adiciona Queues (paid)

## Auth

### Cloudflare Access (free ate 50 users)
- Zero-trust auth, sem codigo
- Login Google/GitHub/email magic link
- Bom para: dashboards internos, ferramentas de time
- **Limite: 50 users free; depois $3/user/mes**

### Sem auth nativa Workers
- Workers nao tem session/cookie mgmt embutido
- Para auth complexa: Supabase Auth ou Auth.js (Lucia)

## Bindings (configuracao em wrangler.toml)

```toml
name = "<projeto>"
compatibility_date = "2026-05-01"

[[d1_databases]]
binding = "DB"
database_name = "<nome>"
database_id = "<uuid>"

[[kv_namespaces]]
binding = "KV"
id = "<uuid>"

[[r2_buckets]]
binding = "R2"
bucket_name = "<nome>"

[[durable_objects.bindings]]
name = "ROOM"
class_name = "ChatRoom"

[[migrations]]
tag = "v1"
new_classes = ["ChatRoom"]
```

## Patterns recomendados

### Pattern A — SPA descartavel (perfil A do ADR)
- Pages serve `index.html` + assets
- Sem Workers, sem DB
- Estado em localStorage
- 0 setup, deploy via `git push`

### Pattern B — App CRUD continuo (perfil B)
- Pages serve front (Vite build)
- Workers em `/api/*` rota
- D1 binding para CRUD
- Auth: Supabase Auth (front-only) OU Cloudflare Access (zero-config)

### Pattern C — Realtime (perfil C)
- Pages serve front
- Workers para REST CRUD
- DO para WebSocket
- D1 para persistencia OU Supabase Postgres
- Cloudflare Tunnel se backend precisa rodar localmente em dev

## Limites para alarmar (gates do ADR)

| Recurso | Limite free | Quando ja preocupar |
|---------|-------------|---------------------|
| Workers reqs | 100k/dia | >50k/dia projetado |
| D1 writes | 100k/dia | CRUD com escrita > 1/s sustentado |
| KV writes | 1k/dia | Qualquer caso de escrita por user-action |
| DO requests | 1M/mes | >100 conexoes WS sustentadas |
| Pages builds | 500/mes | CI commit > 16/dia |

## Ferramentas

- **Wrangler CLI**: `npm i -g wrangler` — deploy, dev local, tail logs
- **Local dev**: `wrangler dev` simula Workers localmente, mas D1 local e separado de remote (`--remote` para usar prod)
- **Logs**: `wrangler tail` (real-time) — gratis ate 5/dia ativos

## Anti-patterns para flagar

- KV como banco principal: 1k writes/dia mata isso rapido.
- D1 com >10 tabelas joinadas em 1 query: D1 nao otimiza JOIN como Postgres.
- DO sem hibernation: deixa 1 conexao WS aberta = cobra GB-s o tempo todo.
- Pages Functions para logica pesada: limite 100k execucoes/dia, mais baixo que Workers (1M paid).
