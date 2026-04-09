# Fase 3 — Gestão + Presença

> **Período:** 05/04 - 03/05
> **Objetivo:** CRUD completo de programas, participantes, negócios, patrocinadores, presença, NPS.

## Backend (Douglas)

### Programas
- [ ] API Programas: CRUD + vincular patrocinadores (N:N)
- [ ] API Participantes: CRUD + import CSV (wizard 3 etapas)
- [ ] API Negócios: CRUD + pipeline de status
- [ ] API Patrocinadores: CRUD + upload logo (Supabase Storage)
- [ ] Máquina de estados de participante (6 status) validada no backend
- [ ] Motor de risco de evasão portado de `riskCalculator.ts`

### Presença
- [ ] API Sessões: CRUD + registro de presença
- [ ] NPS integrado: checkbox "Com NPS" → cria instância de satisfação automaticamente
- [ ] Cálculo automático de `percentualPresenca` e `faltasConsecutivas`
- [ ] Testes API: programas, participantes, sessões, presença

## Frontend (Adriano)

### Gestão
- [ ] ProgramasList — tabela com métricas, filtros, busca, paginação
- [ ] ProgramaDetail — header com badges + tabs (Negócios, Participantes, Oficinas, Pesquisas)
- [ ] ProgramaForm — drawer com campos + MultiSelect patrocinadores
- [ ] ParticipantesList — filtros por status/tags, import CSV
- [ ] ParticipanteForm — drawer com seções (info pessoal, endereço, negócio)
- [ ] ParticipanteDetail — perfil + respostas + risco
- [ ] NegociosList — tabela pipeline
- [ ] PatrocinadoresList — CRUD com logo preview
- [ ] TurmaDetail (via tags)

### Presença
- [ ] PresencaTab — overview por sessão
- [ ] SessaoForm — data + checkbox NPS + select template satisfação

## Critérios de aceite
- Gestor cria programa, vincula patrocinadores, adiciona participantes
- Import CSV funciona (upload → mapeamento → confirmação → participantes criados)
- Presença registrada por sessão, NPS criado automaticamente
- Motor de risco calcula pontuação corretamente
- Cascatas de exclusão funcionam (deletar programa → deleta participantes, instâncias, sessões)

## Referências
- `docs/fractus/sprint-track-backend.md` — S07-S09
- `docs/fractus/sprint-track-frontend.md` — S07-S09
- `docs/fractus/business-rules.md` — regras de gestão e presença
