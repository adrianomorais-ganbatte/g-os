---
name: weekly-update
description: >
  Gera resumo das tasks concluidas nos ultimos 10 dias no ClickUp, humaniza o texto
  em pt-BR e posta como resposta na thread "Conversa semanal" do Slack (#cspo-tech).
  Suporta dois modos: simple (curto, ~150 palavras) e detailed (completo, ~400 palavras).
  Requer aprovacao do usuario antes do envio.
description_pt-BR: >
  Resumo semanal das tasks concluidas, humanizado com anti-AI patterns,
  com aprovacao antes de postar na Conversa semanal do Slack. Modo simple ou detailed.
argument-hint: "[--mode simple|detailed] [link da mensagem 'Conversa semanal' no Slack]"
type: prompt
version: "1.2.1"
env:
  - WEEKLY_UPDATE
  - WEEKLY_UPDATE_MODE
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

### Gate 3 — Resolver modo de escrita

Determinar `MODE` nesta ordem de precedência:

1. **`$ARGUMENTS`** (maior prioridade):
   - Contém `--mode simple` → `MODE=simple`
   - Contém `--mode detailed` → `MODE=detailed`
2. **Variável de ambiente `WEEKLY_UPDATE_MODE`** (default do projeto):
   ```bash
   echo "${WEEKLY_UPDATE_MODE:-}"
   ```
   - Valor `simple` → `MODE=simple`
   - Valor `detailed` → `MODE=detailed`
   - Vazio ou qualquer outro valor → cair para passo 3
3. **Fallback final**: `MODE=detailed`.

**Não perguntar ao usuário.** O padrão fica no `.env` (recomendado: `WEEKLY_UPDATE_MODE=simple` alinhado ao pedido da PO/PM na thread "Conversa semanal"). Só sobrescrever via argumento quando precisar de um envio técnico pontual.

Informar ao usuário o modo resolvido no início da Phase 2 (ex: "Modo resolvido: `simple` (via env)").

**Contexto histórico (por que existem dois modos):** a PO (não-técnica) e o PM (não-técnico) na thread "Conversa semanal" pediram explicitamente "resumo em linguagem não técnica" e "pensa que está em uma reunião com a gente, o que você compartilharia?". O modo `simple` foi desenhado para atender esse pedido. O `detailed` segue para audiência técnica (tech lead, outros devs).

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

O template e as regras variam por `MODE`. Secoes marcadas com (?) sao opcionais — incluir somente se houver conteudo relevante.

### Template (comum aos dois modos)

```
*O que foi feito*
[Conteudo conforme regras do modo]

*Desafios encontrados* (?)
[Dependencias, bloqueios, decisoes dificeis]

*Em andamento / na esteira* (?)
[O que esta sendo trabalhado ou vem a seguir]

*Pendencias* (?)
[O que ainda precisa ser feito]

*Ajuda? no que* (?)
[Pedidos de alinhamento, decisao, recurso]
```

Regras comuns aos dois modos:
- Sem emojis.
- Titulos de secao em negrito Slack: `*titulo*`.
- Uma linha em branco entre titulo e corpo (Slack renderiza colado sem isso).

---

### Modo `detailed` — Relatório executivo (audiência técnica)

Audiência: tech lead, outros devs, stakeholders técnicos.

Regras:
- Permite referenciar **IDs de task** (T-082, T-110, etc.) quando importa para rastreio.
- Permite **termos técnicos** quando a audiência é técnica (API, FK, hook, TypeScript, deploy, Storybook, webhook).
- Narrativa em **parágrafos** agrupados por tema; bullets só para listas de tasks ou bloqueios.
- Explica **decisões** e **trade-offs** quando houver (por que X e não Y).
- Inclui dependências explícitas ("T-084 depende da T-082 nova").
- Tamanho alvo: 300-500 palavras.

Exemplo de tom (extraído do envio real 2026-04-17):
> *O que foi feito*
>
> A semana concentrou na frente de Storybook e infra de deploy. Criei a conta Vercel pra hospedar o Storybook separado, customizei a home com branding Fractus, corrigi o SPA routing e atualizei o README. Pluguei Vercel Analytics e Speed Insights nos dois apps.

---

### Modo `simple` — Linguagem acessível (audiência não-técnica)

Audiência: PO/PM sem background técnico, clientes, time de negócio.

Regras **obrigatórias** (violar qualquer uma implica reescrever):

1. **Zero IDs de task.** Nunca mencionar "T-084", "T-110", "task X". Só o que foi entregue, em linguagem de valor.
2. **Zero jargão técnico de baixo nível.** Banidos sempre: API, endpoint, FK, foreign key, hook, webhook, migration, pipeline, CI/CD, TypeScript, Zod, regex, SPA routing, commit, branch, merge, PR, rebase, drift, build, deploy. Traduzir cada um:
   - "API de diagnóstico" → "formulário de diagnóstico" ou "ferramenta pra coletar dados do diagnóstico"
   - "Deploy no Vercel" → "publicar a página online" ou "colocar online"
   - "Corrigi o SPA routing" → "arrumei a navegação entre telas que estava quebrada"
   - "Hook de pre-commit" → "trava automática que impede erros de passar adiante"
   - "Migration" → "ajuste no banco de dados" (quando inevitável) ou omitir
   - "Regras de negócio em doc próprio" → "organizei as regras do produto num documento pra validar com o time"
3. **Termos contextualmente aceitos** (use com moderação — só quando a audiência já conhece do produto):
   - `PRD` — PO/PM usam o termo.
   - `front`/`backend` — aceitáveis quando já é linguagem corrente do time (ver exemplo do envio 2026-04-20).
   - `Storybook` — aceitável se é nome de produto/catálogo conhecido; caso contrário, traduzir pra "catálogo de componentes".
   - Se na dúvida, traduzir. Regra: PO/PM deve entender sem parar pra perguntar.
4. **Linhas curtas, sem bullet markers obrigatórios.** Cada linha com 1 frase, no máximo 2. Slack renderiza quebras de linha limpas sem `•` — preferível ao marcador visual. O PM do time usa `•` em algumas mensagens e não em outras; siga o padrão do autor do envio (default: sem marcador, só quebra de linha).
5. **Voz ativa primeira pessoa.** Preferir "Criei e enviei pra X" sobre "Foi entregue pra X". Preferir "Arrumei" sobre "Foram feitos ajustes".
6. **Foco no valor entregue**, não em como foi feito. Em vez de "configurei X e corrigi Y", usar "agora Z funciona / está disponível / está mais rápido".
7. **Tom reunião casual, mas não forçado.** Primeira pessoa (eu/a gente). Contrações permitidas (`pra`, `tá`, `tô`) mas não obrigatórias — mistura com forma neutra (`para`, `está`, `estou`) é natural e foi validado no envio 2026-04-20. Evitar formalismo corporativo ("foi realizada a entrega de...").
8. Tamanho alvo: 200-350 palavras. Preferência por completude (cobrir todas as entregas e pendências) sobre concisão extrema.

Teste de validação (aplicar mentalmente antes de aprovar):
- Se minha mãe lesse esse texto, ela entenderia o que eu fiz essa semana? Se não, reescrever.
- Se o PO leu e vai perguntar "o que é X?" — termo X é jargão, trocar.
- Dupla checagem: se PO/PM usam o termo em mensagens próprias na thread, pode manter (ex: PRD).

Exemplo canônico — envio validado 2026-04-20 (ver `.gos/weekly-updates/2026-04-20.md` para versão completa):

> *O que foi feito*
>
> Coloquei online o catálogo de componentes do Fractus com a cara nova — logo, cores e a home personalizada. Já plugado nos medidores de desempenho pra gente acompanhar se a página tá rápida.
> A branch desse catálogo tava bagunçada, arrumei e montei uma trava automática pra não deixar entrar mistura errada de novo.
> Liguei travas antes de subir código pra evitar que erro passe adiante — quem tentar subir coisa quebrada é avisado na hora.
> Organizei as regras do produto num documento, usando para validarmos as regras no desenvolvimento do front/backend.
> Criei e enviei para Adriano Morais uma ferramenta que extrai contatos de grupo do WhatsApp.
> No nosso framework interno, parei de mandar notificação duplicada no Slack e arrumei a conexão com o ClickUp na IDE nova que eu estou testando.

Padrões a notar nesse envio:
- Sem marcadores `•`, só quebra de linha entre itens.
- Mistura `pra/tá` com `para/está` naturalmente.
- `front/backend` aceito porque é linguagem já corrente do time.
- Voz ativa primeira pessoa em todos os itens (`Coloquei`, `Arrumei`, `Liguei`, `Criei e enviei`).
- Comprimento total ~310 palavras (acima do mínimo ajustado de 200-350).

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

Calibração varia por `MODE`:

- **`detailed`** — **Relatório executivo** (intensidade média)
  - Cortar enchimento e inflação
  - Manter formalidade leve
  - Não forçar primeira pessoa se não couber

- **`simple`** — **Conversacional casual** (intensidade alta)
  - Primeira pessoa obrigatória (eu/a gente)
  - Contrações permitidas e encorajadas (pra, to, tá, né)
  - Cortar qualquer palavra que soe de relatório corporativo
  - Após a passagem de humanização, validar também a regra de zero jargão técnico (Phase 2, regra 2) — se qualquer termo banido reaparecer, reescrever

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
- [ ] Modo de escrita confirmado (`simple` ou `detailed`)
- [ ] Acentuação correta em todo o texto (não, é, há, também, além, etc.)
- [ ] Sem uso de hífen (-) onde deveria ser travessão (—)
- [ ] Assinatura do autor presente no final
- [ ] Catálogo ai-writing-patterns.md foi carregado e aplicado
- [ ] Se `MODE=simple`: nenhum termo banido apareceu (API, endpoint, FK, hook, deploy, migration, TypeScript, SPA, commit, branch, PR, merge, build, etc.)
- [ ] Se `MODE=simple`: nenhum ID de task (T-XXX) no texto

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
| Calibração humanizer | `detailed`: Relatório executivo (média) · `simple`: Conversacional (alta) |
| Score máximo AI | 30 |
| Template | *O que foi feito* / *Desafios* / *Em andamento* / *Pendências* / *Ajuda?* |
| Modos | `--mode simple` (leigos, sem jargão) · `--mode detailed` (técnicos) |
| Default (env) | `WEEKLY_UPDATE_MODE=simple` no `.env`; fallback se ausente: `detailed` |
| Ortografia | OBRIGATÓRIA — acentos pt-BR, crase, travessão |
| Assinatura | `— {git config user.name}` no final |
