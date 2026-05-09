# Intake Questions — Mom Test + SPIN para nao-tecnicos

> Banco de perguntas usado por `idea-intake`. Linguagem coloquial, PT-BR.

## Principios

1. **Mom Test**: pergunte sobre o passado (concreto), nao o futuro (hipotetico). Nunca "voce usaria/pagaria?". Sempre "voce ja teve esse problema? como resolveu?".
2. **SPIN**: Situation, Problem, Implication, Need-payoff. Em ordem. Nao pular.
3. **Sem jargao**: "banco de dados" -> "lugar onde a informacao fica salva". "API" -> "uma porta que outros sistemas usam pra falar com o seu". "Auth" -> "quem ve o que".
4. **Especifico, nao generico**: "uma vez" e melhor que "ja aconteceu".
5. **1 pergunta por vez**. Espere a resposta. Nao acumule.

## Bloco 1 — Situacao (Mom Test concreta)

Escolher 1-2 conforme o tom da conversa:

- "Me conta a ultima vez que isso aconteceu — uma situacao especifica, nao em geral."
- "O que voce estava fazendo quando o problema bateu?"
- "Onde voce estava? No celular, no computador, fora de casa?"
- "Quem mais estava junto? (sozinho, com colega, com cliente, com filho)"

Anti-padrao: "voce costuma ter esse problema?" — abre porta pra resposta vaga.

## Bloco 2 — Problema

- "Como voce resolveu na hora? Mesmo que tenha sido com gambiarra."
- "Quanto tempo voce gastou ate conseguir resolver?"
- "O que mais te incomodou nessa hora — a demora, o esforco, a confusao?"
- "Voce ja tentou alguma ferramenta/jeito antes? Por que nao deu certo?"

## Bloco 3 — Implicacao

- "O que acontece se voce nao resolver isso? (pra voce, pra outras pessoas)"
- "Quantas vezes por semana/mes isso acontece?"
- "Tem algum custo (dinheiro, cliente perdido, briga em casa) quando o problema fica sem resolucao?"

## Bloco 4 — Persona

- "Quem mais alem de voce passa por isso? Tenta descrever uma pessoa especifica que voce conhece."
- "Que tipo de pessoa NUNCA passaria por isso?"
- "Essa pessoa que sofre — ela e do tipo que ja paga por software, ou e a primeira vez?"

## Bloco 5 — Job-to-be-done

- "Se voce abrisse uma solucao magica amanha, qual e a PRIMEIRA coisa que voce faria com ela?"
- "Qual e o resultado final que voce quer? (descreve o estado depois de usar — 'minha mae conseguiu agendar', 'fechei a venda', 'recebi o relatorio sem precisar pedir')"
- "Tem coisas que voce QUER que essa solucao NAO faca? (sem isso vira complicado/feio/caro)"

## Bloco 6 — Telas-chave (sem jargao tecnico)

- "Imagina que abriu o produto agora. O que voce ESPERA ver na primeira tela?"
- "Quantos cliques/toques voce aceita ate resolver? (1, 3, 10?)"
- "Se a solucao fosse uma planilha, ja resolveria? Por que nao?"
- "Tem algum produto parecido que te inspira? (nome, link, ou descricao)"
- "Tem algum produto parecido que voce ODEIA? Por que?"

## Bloco 7 — Sucesso e descartabilidade

CRITICO. Define perfil de arquitetura:

- "Esse produto e pra usar UMA vez (validar uma ideia, mostrar pra alguem, testar conceito) ou voce quer manter rodando por meses/anos?"
- "Se for pra usar uma vez: quem usa junto com voce? Voce sozinho, 5 amigos, 100 estranhos?"
- "Como voce vai saber, depois de usar, que valeu a pena? Em uma frase humana, sem numeros."
- "Quanto voce pode investir pra isso existir? (tempo seu? dinheiro? ambos?)"

## Sinais de alerta (re-perguntar)

- Resposta vaga ("e tipo... uma plataforma de gestao") -> pedir um exemplo concreto.
- Sempre "talvez/depende" -> falta de problema real, considerar abortar.
- Usuario descrevendo SOLUCAO no lugar de PROBLEMA -> redirecionar: "ok, isso e UMA forma de resolver — mas qual e o problema que essa coisa resolve?".

## Sinais de alerta (problema fraco)

Se ao final do Bloco 3 (Implicacao):
- Custo zero ("e que seria legal ter")
- Sem frequencia clara ("acontece as vezes")
- Sem persona alem do proprio usuario ("acho que outras pessoas tambem teriam")

-> Marcar `descartavel: true` automaticamente e perguntar se vale seguir.

## Anti-perguntas (NAO fazer)

- "Voce pagaria por isso?"  (Mom Test rejeita)
- "Seria legal se...?"  (compromisso fake)
- "O que voce acha de uma feature X?"  (chumbando solucao)
- "Em geral, qual seu maior problema?"  (vago)
- "Voce usaria?"  (futuro hipotetico)

## Output esperado ao fim

15 perguntas no maximo, 5 blocos cobertos, resumo factual em 5 bullets — usuario valida ou corrige.
