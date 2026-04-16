---
name: humanizer
description: Remove padroes de escrita gerada por IA para tornar texto mais natural e autentico. Use para revisar propostas, emails, copy e qualquer texto de entrega externa. Detecta 26 padroes incluindo inflacao de significancia, linguagem promocional, vocabulario AI, regra de tres, hedging excessivo, fragmentacao dramatica e falso insight e artefatos de chatbot. Aplica two-pass audit com soul injection.
argument-hint: "[cole o texto para humanizar]"
use-when:
  - revisar texto antes de entrega externa
  - texto soa generico ou "feito por IA"
  - humanizar output de proposta, email ou copy
  - revisar autenticidade de texto
  - limpar artefatos de chatbot
do-not-use-for:
  - revisao ortografica/gramatical (use revisar-ortografia-codigo)
  - revisao de codigo-fonte
  - documentacao tecnica interna
  - commit messages ou logs
metadata:
  category: content-quality
  version: "2.2.0"
  source: "Wikipedia:Signs of AI writing (WikiProject AI Cleanup)"
---

# Skill: Humanizer — Remover padroes de escrita IA

> "LLMs usam algoritmos estatisticos para prever o que vem a seguir. O resultado tende ao mais estatisticamente provavel, aplicavel ao maior numero de casos." — Isso gera padroes previsiveis e detectaveis.

## When to use this skill
- Texto de entrega externa que precisa soar humano e autentico.
- Output que parece generico, inflado ou "montado por algoritmo".
- Propostas, emails de campanha, copy para redes sociais, landing pages.

## Do not use
- Revisao ortografica/gramatical (use `/revisar-ortografia-codigo`).
- Codigo-fonte, logs, documentacao interna.

## Instructions

### Passo 1 — Identificar padroes

Ler o texto de entrada e identificar todos os padroes de escrita IA presentes. Referenciar o catalogo completo em `libraries/content/ai-writing-patterns.md`.

Categorias a verificar:
1. **Conteudo**: inflacao de significancia, enfase de notabilidade, analises superficiais com -ndo, linguagem promocional, atribuicoes vagas, secoes formulaicas
2. **Linguagem**: vocabulario AI, esquiva de copula, paralelismos negativos, regra de tres, ciclagem de sinonimos, faixas falsas
3. **Estilo**: travessao excessivo, negrito excessivo, listas com cabecalho inline, Title Case, emojis, aspas tipograficas
4. **Comunicacao**: artefatos de chatbot, disclaimers, tom bajulador
5. **Filler**: frases de enchimento, hedging excessivo, fragmentacao dramatica, falso insight, conclusoes genericas

### Passo 2 — Primeira reescrita

Reescrever o texto eliminando todos os padroes identificados:
- Substituir inflacao por fatos concretos
- Usar "e"/"sao"/"tem" em vez de construcoes elaboradas
- Cortar frases de enchimento e hedging
- Remover artefatos de chatbot completamente
- Variar estrutura e comprimento de frases
- Preferir especificidade a generalidade

### Passo 3 — Auto-critica (two-pass audit)

Perguntar: **"O que faz este texto parecer obviamente gerado por IA?"**

Listar em bullets curtos os sinais restantes:
- Ritmo uniforme demais?
- Neutralidade excessiva?
- Estrutura "montada"?
- Falta de voz/opiniao?

Entao: **"Agora faca nao parecer obviamente gerado por IA."** — e revisar.

### Passo 4 — Soul injection + Segunda reescrita

Evitar escrita "limpa mas sem alma" e tao importante quanto remover padroes. Escrita esteril e sem voz e tao obvia quanto slop.

**Sinais de escrita sem alma (mesmo tecnicamente "limpa"):**
- Todas as frases com mesmo comprimento e estrutura
- Sem opiniao, apenas relato neutro
- Sem reconhecer incerteza ou sentimentos mistos
- Sem primeira pessoa quando seria natural
- Sem humor, sem personalidade, sem posicionamento
- Le como artigo Wikipedia ou press release

**Como adicionar voz:**
- **Ter opiniao.** Nao apenas relatar fatos — reagir a eles. "Sinceramente nao sei como me sinto sobre isso" e mais humano que listar pros e contras neutralmente.
- **Variar ritmo.** Frases curtas. Depois frases mais longas que tomam seu tempo ate chegar ao ponto. Misturar.
- **Reconhecer complexidade.** Humanos tem sentimentos mistos. "Isso e impressionante mas tambem meio perturbador" e melhor que "Isso e impressionante."
- **Usar "eu" quando cabe.** Primeira pessoa nao e falta de profissionalismo — e honestidade. "Fico pensando em..." ou "O que me pega e..." sinaliza uma pessoa real pensando.
- **Permitir imperfeicao.** Estrutura perfeita parece algoritmica. Tangentes, parenteses e pensamentos parciais sao humanos.
- **Ser especifico sobre sentimentos.** Nao "preocupante" mas o que exatamente incomoda.

Revisar o texto eliminando sinais remanescentes e injetando autenticidade.

### Passo 5 — Entregar resultado

Apresentar:
1. **Rascunho humanizado** (resultado do Passo 2)
2. **Auto-critica** (bullets do Passo 3)
3. **Versao final** (resultado do Passo 4)
4. **Resumo das mudancas** (o que foi corrigido e por que)

## Task

$ARGUMENTS

## Regras

- Preservar significado original — humanizar nao e reescrever do zero
- Manter tom adequado ao contexto (formal/casual/tecnico)
- NAO inventar dados ou citacoes — se nao ha fonte, cortar
- NAO converter tudo em primeira pessoa — avaliar o que cabe
- Respeitar `rules/output-authenticity.md` como criterio de aceitacao
- Referenciar `libraries/content/ai-writing-patterns.md` para catalogo de padroes

