# ADR-007: Zod como validação compartilhada FE/BE

**Status:** Aceita
**Data:** 2026-03-15
**Decisores:** Time Fractus

## Contexto

Formulários do Fractus exigem validação tanto no cliente (UX) quanto no servidor (segurança). Manter dois conjuntos de validação é propenso a divergências.

## Decisão

Usar **Zod** como fonte única de validação, com schemas definidos em `lib/validations/` e compartilhados entre Frontend (React Hook Form) e Backend (Route Handlers).

## Implementação

```
lib/validations/
├── programa.ts        # createProgramaSchema, updateProgramaSchema
├── participante.ts    # createParticipanteSchema, importCsvSchema
├── template.ts        # createTemplateSchema, campoSchema
├── instancia.ts       # createInstanciaSchema, publicarSchema
├── sessao.ts          # createSessaoSchema
├── resposta.ts        # submitRespostaSchema
└── index.ts           # Re-exports
```

```tsx
// Frontend — React Hook Form
import { createProgramaSchema } from '@/lib/validations/programa';
const form = useForm({ resolver: zodResolver(createProgramaSchema) });

// Backend — Route Handler
import { createProgramaSchema } from '@/lib/validations/programa';
const body = createProgramaSchema.parse(await request.json());
```

## Consequências

### Positivas
- Fonte única de verdade — validação FE e BE sempre sincronizadas
- Tipos TypeScript inferidos automaticamente (`z.infer<typeof schema>`)
- Mensagens de erro customizáveis por campo
- Integração nativa com React Hook Form via `@hookform/resolvers`

### Negativas
- Schemas Zod adicionam código — mas evitam duplicação
- Validações complexas (cross-field, async) exigem `.refine()` / `.superRefine()`

## Regras (RC-01, RC-05)
- Todo Zod schema fica em `lib/validations/` (RC-01)
- Toda mutação passa por validação Zod no servidor (RC-05)
- Componentes UI nunca acessam Supabase direto — usam tipos gerados (RC-03)

## Referências
- `docs/fractus/spec-desenvolvimento.md` seção 2.3 (Regras de consistência)
- `docs/prompts/start-projeto.md` seção "Regras de consistência"
