# ADR-009: Tags flexíveis ao invés de entidade Turma

**Status:** Aceita
**Data:** 2026-03-08
**Decisores:** Time Fractus

## Contexto

O protótipo original tinha uma entidade `Turma` como agrupamento de participantes. Durante a análise de requisitos, identificou-se que "turma" é apenas um dos vários critérios de segmentação usados pelos gestores (turma, negócio, grupo, cohort).

## Decisão

Substituir a entidade `Turma` por **tags flexíveis** no nível de participante. Cada tag tem `tipo` (turma, negocio, grupo, cohort, outro) e `valor`.

## Schema

```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL,        -- turma | negocio | grupo | cohort | outro
  valor TEXT NOT NULL,
  participante_id UUID NOT NULL REFERENCES participantes(id) ON DELETE CASCADE,
  CONSTRAINT idx_tags_tipo_valor UNIQUE (tipo, valor, participante_id)
);
CREATE INDEX idx_tags_participante ON tags(participante_id);
CREATE INDEX idx_tags_tipo_valor ON tags(tipo, valor);
```

## Comportamento de filtro

- Filtro por tags usa lógica **AND**: participante deve ter TODAS as tags selecionadas
- Instâncias podem ter `tagsFiltro` para limitar quais participantes veem o formulário
- Sessões podem ter `tagsFiltro` para filtrar participantes na lista de presença

## Consequências

### Positivas
- Flexibilidade total — gestor cria segmentações sem alterar o schema
- Novas categorias de agrupamento não exigem migrations
- Filtros combinados (turma + cohort) são naturais

### Negativas
- Sem entidade estrutural — não tem CRUD de "turma" com metadata própria
- Tipagem do campo `tipo` é string (não enum SQL) — validação via Zod

### Riscos
- Proliferação de tags inconsistentes → mitigar com sugestão de autocomplete (tags existentes)

## Referências
- `docs/prompts/start-projeto.md` seção "Relacionamentos de dados"
- `docs/fractus/spec-desenvolvimento.md` model Tag
