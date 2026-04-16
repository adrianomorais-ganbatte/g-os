---
id: ai-writing-patterns
name: "AI Writing Patterns — Taxonomia de Padroes de Escrita IA"
whenToUse: |
  Referencia para detectar e eliminar padroes de escrita gerada por IA em textos
  destinados a entrega externa. Usar quando revisar propostas, emails, copy, artigos
  ou qualquer artefato textual que precisa soar humano e autentico.
  NOT for: codigo-fonte, logs, documentacao tecnica interna, commit messages.
version: "1.0.0"
source: "Wikipedia:Signs of AI writing (WikiProject AI Cleanup)"
---

# AI Writing Patterns — Taxonomia de Padroes de Escrita IA

> Baseado no guia da Wikipedia "Signs of AI writing", mantido pelo WikiProject AI Cleanup.
> Padroes validados em milhares de instancias reais de texto gerado por IA.

## Principio fundamental

> "LLMs usam algoritmos estatisticos para prever o que vem a seguir. O resultado tende ao mais estatisticamente provavel, aplicavel ao maior numero de casos."

Isso gera padroes previsiveis e detectaveis. Este catalogo lista 26 padroes organizados em 5 categorias.

---

## Categoria 1: Padroes de conteudo

### P01 — Inflacao de significancia

**Sinais**: "marca um momento decisivo na evolucao de...", "e um testemunho duradouro de...", "papel vital/significativo/crucial/fundamental", "reflete tendencias mais amplas", "moldando o futuro de..."

**Antes**: "O Instituto de Estatistica foi oficialmente estabelecido em 1989, marcando um momento decisivo na evolucao das estatisticas regionais."
**Depois**: "O Instituto de Estatistica foi criado em 1989 para coletar e publicar estatisticas regionais."

### P02 — Enfase excessiva em notabilidade

**Sinais**: "coberto por midia independente", "destaque em NYT, BBC, FT", "presenca ativa em redes sociais"

**Antes**: "Suas ideias foram citadas no NYT, BBC, Financial Times e The Hindu."
**Depois**: "Em entrevista ao NYT em 2024, ela argumentou que a regulacao de IA deveria focar em resultados."

### P03 — Analises superficiais com -ndo/-ando

**Sinais**: "destacando...", "garantindo...", "refletindo...", "contribuindo para...", "demonstrando..."

**Antes**: "A paleta de cores azul, verde e ouro ressoa com a beleza natural da regiao, simbolizando os campos, o oceano e as paisagens diversas, refletindo a conexao da comunidade com a terra."
**Depois**: "O templo usa cores azul, verde e ouro. O arquiteto disse que foram escolhidas em referencia aos campos e ao litoral local."

### P04 — Linguagem promocional

**Sinais**: "vibrante", "rico(a)", "profundo(a)", "aninhado(a) no coracao de", "inovador", "renomado", "deslumbrante", "imperdivel"

**Antes**: "Aninhada na deslumbrante regiao, a cidade se destaca como um vibrante polo de rica heranca cultural."
**Depois**: "A cidade fica na regiao de Gonder, conhecida pelo mercado semanal e pela igreja do seculo XVIII."

### P05 — Atribuicoes vagas

**Sinais**: "relatorios do setor", "observadores citam", "especialistas argumentam", "criticos apontam", "segundo diversas fontes"

**Antes**: "Especialistas acreditam que desempenha um papel crucial no ecossistema regional."
**Depois**: "O rio abriga varias especies endemicas de peixes, segundo levantamento de 2019 da Academia de Ciencias."

### P06 — Secoes formulaicas "Desafios e Perspectivas"

**Sinais**: "Apesar dos desafios... continua a prosperar", "Desafios e Legado", "Perspectivas Futuras"

**Antes**: "Apesar dos desafios tipicos de areas urbanas, incluindo congestionamento e escassez de agua, a cidade continua a prosperar."
**Depois**: "O congestionamento aumentou apos 2015, quando tres novos parques de TI foram abertos. A prefeitura iniciou um projeto de drenagem em 2022."

---

## Categoria 2: Padroes de linguagem

### P07 — Vocabulario tipico de IA

**Palavras de alta frequencia**: "Adicionalmente", "alinhar com", "crucial", "aprofundar", "enfatizando", "duradouro", "aprimorar", "fomentar", "destacar" (verbo), "interacao", "intrincado", "paisagem" (abstrato), "fundamental", "demonstrar", "tapeçaria" (abstrato), "testemunho", "sublimar", "valioso", "vibrante"

**Antes**: "Adicionalmente, uma caracteristica distintiva e a incorporacao de... um testemunho duradouro... na paisagem culinaria local, demonstrando como..."
**Depois**: "A culinaria tambem inclui carne de camelo, considerada uma iguaria. Pratos de massa, introduzidos durante a colonizacao italiana, continuam comuns."

