# Analise Comparativa: Figma Make v1.0.1 vs v1.0.2

> **Data:** 03/04/2026
> **Fontes:** `packages/fractus/figma-make/v1.0.1/`, `packages/fractus/figma-make/v1.0.2/`, `packages/fractus/docs/`
> **Objetivo:** Identificar diferencas funcionais, abstrair regras de negocio, comparar com documentacao e atualizar conflitos.

---

## 1. Resumo Executivo

A **v1.0.2 e a versao mais atualizada** do produto. Confirma-se por:
- Nomenclatura consistente com PRD de 02/04/2026 (Projetos, Investidores, Pesquisas)
- Negocio como entidade primaria com CRUD completo e DiagnosticoPage publica
- Campos expandidos para Participante (CPF, endereco, genero, cargo) e Projeto (cargaHoraria, modalidade)
- Drawers com 2 abas (Cadastro + Pesquisas)
- Validacao de email e bloqueio de re-submissao no diagnostico

A v1.0.2 representa uma **reestruturacao fundamental** do produto em relacao a v1.0.1. O impacto na documentacao foi significativo: 8 documentos precisaram de atualizacao, com 3 em nivel critico.

---

## 2. Diferencas entre v1.0.1 e v1.0.2

| Aspecto | v1.0.1 | v1.0.2 |
|---------|--------|--------|
| **Modelo de dados** | Participante como entrada manual | **Negocio como entrada primaria** |
| **Nomenclatura** | Programas, Patrocinadores, Templates | **Projetos, Investidores, Pesquisas** |
| **StatusNegocio** | prospeccao, negociacao, fechado, perdido | **pre_selecionado, selecionado** |
| **StatusParticipante** | pre_sel, sel, ativo, desistente, concluinte | pre_sel, sel, ativo, **inativado**, concluinte |
| **Criacao participante** | Manual pelo gestor | **Automatica via diagnostico do negocio** |
| **Diagnostico** | Inexistente como pagina | **DiagnosticoPage publica com 3 etapas** |
| **Link diagnostico** | N/A | **Unico por projeto** (/diagnostico/:projetoId) |
| **Validacao email** | N/A | **Obrigatoria (email pre-cadastrado)** |
| **Negocio CRUD** | Tag inline no cadastro participante | **CRUD completo com drawer 2 abas** |
| **Campos Participante** | nome, email, telefone, dataNascimento | + **cpf, genero, endereco completo, cargo** |
| **Campos Projeto** | nome, desc, datas, vagas | + **cargaHoraria, modalidade** |
| **Drawer pattern** | Single content | **2 abas: Cadastro + Pesquisas** |
| **Sidebar** | Gestao(Programas\|Patrocinadores) \| Coleta \| Impacto | **Gestao(Projetos\|Investidores) \| Templates \| Impacto** |
| **Tabs do projeto** | Negocio\|Participantes\|Aulas\|Formularios\|Satisfacao | **Negocios\|Participantes\|Aulas\|Pesquisas** |
| **Status transitions** | pre_sel→sel(termo aceite)→ativo(diagnostico) | pre_sel→**sel(diagnostico)**→**ativo(manual)** |
| **Motor de risco** | Presente (riskCalculator.ts) | **Ausente** (nao implementado nesta versao) |
| **Impacto dashboard** | Presente (ImpactoDashboard + PaineisCustomizados) | **Placeholder** ("Resultados" no sidebar) |
| **Presenca modelo** | Dual (presencas + ausencias/denominador) | Simplificado (fracao "8/10") |
| **Participante-Negocio** | N:N (negociosIds[]) | **1:1 (negocioId FK)** |

### Mudancas estruturais detalhadas

#### Negocio: de tag a entidade primaria
- **v1.0.1:** Negocio criado inline como tag durante cadastro de participante. Sem campos proprios alem de nome. Aba de negocios era quase so visualizacao.
- **v1.0.2:** Negocio tem CRUD completo com NovoNegocioDrawer (nome, lider, email, telefone). Drawer de detalhes com 2 abas. Tabela com colunas: nome, lider, status, diagnostico, membros, acoes.

#### Diagnostico: novo fluxo completo
- **v1.0.1:** Nao existe conceito de diagnostico como pagina autonoma.
- **v1.0.2:** DiagnosticoPage publica em `/diagnostico/:projetoId` com:
  - Validacao de email (deve estar pre-cadastrado)
  - 3 paginas de formulario (faturamento, perfil, expectativas)
  - Lista de membros (nome, email, cargo)
  - Bloqueio de re-submissao
  - Criacao automatica de participantes apos envio

#### Status transitions: inversao de gatilhos
- **v1.0.1:** pre_sel → selecionado (via termo de aceite) → ativo (via diagnostico_inicial, automatico)
- **v1.0.2:** pre_sel → selecionado (via diagnostico, automatico) → ativo (via gestor, manual)

