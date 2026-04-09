# ADR-006: Priorização Backend → Components → Frontend

**Status:** Aceita
**Data:** 2026-03-15
**Decisores:** Time Fractus

## Contexto

Com 2 devs (FE + BE) e ~9 semanas para o MVP, a ordem de execução das fases impacta diretamente a velocidade de integração e a quantidade de retrabalho.

## Decisão

Priorizar **Backend/API primeiro**, depois **Components/Storybook**, depois **Frontend liberado**.

```
Fase 1: Schema SQL + Migrations + Seed + RLS Policies
Fase 2: 40+ Route Handlers + Validações Zod + Testes API
Fase 3: 34 Primitivos shadcn/ui + 12 Compostos + Storybook
Fase 4: Componentes de domínio + Pages + Auth + Middleware
Fase 5: QA + Testes E2E + Deploy Vercel
```

## Alternativas consideradas

| Alternativa | Prós | Contras |
|-------------|------|---------|
| Frontend-first com mocks | FE avança independente, feedback visual rápido | Retrabalho ao integrar com API real, mocks divergem do contrato |
| **Backend-first** | API real desde o início, contratos definidos, sem mocks | FE depende do BE para começar pages (mitigado com Storybook) |
| Fullstack vertical (feature por feature) | Integração contínua | Requer sync constante entre FE/BE, complexo com 2 devs |

## Consequências

### Positivas
- Frontend consome API real desde o início — sem mocks, sem divergência
- Storybook documenta componentes antes de montar páginas — dev FE tem building blocks prontos
- Validações Zod definidas no backend são compartilhadas com o frontend (mesmos schemas)
- Testes de API garantem que contratos estão estáveis antes do FE integrar

### Negativas
- FE "bloqueado" nas primeiras 2 semanas — mitigado com trabalho em primitivos/Storybook
- Se API mudar depois, FE precisa adaptar — mitigado com contratos Zod estáveis

## Referências
- `docs/prompts/start-projeto.md` seção "Ordem de construção"
- `docs/fractus/sprint-track-backend.md`
- `docs/fractus/sprint-track-frontend.md`
