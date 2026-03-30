---
paths: agents/**, skills/**, playbooks/**, prompts/**
---

# Spec as Contract

**Objetivo:** tratar especificações técnicas como contratos formais entre agentes de planejamento e agentes de implementação — não como documentos descritivos informais.

**Baseado em:**
- `context-a8z/OpenSpec-main (histórico)` (spec-driven development framework)
- `context-a8z/spec-kit-main (histórico)` (GitHub spec-kit toolkit)
- `prompts/02-spec.md` (spec canônica do a8z)

---

## Princípio fundamental

Uma spec NÃO é:
- Um documento explicativo sobre "o que queremos"
- Uma lista de requisitos vagos para serem interpretados
- Algo que o agente executor vai "entender o espírito"

Uma spec É:
- Um contrato: o executor faz EXATAMENTE o que está especificado
- Uma fonte de verdade: em caso de dúvida, a spec ganha
- Um artefato versionável: mudanças na spec = nova versão com motivação documentada

---

## Estrutura de spec como contrato

```
feature-name/
├── proposal.md       # O QUE e POR QUÊ (contexto, motivação, escopo)
├── design.md         # COMO (decisões técnicas, arquitetura, trade-offs)
├── tasks.md          # O QUÊ EXATAMENTE (tarefas acionáveis com critérios)
└── specs/            # Detalhes técnicos (schemas, interfaces, exemplos)
    ├── schema.ts
    ├── api.md
    └── test-cases.md
```

### proposal.md — contrato de escopo

```markdown
# Proposta: [Nome da Feature]

## Contexto
[Por que isso é necessário agora?]

## Escopo
**Incluído:**
- [Item específico A]
- [Item específico B]

**Explicitamente excluído:**
- [Item X — diferir para v2]
- [Item Y — não é responsabilidade desta feature]

## Critério de aceite
- [ ] [Comportamento verificável 1]
- [ ] [Comportamento verificável 2]
```

### tasks.md — contrato de execução

```markdown
# Tasks: [Feature]

## Task 1: [Ação específica]
- **Arquivo**: `src/path/to/file.ts`
- **Ação**: Criar/Modificar/Deletar
- **Implementação**: [Código ou pseudo-código específico]
- **Critério de conclusão**: [Como saber que está feito]
- **Rollback**: [O que desfazer se falhar]

## Task 2: ...
```

---

## Ciclo proposal → apply → archive

O fluxo canônico de spec-driven development no a8z:

```
1. /spec:propose  → Cria proposal.md com escopo e exclusões
2. /spec:design   → Cria design.md com decisões técnicas
3. /spec:tasks    → Cria tasks.md com ações acionáveis
4. /code          → Implementa seguindo tasks.md como contrato
5. /spec:archive  → Move para histórico com link para PR/commit
```

---

## Regras do contrato

### Para o agente que cria a spec (planejador)

1. **Seja específico sobre exclusões**: "O que não está no escopo" é tão importante quanto "o que está"
2. **Critério de aceite verificável**: Cada critério deve ser testável (não "melhorar UX", sim "tempo de carregamento < 200ms")
3. **Decisões bloqueadas vs. abertas**: Marque explicitamente o que é decisão final vs. o que o executor pode decidir
4. **Nunca deixe ambiguidade intencional**: Se não sabe, pesquise antes de escrever a spec

### Para o agente executor (implementador)

1. **A spec ganha**: Se a spec diz "usar X", use X — mesmo que Y pareça melhor
2. **Desvios requerem proposta de mudança**: Para alterar qualquer ponto da spec, crie uma nova proposta antes de implementar diferente
3. **Bloqueios são explícitos**: Se a spec é ambígua ou impossível, bloqueie e solicite clarificação — nunca "interprete livremente"
4. **Sem escopo creep**: Não implemente o que não está na spec, mesmo que pareça óbvio

---

## Anti-patterns

- Spec escrita em post-it após a implementação ("spec retroativa")
- "Fiz melhor do que a spec pedia" sem ter proposto a mudança antes
- Tasks da spec dependendo de interpretação subjetiva ("implementar de forma limpa")
- Spec sem critério de aceite verificável
- Executor ignorando exclusões explícitas da spec

---

## Integração com outros artefatos

- Para workflow completo: `playbooks/spec-first-workflow.md`
- Para implementação: `prompts/04-code.md`
- Para revisão: `prompts/05-reviews.md`
- Para tasks acionáveis: `prompts/03-tasks.md`
