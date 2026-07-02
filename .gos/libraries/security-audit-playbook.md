# Security Audit Playbook (G-OS)

Catálogo de vulnerabilidades conhecidas para auditar código de desenvolvimento (React, Next.js, TypeScript, Node, Deno, Supabase, Cloudflare D1/Workers). Usado por `security-review` e pelo fechamento de `validate-plan`.

## Regras de manejo

- Uma vulnerabilidade só é finding **com evidência**: `file:line` + descrição do padrão + impacto em produção + remediação. "Provavelmente tem XSS em algum lugar" não é finding.
- **NUNCA reproduzir valor de secret.** Referenciar só `file:line` + tipo da credencial; a correção sempre inclui rotação (secret commitado está queimado mesmo após remoção).
- Comportamento by-design (convenção de plataforma, decisão registrada em ADR) não é finding — salvo se a implementação adiciona risco além da convenção. ADR desatualizada vs código É finding (drift).
- Findings viram tasks de correção e entram no loop do `execute-plan` / correção do `validate-plan`.

## Categorias

### 1. Credenciais e secrets
- Chaves/tokens/senhas hardcoded no código ou em `.env` commitado.
- **Supabase**: `service_role` key usada no client (deve ser só server/edge). `anon` key com RLS desligado = acesso total.
- Secrets logados ou persistidos em stores de evento/histórico.
- **Cloudflare**: secrets via `wrangler secret` (não em `wrangler.toml` versionado nem `vars`).
- Remediação: remover, **rotacionar**, mover para secret manager / env server-side.

### 2. Dados cruzando para interpretadores
- **SQL injection**: query montada com string de request (Postgres/D1). Usar parâmetros/prepared statements.
- **Command injection**: shell montado com input.
- **XSS**: `dangerouslySetInnerHTML`, `eval`, `innerHTML` com conteúdo controlado pelo usuário. Sanitizar / usar APIs seguras.
- **Path traversal**: path de arquivo derivado de request.
- **SSRF**: fetch para URL controlada pelo usuário sem allowlist.

### 3. Controle de acesso (o eixo mais crítico em Supabase)
- **RLS**: tabela com dado sensível e RLS **desligado** ou sem policy → qualquer `anon`/`authenticated` lê tudo. Toda tabela exposta via PostgREST precisa de RLS ligado + policy explícita por operação (select/insert/update/delete).
- **Policies frouxas**: `using (true)` em tabela sensível; policy que não checa `auth.uid()` / tenant / ownership (IDOR).
- **Edge Functions (Supabase)**: função sem verificação de JWT/authz server-side; confiar em header do client; `verify_jwt` desligado sem motivo.
- **Next.js**: route handler / server action sem checagem de identidade server-side; autorização só no client; middleware que não cobre a rota.
- **Cloudflare Workers**: endpoint mutável sem auth; falta de checagem de origem.
- **CSRF**: rota que muda estado sem checagem de autenticidade.

### 4. Contratos de entrada
- Boundary de API que confia no body sem validação de schema (usar **Zod** front + back — validação no client não substitui a do server).
- Upload de arquivo sem restrição de tipo/tamanho/armazenamento.
- Mass assignment: atribuição ampla de objeto do request para modelo de persistência.

### 5. Configuração de produção
- CORS amplo (`*`) com credenciais permitidas.
- Headers de segurança ausentes (CSP) em superfícies sensíveis; cookies sem `HttpOnly`/`Secure`/`SameSite`.
- Debug/verbose habilitado em produção; stack trace vazando para o client.
- **Supabase**: bucket de Storage público quando deveria ser privado; policy de Storage ausente.

### 6. Dependências
- Rodar o audit do ecossistema em modo read-only: `npm audit` / `pnpm audit` / `deno info`. Reportar só advisories critical/high que afetam código runtime alcançável.

### 7. Minimização de dados
- PII / dado operacional sensível em logs, em respostas de erro, ou exposto via API.

## Formato do finding

```markdown
### [SEC-NN] Título imperativo curto
- **Evidência**: `path/file.ts:123` — o que está lá (sem reproduzir secret).
- **Impacto**: o que um atacante consegue / o que vaza.
- **Severidade**: CRITICAL | HIGH | MEDIUM | LOW.
- **Remediação**: mudança de código/config + rotação quando aplicável.
```

Ordenar por severidade; CRITICAL/HIGH viram task de correção obrigatória antes de fechar o plano.