**Deteccao**: 2+ termos inflados no mesmo paragrafo, nao presenca individual.

### P08 — Evitar "e"/"sao" (esquiva de copula)

**Sinais**: "serve como", "atua como", "representa um", "conta com", "oferece"

**Antes**: "A galeria serve como espaco de exposicao. O local conta com quatro salas separadas e oferece mais de 300 m²."
**Depois**: "A galeria e o espaco de exposicao. Tem quatro salas com 300 m² no total."

### P09 — Paralelismos negativos

**Sinais**: "Nao e apenas X, e Y", "Nao se trata apenas de..., trata-se de..."

**Antes**: "Nao se trata apenas do ritmo sob os vocais; faz parte da agressao e da atmosfera. Nao e meramente uma cancao, e uma declaracao."
**Depois**: "A batida pesada acentua o tom agressivo."

### P10 — Regra de tres

**Problema**: IA forca ideias em grupos de tres para parecer abrangente.

**Antes**: "O evento oferece palestras, paineis e oportunidades de networking. Os participantes podem esperar inovacao, inspiracao e insights."
**Depois**: "O evento inclui palestras e paineis. Ha tambem tempo para networking informal entre sessoes."

### P11 — Ciclagem de sinonimos

**Problema**: Penalidade de repeticao do modelo gera substituicao excessiva.

**Antes**: "O protagonista enfrenta muitos desafios. O personagem principal deve superar obstaculos. A figura central eventualmente triunfa. O heroi retorna para casa."
**Depois**: "O protagonista enfrenta muitos desafios, mas eventualmente triunfa e retorna para casa."

### P12 — Faixas falsas

**Sinais**: "de X ate Y" onde X e Y nao estao em uma escala significativa.

**Antes**: "Nossa jornada pelo universo nos levou do Big Bang a materia escura, do nascimento das estrelas a danca enigmatica das galaxias."
**Depois**: "O livro cobre o Big Bang, formacao de estrelas e teorias atuais sobre materia escura."

---

## Categoria 3: Padroes de estilo

### P13 — Uso excessivo de travessao

**Antes**: "O termo e promovido por instituicoes — nao pelas pessoas. Voce nao diz 'Paises Baixos, Europa' como endereco — mas essa rotulacao continua — mesmo em documentos oficiais."
**Depois**: "O termo e promovido por instituicoes, nao pelas pessoas. Voce nao diz 'Paises Baixos, Europa' como endereco, mas essa rotulacao continua em documentos oficiais."

### P14 — Uso excessivo de negrito

**Antes**: "Combina **OKRs**, **KPIs** e ferramentas visuais como o **Business Model Canvas** e o **Balanced Scorecard**."
**Depois**: "Combina OKRs, KPIs e ferramentas visuais como o Business Model Canvas e o Balanced Scorecard."

### P15 — Listas verticais com cabecalho inline

**Antes**: "- **Experiencia do Usuario:** A experiencia foi significativamente melhorada.\n- **Performance:** A performance foi aprimorada com algoritmos otimizados."
**Depois**: "A atualizacao melhora a interface, acelera o carregamento com algoritmos otimizados e adiciona criptografia de ponta a ponta."

### P16 — Title Case em titulos

**Antes**: "## Negociacoes Estrategicas E Parcerias Globais"
**Depois**: "## Negociacoes estrategicas e parcerias globais"

### P17 — Emojis decorativos

**Antes**: "🚀 **Fase de Lancamento:** O produto lanca no Q3\n💡 **Insight Chave:** Usuarios preferem simplicidade"
**Depois**: "O produto lanca no Q3. A pesquisa com usuarios mostrou preferencia por simplicidade."

**Variante P17b — Emoji-bullet**: 3+ linhas consecutivas com emoji estrutural no inicio (bullet com emoji). Diferente de emoji isolado decorativo, o emoji-bullet cria uma lista visual onde o emoji substitui o marcador tradicional. O padrao e detectavel quando o emoji funciona como organizador de topicos, nao como expressao emocional.

**Antes (emoji-bullet)**:
"🎯 Definir metas do trimestre\n📊 Analisar metricas anteriores\n🚀 Lancar campanha\n💬 Coletar feedback\n🔄 Iterar no produto"

**Depois**: "Para o trimestre: definir metas, analisar metricas anteriores, lancar a campanha, coletar feedback e iterar no produto."

**Nota**: Emoji-bullets sao particularmente comuns em posts LinkedIn e apresentacoes geradas por IA. A presenca de 3+ linhas consecutivas iniciando com emoji e forte indicador de geracao automatica.

### P18 — Aspas tipograficas

