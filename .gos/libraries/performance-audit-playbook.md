# Performance Audit Playbook (G-OS)

Catálogo de otimizações para código de desenvolvimento (React/Next.js frontend + backend Supabase / Cloudflare D1/Workers). Usado por `perf-review` e pelo fechamento de `validate-plan`. Foco em ganhos algorítmicos e arquiteturais, não micro-otimização.

## Regras de manejo

- Finding só com evidência (`file:line`) + impacto concreto ("cada render da lista dispara 1+N queries") + correção. "Provavelmente lento" não é finding.
- Índice/materialização "por suspeita" precisa de evidência de schema/query antes de afirmar.
- Findings viram tasks de correção e entram no loop do pipeline.

## Categorias

### 1. N+1 e complexidade
- Query/fetch por item dentro de loop ou por linha de lista renderizada → batch / `in (...)` / dataloader.
- Varreduras aninhadas na mesma coleção; `find`/`filter` repetido em hot loop onde cabe `Map`.

### 2. Cache estratégico
- Computações/fetches caros idênticos repetidos por request/render → memoização no boundary certo.
- Sem cache HTTP / data-layer em dado estável. **Cloudflare**: Cache API / KV para dado quente; `cache-control` correto. **Supabase**: cache no edge / revalidação.
- **Next.js**: `revalidate`, `cache: 'force-cache'`, React Query/SWR staleTime para dado estável; evitar refetch desnecessário.

### 3. Trabalho fora do caminho crítico (item 4)
- Serviço/função que NÃO precisa ser realtime rodando síncrono no request → mover para **fila** (Cloudflare Queues / Supabase pg-boss/pgmq) e processar em background.
- Tarefas periódicas → **cron** (Cloudflare Cron Triggers / Supabase `pg_cron`).
- Envio de email, geração de relatório, webhooks, agregações pesadas: background, não no caminho do usuário.

### 4. Banco de dados (Supabase Postgres / Cloudflare D1)
- **Índices**: padrões de query (filtro por coluna, join, order by) sem índice de suporte → flag com evidência do schema.
- **Views / materialized views**: agregação cara repetida → materialized view + refresh agendado (cron). View para encapsular join complexo recorrente.
- **Paginação obrigatória**: lista sem limite → `limit`/`offset` ou keyset pagination. Consumo **mediante filtro/search** (não trazer tudo e filtrar no client).
- **Over-fetch**: `select *` / objeto inteiro onde IDs bastam; colunas não usadas; JSON grande enviado ao client.
- Query pesada em request quente → materializar / cachear / paginar.
- **D1**: batch de statements; evitar round-trips múltiplos; usar prepared statements reusados.

### 5. Frontend (React/Next.js)
- Bundle: dependência pesada para uso trivial; falta de code-splitting em rota rara; imagens/fontes não otimizadas.
- Render waterfalls; fetch no client para dado disponível no render (mover para server component / server-side).
- Memoização ausente em boundary claro; re-render em cascata.
- Deferir para as guidelines do projeto (react-best-practices) quando houver.

### 6. Build/CI
- CI lento por falta de cache; passos redundantes; suíte que poderia paralelizar.

## Formato do finding

```markdown
### [PERF-NN] Título imperativo curto
- **Evidência**: `path/file.ts:142` — o padrão concreto.
- **Impacto**: custo pago ("cada listagem: 1+N queries", "500KB de JSON por request").
- **Esforço**: S | M | L (para a correção).
- **Correção**: técnica específica (batch, cache, fila, índice, view, paginação).
```

Ordenar por leverage (impacto ÷ esforço). Findings de alto impacto viram task antes de fechar o plano.