---

## 3. Regras de Negocio Abstraidas (v1.0.2)

### Entidades e relacionamentos
- **Projeto** e a unidade organizacional. Tem investidores (N:N), negocios, participantes, aulas, pesquisas.
- **Negocio** e a porta de entrada. Pertence a 1 projeto (FK). Tem lider com nome, email, telefone.
- **Participante** pertence a 1 negocio (FK obrigatoria) e 1 projeto. Nao pode existir sem negocio.
- **Investidor** financia projetos. CRUD simples (nome, descricao).
- **Pesquisa** substitui Formulario. Tipos: diagnostica, satisfacao, meio/final de projeto.
- **Aula/Sessao** pertence a projeto. Tem presenca + NPS opcional.

### Fluxo operacional
1. Gestor cria Projeto (com investidores, modalidade, carga horaria)
2. Gestor pre-cadastra Negocios (nome, lider, email, telefone) → `pre_selecionado`
3. Sistema gera 1 link unico de diagnostico por projeto
4. Lider acessa link, valida email, preenche diagnostico 3 paginas + lista membros
5. Sistema: negocio → `selecionado`, cria participantes automaticamente em `pre_selecionado`
6. Re-submissao bloqueada
7. Participante responde diagnostico individual → `selecionado`
8. Gestor ativa manualmente (apos termo de aceite) → `ativo`

### Status e transicoes

**Negocio:** `pre_selecionado` → `selecionado` (automatico, diagnostico respondido)

**Participante:**
- `pre_selecionado` → `selecionado` (automatico, diagnostico individual)
- `selecionado` → `ativo` (manual, gestor)
- `ativo` → `desistente` | `inativado` | `concluinte` (manual)

**Pesquisa/Formulario:** `rascunho` ↔ `ativo` (toggle)

### Regras de validacao
- Email do lider deve estar pre-cadastrado para responder diagnostico
- Participante com status `pre_selecionado` pode responder diagnostico individual
- Diagnostico so pode ser respondido 1 vez
- Participante nao pode existir sem negocio_id
- Link de diagnostico aparece na pagina geral (nao no drawer)

### Campos de entidade

**Projeto:** nome\*, descricao, dataInicio\*, dataFim\*, vagas\*, inscritos, cargaHoraria, modalidade\* (Presencial/Online/Hibrido), investidores[]

**Negocio:** nome\*, liderNome\*, liderEmail\*, telefone\*, status, diagnosticoRespondido, projetoId\*

**Participante:** nome\*, email\*, telefone\*, cpf\*, dataNascimento\*, genero, endereco completo (cep, endereco, numero, complemento, bairro, cidade, estado), cargo, status, negocioId\*

**Investidor:** nome\*, descricao

---

## 4. Conflitos com a Documentacao e Resolucoes Aplicadas

### Criticos (corrigidos)

| Documento | Conflito | Resolucao |
|-----------|----------|-----------|
| `prd/business-rules.md` | BR-NEG-001: "Negocio e tag no MVP" | Reescrito: Negocio e entidade primaria do MVP |
| `prd/business-rules.md` | BR-NEG-002: "Criado inline via tag-select" | Reescrito: CRUD completo com pre-cadastro manual |
| `prd/business-rules.md` | BR-PRT-003: "selecionado via termo de aceite" | Corrigido: selecionado via diagnostico |
| `prd/business-rules.md` | BR-PRT-004: "ativo via diagnostico_inicial" | Corrigido: ativo via ativacao manual do gestor |
| `prd/business-rules.md` | Fluxo 2: flowchart com transicoes antigas | Reescrito com novo fluxo Negocio→Participante→Ativacao |
| `prd/business-rules.md` | Missing: regras diagnostico, email validation | Adicionada nova secao 7. Diagnostico (BR-DIG-001 a 008) |
| `guides/spec-desenvolvimento.md` | StatusNegocio: prospeccao/negociacao/fechado/perdido | Corrigido: pre_selecionado/selecionado |
| `guides/spec-desenvolvimento.md` | Model Negocio: sem projeto_id, sem campos lider | Reestruturado com todos os campos |
| `guides/spec-desenvolvimento.md` | Model Participante: sem negocio_id direto | Adicionado negocio_id FK + campos expandidos |
| `guides/spec-desenvolvimento.md` | Rotas: /programas, /patrocinadores | Atualizado: /projetos, /investidores, /diagnostico/:id |
| `guides/spec-desenvolvimento.md` | RC-13: "ativo automatico via diagnostico" | Corrigido: ativo manual, selecionado via diagnostico |
| `sprints/clickup-sprints.md` | Campos participante basicos | T-082 expandida com cpf, genero, endereco, cargo |
| `sprints/clickup-sprints.md` | Faltavam tasks FE criticas | Adicionadas T-090, T-091, T-092 |

