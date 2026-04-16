---
name: weekly-update
description: >
  Gera resumo das tasks concluidas nos ultimos 10 dias no ClickUp, humaniza o texto
  em pt-BR e posta como resposta na thread "Conversa semanal" do Slack (#cspo-tech).
  Requer aprovacao do usuario antes do envio.
description_pt-BR: >
  Resumo semanal das tasks concluidas, humanizado com anti-AI patterns,
  com aprovacao antes de postar na Conversa semanal do Slack.
argument-hint: "[link da mensagem 'Conversa semanal' no Slack (opcional)]"
type: prompt
version: "1.1.0"
env:
  - WEEKLY_UPDATE
  - SLACK_WEBHOOK_CSPO_TECH
categories: [reporting, slack, clickup, weekly]
allowedTools:
  - Read
  - Glob
  - Grep
  - Bash
  - AskUserQuestion
  - mcp__clickup__clickup_filter_tasks
  - mcp__clickup__clickup_get_task
sourceDocs:
  - skills/humanizer/SKILL.md
  - libraries/content/ai-writing-patterns.md
use-when:
  - gerar update semanal das tasks concluidas
  - postar resumo na conversa semanal do Slack
  - weekly update
  - resumo semanal
  - conversa semanal
do-not-use-for:
  - sprint planning (use /sprint-planner)
  - relatorio detalhado de sprint (use sprint-summary no slack-notify)
  - daily standup
metadata:
  category: reporting
  version: "1.1.0"
---

# weekly-update

Voce esta executando a skill `weekly-update`.

## Task

$ARGUMENTS

Se nenhum argumento foi fornecido, executar o fluxo completo abaixo.

---

## Phase 0 — Pre-flight check (OBRIGATÓRIO)

Antes de qualquer coisa, verificar dois gates:

### Gate 1 — Toggle habilitado

```bash
echo "${WEEKLY_UPDATE:-FALSE}"
```

Se o valor for `FALSE`, vazio ou não existir:

> **Skill desabilitado neste projeto.**
> Para habilitar, defina `WEEKLY_UPDATE=TRUE` no `.env` do projeto.

**REGRA: Encerrar imediatamente sem mensagem de erro. Ignorar silenciosamente a invocação.**

### Gate 2 — Variáveis de integração

Só executar se Gate 1 passou. Verificar:

```bash
echo "${SLACK_WEBHOOK_CSPO_TECH:=__MISSING__}" | head -c 10
```

Se o valor retornado for `__MISSING__` ou vazio:

> **Skill habilitado mas sem configuração.**
> A variável `SLACK_WEBHOOK_CSPO_TECH` não está configurada no `.env`.
> Para completar a configuração, adicione `SLACK_WEBHOOK_CSPO_TECH=https://hooks.slack.com/...` ao `.env` do projeto.

**REGRA: Encerrar imediatamente. Não prosseguir para Phase 1.**

Se ambos os gates passarem, prosseguir normalmente.

---

## Phase 1 — Buscar tasks concluidas no ClickUp (ultimos 10 dias)

Calcular timestamp de 10 dias atras:

```
date_done_gt = Date.now() - (10 * 24 * 60 * 60 * 1000)
```

Chamar `mcp__clickup__clickup_filter_tasks` com:
- `list_id`: `901323827420`
- `assignees`: `[112010775]`
- `statuses`: `["complete"]`
- `date_done_gt`: valor calculado acima (em milissegundos Unix)

Para cada task retornada, extrair:
- Nome da task
- Descricao curta (primeiras 2 linhas da description)
- Area/tema (inferir de tags, nome ou descricao: frontend, backend, infra, correcao, dados, etc.)

Se nenhuma task encontrada: informar ao usuario e encerrar.

## Phase 2 — Gerar resumo pt-BR

### Template padrao

O resumo DEVE seguir este template. Secoes marcadas com (?) sao opcionais — incluir somente se houver conteudo relevante.

```
*O que foi feito*
[Narrativa agrupada por tema, tom conversacional]

*Desafios encontrados* (?)
[Dependencias, bloqueios, decisoes dificeis]

*Em andamento / na esteira* (?)
[O que esta sendo trabalhado ou vem a seguir]

*Pendencias* (?)
[O que ainda precisa ser feito]

*Ajuda? no que* (?)
[Pedidos de alinhamento, decisao, recurso]
```

### Regras de redacao

- Agrupar entregas por **tema** (nao listar tasks uma a uma)
- Tom: conversacional, direto, como se estivesse contando para um colega nao tecnico
- Foco em **o que foi entregue e por que importa**, nao em nomes de tasks ou IDs
- Sem jargao tecnico (trocar "API endpoint" por "integracao", "migration" por "ajuste no banco", etc.)
- Sem emojis
- Os titulos das secoes usam negrito Slack: `*titulo*`

Exemplo de tom desejado:
> Nessa semana finalizei a integração do formulário de coleta com validação dos campos obrigatórios, ajustei o layout da tela de dashboard pra funcionar melhor em tablets, e corrigi um problema no fluxo de login que impedia usuários com email corporativo de acessar o sistema.

## Phase 3 — Humanizar

### Passo 0 — Correção ortográfica (OBRIGATÓRIO, não pular)

ANTES de qualquer outra etapa, revisar o texto inteiro:
- Aplicar TODOS os acentos em pt-BR (não, é, há, também, já, através, será, conclusão, validação, presença, diagnóstico, próxima, além, negócio, código, está, padrões, integração, etc.)
- Revisar concordância verbal e nominal
- Revisar crase (à, às)
- Revisar uso de travessão (—) vs hífen (-): travessão para apartes e pausas, hífen apenas em palavras compostas
- Este passo é PRÉ-REQUISITO. O texto DEVE estar ortograficamente correto antes de entrar no pipeline de padrões AI.

### Passo 1 — Identificar padrões

REGRA: Carregar `.gos/libraries/content/ai-writing-patterns.md` e aplicar scan completo. Se o catálogo não for carregado, a Phase 3 NÃO está completa.

Padrões mínimos a verificar: P01, P03, P04, P07, P10, P15, P17, P19, P22.

Carregar e aplicar:
1. `.gos/libraries/content/ai-writing-patterns.md` — catálogo de 26 padrões
2. `.gos/skills/humanizer/SKILL.md` — processo de 5 passos

Calibração: **Relatório executivo** (intensidade média)
- Cortar enchimento e inflação
- Manter formalidade leve
- Não forçar primeira pessoa se não couber

Processo:
1. Identificar padrões presentes no resumo (especialmente P01, P03, P04, P07, P10, P15, P17, P19, P22)
2. Primeira reescrita eliminando padrões
3. Auto-crítica: "O que faz este texto parecer gerado por IA?"
4. Soul injection: variar ritmo, adicionar voz quando couber
5. Correção ortográfica final (acentos, concordância) — segunda passada

Score máximo aceitável: 30 (de 0-100). Se > 30, revisar novamente.

## Phase 4 — Aprovação do usuário (GATE OBRIGATÓRIO)

Apresentar ao usuário:
1. Lista de tasks encontradas (nomes, para referência)
2. Texto final humanizado
3. Score de padrões AI (se calculado)

### Checklist antes de aprovar

Verificar e apresentar junto com o texto:
- [ ] Acentuação correta em todo o texto (não, é, há, também, além, etc.)
- [ ] Sem uso de hífen (-) onde deveria ser travessão (—)
- [ ] Assinatura do autor presente no final
- [ ] Catálogo ai-writing-patterns.md foi carregado e aplicado

Perguntar com AskUserQuestion:
- **"Aprovar e enviar"** — prosseguir para Phase 5
- **"Editar"** — usuário indica ajustes, voltar para Phase 3
- **"Cancelar"** — encerrar sem envio

**REGRA: Nunca enviar ao Slack sem aprovação explícita.**

## Phase 5 — Resolver thread_ts do Slack

Se `$ARGUMENTS` contém um link do Slack:
- Formato esperado: `https://TEAM.slack.com/archives/CHANNEL/pTIMESTAMP`
- Extrair timestamp: remover o `p` do início e inserir `.` antes dos últimos 6 dígitos
- Exemplo: `p1712345678901234` → `1712345678.901234`

Se não fornecido:
- Pedir ao usuário via AskUserQuestion: "Cole o link da mensagem 'Conversa semanal' mais recente no Slack (clique direito na mensagem → Copiar link)"
- Se usuário não tiver o link: postar como mensagem nova no canal (sem thread_ts)

## Phase 6 — Postar no Slack

### Assinatura do autor

Antes de montar o payload, adicionar ao final do texto:

```
\n\n— AUTHOR_NAME
```

Onde AUTHOR_NAME = resultado de `git config user.name` (executar via Bash).
Fallback: usar "Douglas Oliveira" (ClickUp user 112010775).

### Envio

**IMPORTANTE:** Usar `SLACK_WEBHOOK_CSPO_TECH` (não `SLACK_WEBHOOK_URL`) para postar no canal `#cspo-tech`.

Executar via Bash:

```bash
SLACK_WEBHOOK_URL="$SLACK_WEBHOOK_CSPO_TECH" node .gos/scripts/tools/slack-notify.js send --text "TEXTO_APROVADO" --thread-ts "TIMESTAMP"
```

Se não houver thread_ts:

```bash
SLACK_WEBHOOK_URL="$SLACK_WEBHOOK_CSPO_TECH" node .gos/scripts/tools/slack-notify.js send --text "TEXTO_APROVADO"
```

Verificar resposta:
- `{ "sent": true }` → sucesso, informar usuário
- `{ "sent": false }` → reportar erro ao usuário

## Referência rápida

| Dado | Valor |
|------|-------|
| ClickUp List ID | `901323827420` |
| ClickUp User ID (Douglas) | `112010775` |
| Período | Últimos 10 dias |
| Slack canal | `#cspo-tech` |
| Webhook env var | `SLACK_WEBHOOK_CSPO_TECH` |
| Calibração humanizer | Relatório executivo (média) |
| Score máximo AI | 30 |
| Template | *O que foi feito* / *Desafios* / *Em andamento* / *Pendências* / *Ajuda?* |
| Ortografia | OBRIGATÓRIA — acentos pt-BR, crase, travessão |
| Assinatura | `— {git config user.name}` no final |
