# 🧰 Best Practices

**Slug:** `bestPractices`
**Missão:** reduzir dívida técnica e padronizar.
**Referência:** `.G-OS/rules/react-architecture.md` para padrões de arquitetura frontend.

## Focos

### Código
- DRY/KISS/SOLID; remover dead code.
- TS estrito; tipos nos boundaries (API, hooks/composables, services).
- Testes úteis (unit/integration/e2e).

### Arquitetura Frontend (React / Next.js / Vue)
- **Feature-based structure**: cada feature auto-contida em `features/{name}/`.
- **Service layer obrigatório**: Component → Hook → Service → API. Nunca chamar API direto no componente.
- **Separação apresentação/lógica**: componentes puros (UI) vs containers (dados). Split quando > 150 linhas.
- **Estado no lugar certo**: useState para UI local, TanStack Query/VueQuery para server data, Zustand/Pinia só para global real (auth, theme).
- **Sem prop drilling > 2 níveis**: extrair para hook/composable ou context.
- **Error boundaries em camadas**: App → Feature → Component.
- **Lazy loading**: `React.lazy()` / `dynamic()` / vue async components para rotas.
- **Loading + error states**: toda operação async DEVE ter feedback visual.

### Hooks / Composables
- Hooks bem usados (memo/useCallback/useMemo quando útil, não por padrão).
- Composables retornam `computed()` refs, não raw refs.
- Query keys organizadas por feature: `['feature', 'action', params]`.

### Performance
- Code splitting por rota (mínimo); lazy loading com Suspense em todo componente de rota.
- Virtualizar listas com >50 items (react-window, react-virtuoso, @tanstack/virtual).
- `React.memo` / `computed()` apenas quando profiling indica problema.
- Images otimizadas (next/image, lazy loading, srcset).

### Web Performance Targets
- Core Web Vitals: LCP <2.5s, TTI <3.8s, CLS <0.1.
- Bundle target: <200KB gzip por rota (JS).
- Error boundaries obrigatórios em todo componente de rota — crash de um módulo não derruba o app.

### Qualidade
- A11y: foco, aria, contraste, navegação por teclado.
- Tratamento de erros previsível (ErrorBoundary + toasts).
- Responsividade testada (desktop + mobile).

## Procedimento
1) Preflight (Git/SSH + Prompt Geral).
2) Fazer auditoria rápida do repo (estrutura, padrões, testes).
3) Verificar se segue feature-based structure e service layer.
4) Priorizar refactors (P0/P1/P2) com foco em impacto vs esforço.
5) Abrir tasks com DoD, riscos e, quando fizer sentido, plano de migração incremental.

## DoD
- CI verde; lints/format/testing passando.
- Métricas claras: redução de LOC duplicado, queda de bundle, aumento de cobertura.
- Arquitetura: feature-folders, service layer, state hierarchy validados.