## Calibracao por Formato e Setor

A intensidade da humanizacao deve ser calibrada conforme o contexto:

| Formato | Intensidade | Foco |
|---------|-------------|------|
| Email comercial | Alta | Remover todos os padroes, injetar voz pessoal |
| Proposta tecnica | Media | Remover inflacao e chatbot, manter estrutura formal |
| Post LinkedIn | Alta | Remover cacoetes, P25/P26 especialmente, manter brevidade |
| Documentacao interna | Baixa | Apenas remover chatbot e inflacao excessiva |
| Landing page / copy | Alta | Soul injection completo, voz de marca |
| Relatorio executivo | Media | Cortar enchimento, manter formalidade |

| Setor | Ajustes |
|-------|---------|
| Tecnologia | Jargao tecnico e aceitavel; foco em remover inflacao e chatbot |
| Juridico | Formalidade e estrutura sao esperadas; foco em P01, P04, P05 |
| Marketing | Maxima naturalidade; todos os padroes devem ser eliminados |
| Academico | Manter tom neutro; foco em P01, P03, P07, P22 |
| Governo / Institucional | Formalidade mas sem linguagem promocional; foco em P04, P07 |

## Exemplo completo

**Antes (IA):**
> Otima pergunta! Aqui esta um texto sobre o tema. Espero que ajude!
>
> Assistentes de codigo IA servem como um testemunho duradouro do potencial transformador dos LLMs, marcando um momento decisivo na evolucao do desenvolvimento de software. No cenario atual em rapida evolucao, estas ferramentas inovadoras — aninhadas na intersecao de pesquisa e pratica — estao remodelando como engenheiros ideiam, iteram e entregam, sublinhando seu papel vital nos fluxos modernos.
>
> No seu nucleo, a proposta de valor e clara: otimizar processos, aprimorar colaboracao e fomentar alinhamento. Nao se trata apenas de autocomplete; trata-se de desbloquear criatividade em escala, garantindo que organizacoes possam permanecer ageis enquanto entregam experiencias perfeitas, intuitivas e poderosas.
>
> - :bulb: **Velocidade:** Geracao de codigo e significativamente mais rapida, reduzindo atrito e empoderando devs.
> - :rocket: **Qualidade:** Qualidade do output foi aprimorada, contribuindo para padroes mais altos.
> - :white_check_mark: **Adocao:** Uso continua crescendo, refletindo tendencias mais amplas da industria.
>
> Apesar de desafios tipicos de tecnologias emergentes — incluindo alucinacoes, vieses e accountability — o ecossistema continua a prosperar. Para realizar plenamente este potencial, times devem se alinhar com melhores praticas.
>
> Em conclusao, o futuro parece brilhante. Me avise se quiser que eu expanda alguma secao!

**Rascunho humanizado:**
> Assistentes de codigo IA aceleram algumas tarefas. Num estudo de 2024 do Google, devs usando Codex completaram funcoes simples 55% mais rapido que o grupo controle, mas nao mostraram melhoria em debugging ou decisoes de arquitetura.
>
> As ferramentas sao boas para boilerplate: arquivos de config, scaffolding de testes, refactors repetitivos. Sao ruins em saber quando estao erradas. Ja aceitei sugestoes que compilavam, passavam no lint, e ainda assim faziam a coisa errada porque parei de prestar atencao.
>
> As metricas de produtividade sao escorregadias. GitHub diz que usuarios do Copilot "aceitam 30% das sugestoes", mas aceitacao nao e corretude, e corretude nao e valor.

**Auto-critica:**
- Ritmo ainda um pouco uniforme demais (contrastes limpos, paragrafos equilibrados)
- O fechamento soa levemente "slogan" em vez de conversa natural

**Versao final:**
> Assistentes de codigo IA ajudam nas partes chatas. Nao em tudo. Definitivamente nao em arquitetura.
>
> Sao otimos para boilerplate: config, scaffolding de testes, refactors repetitivos. Tambem sao otimos em soar certos estando errados. Ja aceitei sugestoes que compilavam, passavam no lint, e erravam o ponto porque parei de prestar atencao.
>
> As metricas de produtividade sao escorregadias. GitHub pode dizer que usuarios do Copilot "aceitam 30% das sugestoes", mas aceitacao nao e corretude, e corretude nao e valor. Se voce nao tem testes, esta basicamente adivinhando.

**Padroes corrigidos:**
- Artefatos de chatbot ("Otima pergunta!", "Espero que ajude!", "Me avise se...")
- Inflacao de significancia ("testemunho duradouro", "momento decisivo", "cenario em evolucao", "papel vital")
- Linguagem promocional ("inovadoras", "aninhadas", "perfeitas, intuitivas e poderosas")
- Atribuicoes vagas removidas
- Analises superficiais com -ndo ("sublinhando", "refletindo", "contribuindo")
- Paralelismo negativo ("Nao se trata apenas de X; trata-se de Y")
- Regra de tres e ciclagem de sinonimos
- Faixas falsas removidas
- Travessoes, emojis, cabecalhos em negrito, aspas tipograficas
- Esquiva de copula ("serve como" → "e")
- Secao formulaica ("Apesar de desafios... continua a prosperar")
- Hedging excessivo e frases de enchimento ("Para realizar plenamente", "No seu nucleo")
- Conclusao generica ("o futuro parece brilhante")
- Soul injection: voz pessoal, ritmo variado, menos placeholders

## Referencia

Baseado em [Wikipedia:Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing), mantido pelo WikiProject AI Cleanup. Padroes validados em milhares de instancias reais de texto gerado por IA.
