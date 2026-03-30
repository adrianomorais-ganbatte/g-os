# Squad Pipeline Runner Playbook

**Purpose:** Executar pipelines de squad sequencialmente, gerenciando estado, outputs e quality gates entre steps.

**When to Use:** Executando uma squad via `squads:run` ou manualmente seguindo um `pipeline.yaml`.

---

## Visao Geral

Uma squad e um conjunto de agentes organizados em um pipeline sequencial. Cada step executa um agente com inputs definidos e produz outputs que alimentam o proximo step.

```
[Step 1: Pesquisa] → [Step 2: Copy] → [Step 3: Review] → [Step 4: Imagem] → [Step 5: Publicacao]
```

---

## Estrutura do Pipeline

### pipeline.yaml

```yaml
squad: linkedin-content
version: "1.0"
description: "Pipeline para criacao de posts LinkedIn"

defaults:
  model_tier: sonnet
  output_dir: output/

steps:
  - name: pesquisar
    agent: pesquisador
    type: subagent
    input: data/brief.md
    output: data/pesquisa.md
    model_tier: haiku

  - name: gerar-copy
    agent: copywriter
    type: subagent
    input: data/pesquisa.md
    output: data/copy.md
    model_tier: sonnet
    veto_conditions:
      - "Caption entre 500 e 2200 caracteres"
      - "Pelo menos 1 CTA explicito"
      - "3 a 8 hashtags"

  - name: revisar
    agent: revisor
    type: subagent
    input: data/copy.md
    output: data/review.md
    on_reject: gerar-copy
    model_tier: sonnet

  - name: criar-imagem
    agent: designer
    type: subagent
    input: data/copy.md
    output: output/slides/
    model_tier: sonnet

  - name: publicar
    agent: publisher
    type: checkpoint
    input:
      - data/copy.md
      - output/slides/
    output: output/publish-result.json
```

### Tipos de step

| Tipo | Comportamento |
|------|--------------|
| `subagent` | Despacha agente autonomo. Espera conclusao. Coleta output. |
| `inline` | Executa no contexto atual (sem subagente). Util para transformacoes simples. |
| `checkpoint` | Pausa e pede confirmacao do usuario antes de prosseguir. Obrigatorio antes de publicacao. |

---

## Workflow de Execucao

### Fase 1: Inicializacao

1. Validar que `pipeline.yaml` existe e e valido
2. Gerar `run_id` unico (formato: `YYYYMMDD-HHMMSS-randomhex`)
3. Criar `state.json` com status inicial:
   ```json
   {
     "run_id": "20260313-143000-a1b2c3",
     "squad": "linkedin-content",
     "status": "running",
     "current_step": 0,
     "steps": [
       { "name": "pesquisar", "status": "pending" },
       { "name": "gerar-copy", "status": "pending" },
       { "name": "revisar", "status": "pending" },
       { "name": "criar-imagem", "status": "pending" },
       { "name": "publicar", "status": "pending" }
     ],
     "started_at": "2026-03-13T14:30:00Z"
   }
   ```
4. Resolver paths de input/output relativos ao diretorio da squad

### Fase 2: Execucao sequencial

Para cada step no pipeline:

1. **Pre-check**: Verificar que o input existe
2. **Carregar agente**: Ler o agent profile do step
3. **Montar contexto**: Combinar agent profile + input + libraries relevantes
4. **Executar**:
   - `subagent`: Despachar via Agent tool com prompt montado
   - `inline`: Executar diretamente no contexto atual
   - `checkpoint`: Apresentar preview ao usuario e aguardar confirmacao
5. **Coletar output**: Salvar no path definido
6. **Avaliar veto conditions** (se definidas — ver `rules/veto-conditions.md`):
   - Todas passam: prosseguir
   - Alguma falha: re-executar (max 2x), depois escalar
7. **Atualizar state.json**: Marcar step como `completed` ou `failed`

### Fase 3: Review loops

Quando um step de review emite `REJECT`:

1. Verificar campo `on_reject` do step
2. Se definido: voltar ao step indicado e re-executar com o feedback do review
3. Se nao definido: escalar ao usuario
4. Max 3 ciclos de revisao no mesmo step (depois escalar)

### Fase 4: Finalizacao

1. Atualizar `state.json` com status final (`completed` | `failed` | `cancelled`)
2. Registrar `finished_at` e duracao
3. Copiar outputs finais para `output/{run_id}/`
4. Apresentar resumo ao usuario:
   ```
   SQUAD RUN COMPLETE
   Squad: linkedin-content
   Run ID: 20260313-143000-a1b2c3
   Steps: 5/5 completed
   Duration: 4m 32s
   Outputs:
     - data/copy.md (1,847 chars)
     - output/slides/ (7 images)
     - output/publish-result.json
   ```

---

## State Management

O `state.json` e a fonte de verdade do estado da execucao. Permite:

- **Retomada**: Se o pipeline for interrompido, pode ser retomado do ultimo step concluido
- **Auditoria**: Historico completo de execucao com timestamps
- **Debugging**: Identificar qual step falhou e por que

### Status por step

| Status | Significado |
|--------|------------|
| `pending` | Ainda nao executado |
| `running` | Em execucao |
| `completed` | Concluido com sucesso |
| `failed` | Falhou (apos retries e escalacao) |
| `skipped` | Pulado pelo usuario |
| `retrying` | Re-executando apos veto condition |

---

## Regras Criticas

1. **Nunca pular checkpoint antes de publicacao.** Steps do tipo `checkpoint` sao obrigatorios. O usuario deve confirmar antes de qualquer acao irreversivel.
2. **Nunca executar steps em paralelo.** O pipeline e sequencial por design. Cada step depende do output do anterior.
3. **Sempre salvar state.json apos cada step.** Se o processo for interrompido, o estado deve refletir o ultimo step concluido.
4. **Respeitar model_tier do step.** Se o step define `model_tier: haiku`, usar haiku. Nao fazer upgrade automatico (exceto em re-execucao por veto condition).
5. **Inputs devem existir.** Se o input de um step nao existe, falhar imediatamente em vez de tentar executar sem contexto.
6. **Outputs sao imutaveis por run.** Cada execucao gera outputs em `output/{run_id}/`. Nao sobrescrever runs anteriores.

---

## Troubleshooting

| Problema | Causa provavel | Solucao |
|----------|---------------|---------|
| Step falha sem mensagem | Input nao existe | Verificar output do step anterior |
| Loop infinito de review | `on_reject` aponta para step errado | Verificar `on_reject` no pipeline.yaml |
| Veto condition sempre falha | Condicao impossivel ou modelo inadequado | Revisar condicoes ou usar model_tier superior |
| State.json corrompido | Interrupcao durante escrita | Deletar state.json e re-executar do inicio |
| Checkpoint nao aparece | Step nao e tipo `checkpoint` | Mudar type para `checkpoint` |
