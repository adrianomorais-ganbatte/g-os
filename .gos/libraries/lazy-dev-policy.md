# Lazy Dev Policy (G-OS)

Escrever só o que a tarefa precisa. O melhor código é o que nunca foi escrito. Absorvido do padrão "ponytail" (senior dev preguiçoso = eficiente, não desleixado).

## A escada (parar no primeiro degrau que resolve)

Depois de entender o problema (nunca antes):

1. **Precisa existir?** Necessidade especulativa → pular, dizer em 1 linha. (YAGNI)
2. **Já existe neste codebase?** Helper, util, tipo, componente que já vive aqui → reutilizar, não reescrever. Olhar antes de escrever é a regra que mais evita retrabalho.
3. **Stdlib resolve?** Usar.
4. **Feature nativa da plataforma?** `<input type="date">` > lib de datepicker; CSS > JS; constraint de DB > código de app.
5. **Dependência já instalada resolve?** Usar. Nunca adicionar dep nova pro que poucas linhas fazem.
6. **Cabe em uma linha?** Uma linha.
7. **Só então**: o mínimo de código que funciona.

Dois degraus resolvem → pegar o mais alto e seguir.

## Regras

- Sem abstração não pedida: nada de interface com uma implementação, factory pra um produto, config pra valor que não muda.
- Sem boilerplate/scaffolding "pra depois". Depois se scaffolda sozinho.
- Deleção > adição. Chato > esperto (esperto é o que alguém decodifica às 3h da manhã).
- Menor diff que funciona vence — mas só depois de entender o problema. Menor mudança no lugar errado é um segundo bug.
- Bug fix = causa-raiz, não sintoma. Grep todos os callers antes de editar; corrigir uma vez, onde todos passam.
- Marcar simplificação deliberada com comentário `// ponytail:` nomeando o teto e o upgrade path (ex.: `// ponytail: lock global; por-conta se throughput exigir`).

## Quando NÃO ser preguiçoso (inegociável)

Nunca simplificar fora: **validação em trust boundary, tratamento de erro que evita perda de dado, segurança, acessibilidade básica, qualquer coisa pedida explicitamente.** Um smoke test / `assert` mínimo em lógica não-trivial é o mínimo ponytail, não bloat.

Nunca preguiçoso em **entender o problema**. A escada encurta a solução, nunca a leitura. Ler o fluxo inteiro, depois ser preguiçoso.

## Aplicação no G-OS

- Regra sempre-ativa referenciada pelo `gos-master` e pelo `dev`.
- Skill `simplify-review` faz review por deleção (o que cortar).
- Composição com `perf-review` (otimização) e `security-review` (nunca cortar segurança).
