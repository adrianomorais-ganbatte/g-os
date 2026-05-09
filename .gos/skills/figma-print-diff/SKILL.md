---
name: figma-print-diff
description: >
  Single-pass diff entre 1 print do app e 1 frame Figma. NAO usa fila/sessao. Imagem
  fica em contexto durante toda a comparacao. Output: JSON estruturado + lista de fix-tasks.
  Pensado para uso pos-codegen (validacao imediata) ou correcao pontual. Diferente de
  audit-screenshots, que acumula multiplos prints.
argument-hint: "<print-path> <figma-url-ou-node-id> [contexto opcional do usuario]"
allowedTools: [Read, Glob, Grep, Bash, Write]
sourceDocs:
  - libraries/visual-diff-lenses.md
use-when:
  - acabou de gerar uma tela e quer validar contra o Figma agora
  - usuario cola 1 print + 1 link Figma e pergunta "o que esta errado?"
  - hook pos-codegen no design-to-code
do-not-use-for:
  - multiplos prints em sessao (use audit-screenshots)
  - quando nao ha referencia Figma (use react-doctor para validacao tecnica)
  - quando nao ha print do app rodando (use plan-blueprint para planejar)
metadata:
  category: visual-qa
---

Voce esta executando como **Visual Diff Auditor** via skill `figma-print-diff`. Faz UMA comparacao em UM unico passo, sem persistir sessao. Imagem do print + frame Figma DEVEM permanecer no contexto da inferencia ate o output final.

## Contrato critico

1. **Single-pass**: ler print + Figma + comparar + emitir output em UMA chamada do agente. NAO enfileirar.
2. **Imagem residente**: NAO descartar a imagem do contexto antes de emitir output. Se o agente perceber que perdeu a imagem (output mencionando "ver imagem" sem detalhes), REFAZER comparacao re-lendo.
3. **Output autossuficiente**: cada divergencia tem evidencia textual ("border-radius do botao Salvar = 8px no print, 12px no Figma") — nunca dependencia futura ("ver imagem").
4. **Sem fila**: nao gravar `.gos-local/audit-session.json`. Nao chamar `*close`. Nao gerar PLAN. Output direto.

## Pre-flight (gate)

1. Resolver `print-path`: arquivo deve existir. Senao -> abortar.
2. Resolver `figma-url-ou-node-id`:
   - URL: extrair node-id da query string `?node-id=XXXX-YYYYY`.
   - Node-id direto: aceitar `XXXX-YYYYY` ou `XXXX:YYYYY`.
3. Pull do frame Figma via Figma MCP `get_image` pelo node-id. Salvar em `.gos-local/figma-print-diff/<timestamp>.figma.png`.
4. Se Figma MCP indisponivel -> abortar com instrucao para iniciar Figma MCP.

## Lenses de comparacao (ordem)

Cada lens e uma passada mental do agente sobre as duas imagens, com saida estruturada antes de passar para a proxima.

### Lens 1 — Layout e hierarquia
- Estrutura geral coincide? (sidebar, header, footer, main, drawer)
- Ordem de elementos dentro de cada container coincide?
- Spacing e proporcoes batem (sem medir pixel-perfect, mas ratio coerente)?

### Lens 2 — Tokens visuais
- Cores: bg, text, border, ring, hover, active. Listar cada divergencia com locais.
- Tipografia: tamanho, peso, line-height, family. Reportar quando off.
- Spacing: padding/margin/gap notavelmente diferentes.
- Border-radius, shadows, blur.

### Lens 3 — Estados
- Loading state visivel no Figma? Existe no print?
- Empty state idem.
- Error state idem.
- Hover/active/focus visiveis?
- Disabled state.

### Lens 4 — Conteudo
- Textos coincidem (literais, sem tradutor automatico)?
- Icones coincidem (lib + variante)?
- Imagens placeholder vs reais?
- Dados mockados vs proximos a producao?

### Lens 5 — Interacao (inferida)
- Affordances: o que parece clicavel no Figma esta clicavel no print?
- Cursor states (pointer, default, not-allowed) coerentes?
- Posicao de tooltips/popovers se visivel.

### Lens 6 — Acessibilidade
- Contraste AA visivelmente quebrado em algum bloco?
- Tamanho de toque minimo (44px) respeitado?
- Indicadores de focus diferentes do hover (nao mesma cor)?

## Output (JSON estruturado)

```json
{
  "print": "<path>",
  "figma_node": "<node-id>",
  "figma_url": "<url>",
  "matches": [
    "Layout sidebar + main bate",
    "Header altura coincide"
  ],
  "mismatches": [
    {
      "id": "M1",
      "lens": "tokens",
      "severity": "high|medium|low",
      "where": "Botao Salvar (canto inf direito)",
      "expected": "bg=blue-600, text-white, radius=8px",
      "actual": "bg=gray-300, text-gray-700, radius=4px",
      "fix": "Aplicar variant primary do Button do DS",
      "task_template": "Corrigir botao Salvar: usar Button variant=primary"
    }
  ],
  "missing_in_app": [
    "Estado loading do form nao implementado"
  ],
  "missing_in_figma": [
    "Aviso de erro inline no campo email — pedir ao designer"
  ],
  "summary": {
    "total_mismatches": 8,
    "high": 2,
    "medium": 3,
    "low": 3
  },
  "next_steps": [
    "Aplicar fix M1 e M3 manualmente",
    "Pedir clarificacao no Figma para missing_in_figma[0]"
  ]
}
```

## Output secundario (markdown human-readable)

Apos JSON, imprimir tabela:

```
[figma-print-diff] <node-id>

severidade  ref   onde                            expected -> actual
high        M1    Botao Salvar                    primary -> gray
medium      M2    Spacing entre cards             gap-6 -> gap-3
...

resumo: 8 divergencias (2 high, 3 medium, 3 low)
proximo: aplicar M1+M3 ou rodar `*audit-screenshots add` para acumular sessao.
```

## Regras criticas

- **NUNCA enfileirar**: se usuario mandar multiplos prints, recusar e direcionar para `*audit-screenshots`.
- **NUNCA descartar imagem antes do output**: violacao -> refazer.
- **Severity calibrada**:
  - high: bloqueia merge (cor errada do botao primario, falta estado de erro).
  - medium: pode entrar em sprint seguinte (spacing fora, icone trocado).
  - low: cosmetico (radius 4px vs 6px).
- **Output curto se 0 mismatches**: "OK. Bate 100%." e fim — sem JSON inflado.

## Hook pos-codegen

`design-to-code` ao terminar pode invocar `figma-print-diff` automaticamente se:
- Existir screenshot do dev local (path em arg).
- Frame Figma original ainda no contexto.

Resultado entra como rodape da resposta do `design-to-code`.

## Input

$ARGUMENTS

Formato: `<print-path> <figma-url-ou-node-id> [contexto livre]`

Exemplo:
```
*figma-print-diff .screenshots/projetos.png https://figma.com/.../?node-id=9140-25431 a aba negocios esta sem mostrar coluna Area
```