**Problema**: ChatGPT usa aspas curvas (\u201c...\u201d) em vez de aspas retas ("...").

---

## Categoria 4: Padroes de comunicacao

### P19 — Artefatos de chatbot

**Sinais**: "Espero que isso ajude!", "Claro!", "Certamente!", "Me avise se quiser que eu expanda alguma secao!"

**Regra**: Remover completamente. Texto e conteudo, nao conversa.

### P20 — Disclaimers de corte de conhecimento

**Sinais**: "Ate onde sei", "Com base nas informacoes disponiveis...", "Embora detalhes especificos sejam limitados..."

**Regra**: Encontrar fontes reais ou remover.

### P21 — Tom bajulador

**Sinais**: "Otima pergunta!", "Voce tem toda razao!", "Esse e um excelente ponto!"

**Regra**: Responder diretamente sem elogios gratuitos.

---

## Categoria 5: Filler e hedging

### P22 — Frases de enchimento

| Antes | Depois |
|-------|--------|
| "Com o objetivo de alcancar" | "Para alcancar" |
| "Devido ao fato de que" | "Porque" |
| "Neste momento" | "Agora" |
| "No caso de voce precisar" | "Se precisar" |
| "O sistema possui a capacidade de" | "O sistema pode" |
| "E importante notar que os dados mostram" | "Os dados mostram" |

### P23 — Hedging excessivo

**Antes**: "Poderia potencialmente ser argumentado que a politica talvez tenha algum efeito nos resultados."
**Depois**: "A politica pode afetar os resultados."

### P24 — Conclusoes genericas positivas

**Antes**: "O futuro parece brilhante. Tempos emocionantes estao por vir enquanto continuamos essa jornada rumo a excelencia."
**Depois**: "A empresa planeja abrir mais duas unidades no proximo ano."

---

## Soul injection — Alem da limpeza

Evitar padroes de IA e apenas metade do trabalho. Escrita limpa mas generica e tao detectavel quanto slop.

### Sinais de escrita sem alma (mesmo "limpa")
- Todas as frases com mesmo comprimento e estrutura
- Nenhuma opiniao, so reportagem neutra
- Sem reconhecimento de incerteza ou sentimentos mistos
- Sem perspectiva em primeira pessoa quando apropriado
- Sem humor, sem personalidade
- Leitura de Wikipedia ou press release

### Como adicionar voz
- **Ter opiniao**: "Sinceramente nao sei o que pensar sobre isso" e mais humano que listar pros e contras
- **Variar ritmo**: Frases curtas. Depois frases mais longas que levam seu tempo para chegar aonde querem.
- **Reconhecer complexidade**: "Impressionante mas um pouco inquietante" bate "Impressionante."
- **Usar "eu" quando cabe**: Primeira pessoa nao e falta de profissionalismo — e honestidade.
- **Permitir imperfeicao**: Estrutura perfeita parece algoritmica. Tangentes e pensamentos parciais sao humanos.
- **Ser especifico sobre sentimentos**: Nao "preocupante" mas "tem algo inquietante em agentes rodando as 3h da manha sem ninguem monitorando."

---

## Two-pass audit

Processo de revisao em duas passadas para maximizar autenticidade:

1. **Primeira passada**: Reescrever aplicando todos os padroes acima
2. **Auto-critica**: Perguntar "O que faz esse texto parecer obviamente gerado por IA?" — listar os sinais restantes
3. **Segunda passada**: Revisar eliminando sinais remanescentes e injetando soul

---

### P25 — Fragmentacao dramatica

**Sinais**: 3+ frases consecutivas com menos de 8 palavras. Ritmo staccato artificial que imita profundidade sem conteudo.

**Antes**: "Isso importa. Isso muda tudo. Isso define quem somos. Isso e o futuro. E o futuro e agora."

**Depois**: "Essa mudanca afeta como trabalhamos porque altera o fluxo de aprovacao de projetos, que antes passava por tres niveis e agora passa por um."

**Nota**: Frases curtas isoladas sao naturais. O padrao e 3+ consecutivas sem variacao, criando falsa dramaticidade.

### P26 — Falso insight

**Sinais**: "Nao e sobre X. E sobre Y." / "A verdadeira questao nao e X, mas Y." / "No fundo, o que importa e..." — reformulacao que soa profunda mas apenas reafirma o obvio.

**Antes**: "Nao e sobre tecnologia. E sobre pessoas. No fundo, a verdadeira questao nao e como usamos IA, mas como a IA nos transforma."

**Depois**: "A adocao de IA nas equipes de marketing reduziu o tempo de criacao de campanhas de 3 semanas para 4 dias, segundo dados internos de 2025."

**Nota**: Insights reais citam dados, fontes ou mecanismos. Falsos insights reafirmam truismos com estrutura de revelacao.
