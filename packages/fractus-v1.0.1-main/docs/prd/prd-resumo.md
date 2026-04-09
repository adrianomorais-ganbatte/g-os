# **Fractus — visão geral do produto**

## **1\. Visão geral**

O Fractus é um sistema de acompanhamento de projetos de impacto social que permite gerenciar projetos, negócios participantes e seus membros, além de coletar dados por meio de pesquisas para análise de desempenho e impacto.

Nesta versão, o sistema passa a operar com uma nova lógica estrutural:

O cadastro principal deixa de ser o participante e passa a ser o negócio, sendo os participantes derivados automaticamente a partir do diagnóstico do negócio.

## **2\. Objetivo da mudança**

Reestruturar o fluxo do produto para:

* refletir a operação real dos projetos  
* reduzir cadastro manual  
* garantir maior consistência dos dados  
* centralizar a entrada via diagnóstico estruturado

## **3\. Mudanças de nomenclatura**

| Antes | Agora |
| ----- | ----- |
| Programas | Projetos |
| Patrocinadores | Investidores |
| Formulários | Pesquisas |

## **4\. Entidades principais**

### **Projeto**

Unidade principal de organização.

### **Negócio**

Organização participante do projeto.  
É a porta de entrada no sistema.

### **Participante**

Pessoa vinculada a um negócio.  
É criada automaticamente após o diagnóstico do negócio.

## **5\. Fluxo operacional**

### **5.1 Criação do projeto**

* Usuário cria um projeto  
* Associa investidores

### **5.2 Pré-cadastro de negócios**

Usuário acessa aba **Negócios** e cadastra manualmente:

Campos:

* nome do negócio  
* nome do líder  
* e-mail do líder  
* telefone

Sistema:

* cria negócio com status **pré-selecionado**  
* habilita o e-mail para responder o diagnóstico

### **5.3 Diagnóstico do negócio**

Cada projeto possui:

* **1 link único de diagnóstico**

Fluxo:

* gestor compartilha o link com os líderes dos negócios  
* líder acessa e preenche 3 páginas:  
  * P1 — Informações Básicas: faturamento anual, número de funcionários, área de atuação  
  * P2 — Perfil do Negócio: tempo de mercado, nível de digitalização, principal desafio  
  * P3 — Expectativas: expectativa com o projeto, conhece programas similares  
  * + lista de membros: nome, e-mail, cargo/função

Sistema:

* valida e-mail com base no pré-cadastro  
* bloqueia re-submissão (`diagnostico_respondido = true`)  
* atualiza status do negócio para **selecionado**  
* cria automaticamente os participantes

### **5.4 Criação automática de participantes**

Após envio do diagnóstico do negócio:

Sistema cria:

* participantes vinculados ao negócio

Status inicial:

* **pré-selecionado**

### **5.5 Diagnóstico individual do participante**

Participante responde sua pesquisa diagnóstica.

Sistema:

* atualiza status para **selecionado**

### **5.6 Ativação manual**

Após validação externa (termo de aceite):

Gestor:

* altera status para **ativo**

## **6\. Status**

### **6.1 Negócio**

* **Pré-selecionado**  
  * cadastrado manualmente  
  * diagnóstico não respondido  
* **Selecionado**  
  * diagnóstico respondido

### **6.2 Participante**

* **Pré-selecionado**  
  * criado automaticamente via negócio  
* **Selecionado**  
  * diagnóstico individual respondido  
* **Ativo**  
  * validado manualmente após termo de aceite  
* **Desistente** (opcional)  
  * participante que desistiu ou evadiu  
* **Inativado** (opcional)  
  * desativação administrativa  
* **Concluinte** (opcional)  
  * participante que concluiu o projeto

## **7\. Regras de negócio**

### **Negócios**

* todo negócio deve ser pré-cadastrado antes do diagnóstico  
* apenas e-mails cadastrados podem responder o diagnóstico  
* status só muda para selecionado após envio do diagnóstico

### **Participantes**

* não devem ser criados manualmente como fluxo principal  
* devem ser gerados automaticamente via diagnóstico do negócio  
* devem estar sempre vinculados a um negócio  
* não podem existir sem negócio associado

---

### **Diagnóstico**

* link é único por projeto  
* não é personalizado por negócio  
* resposta deve validar e-mail previamente cadastrado

### **Status**

* mudanças automáticas:  
  * pré-selecionado → selecionado (via diagnóstico)  
* mudanças manuais:  
  * selecionado → ativo

## **8\. Estrutura de navegação**

Ordem das abas dentro do projeto:

1. **Negócios**  
2. **Participantes**  
3. **Aulas**  
4. **Pesquisas**

## **9\. Interface — Negócios**

### **Ações principais**

* Novo negócio  
* Visualizar detalhes  
* Editar  
* Copiar link de diagnóstico

### **Tabela**

Colunas:

* nome do negócio  
* líder  
* status  
* diagnóstico (respondido / pendente)  
* número de membros  
* ações

### **Drawer — Negócio**

#### **Aba 1: Cadastro**

* dados do pré-cadastro (editáveis)  
* dados do diagnóstico (somente leitura após preenchimento)

#### **Aba 2: Pesquisas**

* lista de pesquisas respondidas:  
  * diagnóstico  
  * satisfação  
  * outras

## **10\. Interface — Participantes**

### **Origem**

* participantes são gerados automaticamente

### **Tabela**

Colunas:

* nome  
* negócio  
* status  
* satisfação  
* presença

### **Drawer — Participante**

#### **Aba 1: Cadastro**

* dados pessoais  
* dados do diagnóstico inicial

#### **Aba 2: Pesquisas**

* histórico de pesquisas:  
  * diagnóstica  
  * satisfação  
  * outras

## **11\. Pesquisas**

Substituem o conceito de formulários.

Tipos:

* pesquisa diagnóstica de meio e final de projeto  
* pesquisa de satisfação  
* outras pesquisas futuras

Devem permitir:

* visualização de respostas  
* associação com entidade (negócio ou participante)

## **12\. Pontos críticos de implementação**

### **Validação por e-mail**

* impedir respostas de e-mails não cadastrados

### **Duplicidade**

* evitar duplicidade de negócios

### **Integridade**

* participante não pode existir sem negócio

### **Atualização de status**

* separar claramente automático vs manual

### **Reenvio de diagnóstico**

* re-submissão bloqueada após primeiro envio (`diagnostico_respondido = true`)

## **12a\. Campos de entidade (referência Figma Make v1.0.2)**

### **Projeto**

Campos obrigatórios: nome, data início, data fim, vagas, modalidade (Presencial / Online / Híbrido)  
Campos opcionais: descrição, inscritos, carga horária, investidores

### **Negócio**

Campos obrigatórios: nome do negócio, nome do líder, e-mail do líder, telefone  
Campos do sistema: status, diagnostico_respondido, projeto_id

### **Participante**

Campos obrigatórios: nome, e-mail, telefone, CPF, data de nascimento  
Campos opcionais: gênero, endereço completo (CEP, endereço, número, complemento, bairro, cidade, estado), cargo  
Campos do sistema: status, negocio_id, dados (completo / incompleto), satisfação, presença

### **Investidor**

Campos obrigatórios: nome  
Campos opcionais: descrição

## **13\. Resumo estratégico**

O sistema evolui para um modelo centrado em negócios, onde a entrada de dados é estruturada via diagnóstico e os participantes são derivados automaticamente, garantindo maior consistência, escalabilidade e alinhamento com a operação real dos projetos.

