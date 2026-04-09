# ADR-003: Single-tenant com isolamento via RLS

**Status:** Aceita
**Data:** 2026-03-08
**Decisores:** Time Fractus

## Contexto

O Fractus atende organizações que gerenciam programas de formação. A decisão é se o sistema suporta múltiplas organizações no mesmo banco (multi-tenant) ou uma instância por organização (single-tenant).

## Decisão

**Single-tenant** — cada deploy atende uma organização. Isolamento de dados entre perfis (gestor, participante, patrocinador) via **Row Level Security (RLS)** no PostgreSQL/Supabase.

## Modelo de acesso

| Perfil | Visibilidade | Autenticação |
|--------|-------------|--------------|
| **Gestor** | Acesso total a todos os dados da organização | Email + senha |
| **Participante** | Apenas formulários das instâncias em que está vinculado | Magic link |
| **Patrocinador** | Read-only dos programas aos quais está associado | Email + senha |

## RLS Policies (exemplos)

```sql
-- Gestor vê tudo
CREATE POLICY "gestor_full_access" ON programas
  FOR ALL USING (auth.jwt()->>'tipo' = 'gestor');

-- Patrocinador só vê programas associados
CREATE POLICY "patrocinador_programas" ON programas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM programa_patrocinador
      WHERE programa_id = programas.id
      AND patrocinador_id = auth.uid()
    )
  );

-- Participante só vê instâncias publicadas do seu programa
CREATE POLICY "participante_instancias" ON instancias
  FOR SELECT USING (
    status = 'publicado'
    AND programa_id IN (
      SELECT programa_id FROM participantes WHERE id = auth.uid()
    )
  );
```

## Consequências

### Positivas
- Simplicidade do schema — sem `organization_id` em todas as tabelas
- RLS garante isolamento no nível do banco — mesmo que o código da aplicação tenha bugs, o dado não vaza
- Patrocinador A nunca vê dados de programas do Patrocinador B (garantia via banco)

### Negativas
- Se no futuro precisar multi-tenant, requer refactor significativo
- RLS policies adicionam complexidade ao SQL e ao debugging de queries

### Riscos
- Dev pode esquecer de habilitar RLS em nova tabela → mitigar com checklist e testes de RLS

## Referências
- `docs/prompts/start-projeto.md` seção "Contexto Fractus"
- `docs/fractus/business-rules.md` — regras de isolamento de patrocinador