### Medios (sinalizados)

| Documento | Acao |
|-----------|------|
| `prd/prd-resumo.md` | Adicionado status `desistente` e `inativado`. Campos expandidos (secao 12a). Diagnostico 3 paginas detalhado. Re-submissao bloqueada. |
| `sprints/roadmap-micro.md` | Nota de nomenclatura no topo. M15/T-058/T-059 atualizados com referencia a tasks novas. |
| `sprints/track-backend.md` | Nota de nomenclatura e referencia a clickup-sprints.md |
| `sprints/track-frontend.md` | Nota de nomenclatura e referencia a clickup-sprints.md |

### Baixos (ja sinalizados no README)

ADRs 001-010 e planos fase 1-4: nomenclatura antiga mas decisoes tecnicas validas. Sinalizacao ja existia no README.md.

---

## 5. Novas Tasks Adicionadas

| Task | Descricao | Sprint | Responsavel | Pontos |
|------|-----------|--------|-------------|--------|
| T-090 | DiagnosticoPage publica (3 paginas, email validation, re-submissao) | S08 | Frontend | 8 |
| T-091 | Drawer 2 abas (Negocio e Participante: Cadastro + Pesquisas) | S08 | Frontend | 5 |
| T-092 | Campos expandidos Projeto (cargaHoraria, modalidade) | S08 | BE+FE | 3 |
| T-082 (expandida) | Campos expandidos Participante (cpf, genero, endereco, cargo, status inativado) | S03 | Backend | +2 |

---

## 6. Riscos, Ambiguidades e Pontos para Validacao

| # | Ponto | Evidencia | Recomendacao |
|---|-------|-----------|--------------|
| 1 | **Status `desistente` vs `inativado`** — v1.0.2 tem `inativado` na tipagem principal mas `desistente` aparece no form de edicao de participante | Ambiguidade no codigo v1.0.2 | Validar com PO: manter ambos? Unificar? |
| 2 | **Campos CPF e endereco no Participante** — novos no v1.0.2, nao mencionados explicitamente no PRD | Presentes no NovoParticipanteDrawer.tsx | Validar com PO: confirmar inclusao no MVP |
| 3 | **cargaHoraria e modalidade no Projeto** — novos no v1.0.2 | Presentes no NovoProgramaDrawer.tsx | Validar com PO: confirmar inclusao |
| 4 | **Re-submissao de diagnostico bloqueada** — v1.0.2 implementa bloqueio | fractus-ajustes.md diz "definir comportamento" | Validar com PO: confirmar bloqueio ou permitir sobrescrita |
| 5 | **Motor de risco de evasao** — presente em v1.0.1 (riskCalculator.ts), ausente em v1.0.2 | Feature planejada mas nao implementada na versao mais recente | Manter na documentacao como feature planejada. Confirmar se segue no MVP |
| 6 | **ImpactoDashboard e PaineisCustomizados** — presentes em v1.0.1, ausentes em v1.0.2 | Sidebar v1.0.2 mostra "Resultados" como placeholder | Manter na documentacao. v1.0.2 nao chegou a implementar modulo Impacto |
| 7 | **Relacao Participante-Negocio: 1:1 vs N:N** — v1.0.1 usa N:N (negociosIds[]), v1.0.2 usa 1:1 (negocioId) | Mudanca estrutural no modelo de dados | v1.0.2 define 1:1. Schema atualizado para refletir |

---

## 7. Documentos Atualizados

| Arquivo | Tipo de atualizacao | Prioridade |
|---------|---------------------|------------|
| `prd/business-rules.md` | Reescrita secoes 4, 6, 7, 11-13. Fluxo 2 reescrito. Secao 7 (Diagnostico) adicionada | CRITICO |
| `guides/spec-desenvolvimento.md` | Schema atualizado (enums, models, rotas). Nota no topo | CRITICO |
| `sprints/clickup-sprints.md` | T-082 expandida. T-090, T-091, T-092 adicionadas. Changelog atualizado | CRITICO |
| `prd/prd-resumo.md` | Status expandidos. Campos de entidade (secao 12a). Diagnostico detalhado | MEDIO |
| `sprints/roadmap-micro.md` | Nota nomenclatura. M15/T-058/T-059 atualizados | MEDIO |
| `sprints/track-backend.md` | Nota nomenclatura no topo | BAIXO |
| `sprints/track-frontend.md` | Nota nomenclatura no topo | BAIXO |
| `analise-figma-make-v1-v2.md` | Este documento (entregavel da analise) | ENTREGAVEL |
