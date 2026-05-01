# Playbook — Criação de planos por tela

Pipeline determinístico do G-OS para transformar uma tela (Figma, descrição, screenshot) em `{plano + tasks + contexto + entrada-progress}` respeitando a stack-of-record do projeto.

## Quando usar

- Toda nova tela em projeto que consome o G-OS
- Reescrita ou refatoração de tela existente
- Cada tela = 1 plano (subdividido em filhos quando complexa)

## Pré-requisitos do workspace

1. `.gos-local/plan-paths.json` configurado (paths do projeto + `knowledge_sources`)
2. `docs/stack.md` válido e sem drift (gerado por `stack-profiler`)
3. `progress.txt` na raiz (criado automaticamente no primeiro `*plan`)

## Fluxo end-to-end

### 0. Bootstrap (uma vez por workspace)

```
*stack refresh
```

Lê configs do projeto + `knowledge_sources` (Postman, regras-de-negocio, ADRs, design system) e grava `docs/stack.md` + `.gos-local/stack.lock.json`.

Se `plan-paths.json` ausente, a skill cria interativamente.

### 1. Verificar drift antes de planejar

```
*stack drift
```

Se houver drift, decidir entre:
- `*stack refresh` (atualizar stack.md, planos antigos ficam com stack_ref antigo — ok)
- ignorar e prosseguir (apenas se a mudança não afeta a tela)

### 2. Criar plano

```
*plan <tela|figma-url|descrição>
```

`plan-blueprint` executa:
1. Fase 1 — Mapeamento Visual & Componentização
2. Fase 2 — Aderência à Stack (sem redefinir arquitetura)
3. Fase 3 — Plano de Execução

Saídas:
- `<dirs.planos>/PLAN-NNN-<slug>/plan.md`
- `<dirs.planos>/PLAN-NNN-<slug>/context.md`
- `<dirs.planos>/PLAN-NNN-<slug>/tasks/T-NNN-NN-*.md`
- `progress.txt` atualizado com plano ativo

### 3. Revisar e aceitar

Humano revisa:
- componentes mapeados x ausentes
- aderência à stack (especialmente endpoints/regras)
- checklist de aceite

Se aprovado, prosseguir. Caso contrário: ajustar manualmente ou rerodar `*plan` com refinamento.

### 4. Executar tasks

Para cada task, dev (humano ou LLM):

```
*progress status T-NNN-NN em-andamento
```

Implementa, commita localmente (sem push), atualiza:

```
*progress status T-NNN-NN validacao
```

### 5. Validação

Quando todas as tasks do plano estiverem `validacao` e o checklist do plano estiver completo:

```
*progress status PLAN-NNN-<slug> validacao
```

Validação humana + QA. Se aprovado:

```
*progress status PLAN-NNN-<slug> concluido
```

(Status `concluido` SOMENTE após validação. Antes disso, qualquer task/plano fica em `validacao`.)

### 6. Commit & resumo

`devops` skill prepara commit (não pusha). Resumo do que foi feito é gerado a partir das tasks `concluido` desde o último commit.

## Regras invioláveis

1. **Stack como contrato** — toda decisão respeita `stack.md`. Mudança de stack exige ADR e flag `--allow-arch-change`.
2. **Read-only respeitado** — se `stack.md` declara backend read-only, plano nunca propõe migration.
3. **State machine dura** — `concluido` só após validação humana.
4. **Paths via config** — nada hardcoded; tudo de `plan-paths.json`.
5. **`progress.txt` é L1** — denso, otimizado para LLM, sempre atualizado.

## Troubleshooting

| Sintoma | Causa provável | Ação |
|---------|----------------|------|
| `*plan` aborta com "stack.md ausente" | Bootstrap não rodou | `*stack refresh` |
| Drift detectado constantemente | `package.json` muda muito | Aceitar drift e rerunar refresh por sprint |
| Task `concluido` sem passar por `validacao` | Tentativa de bypass | State machine bloqueia — usar `--rollback` se for engano |
| Plano referencia endpoint que não existe | Postman desatualizado | Atualizar coleção, `*stack refresh`, replanejar |

## Skills relacionadas

- `stack-profiler` — produz/mantém `stack.md`
- `plan-blueprint` — cria plano por tela
- `plan-to-tasks` — decompõe plano em tasks (chamada automaticamente)
- `progress-tracker` — gerencia `progress.txt`
- `clickup` — sync opcional para tracking externo (não obrigatório)
