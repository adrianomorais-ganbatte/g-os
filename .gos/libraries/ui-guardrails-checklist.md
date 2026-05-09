# UI Guardrails Checklist (detalhe)

> Detalhe expandido de cada item do `ui-guardrails`. Consultar quando uma violacao precisar ser explicada ao usuario.

## A — Estados visuais

### A1 — Loading
- Tela inteira: skeleton com a estrutura visual (header skeleton, lista de cards skeleton).
- Componente isolado (ex: botao salvando): spinner inline ou disabled state.
- Anti-padrao: tela em branco enquanto carrega.

Codegen exige no plan:
```markdown
### Estado: loading
- Skeleton: 3 cards 240x80px com bg-muted-foreground/10 + shimmer.
- Trigger: query.isPending
- Duracao max: 3s antes de error.
```

### A2 — Empty
- Copy explicando POR QUE esta vazio.
- Ilustracao OU icone grande.
- CTA primario para sair do empty (criar item, importar, etc.).
- Anti-padrao: "Nenhum dado" sem nada mais.

Codegen exige:
```markdown
### Estado: empty
- Copy: "Voce ainda nao tem nenhum projeto. Comece criando um."
- Icone: FolderPlus 48px text-muted-foreground.
- CTA: "Criar primeiro projeto" (Button variant=primary).
```

### A3 — Error
- Mensagem clara (nao "erro 500").
- Acao de recovery (tentar de novo, voltar, contato).
- Distincao: erro recuperavel vs nao-recuperavel.

```markdown
### Estado: error
- Tipo recuperavel: toast variant=error + retry inline.
- Tipo nao-recuperavel: tela full com copy + CTA voltar.
```

### A4 — Success (quando aplicavel)
- Toast inline ou success state pos-form.
- Auto-dismiss em 3-5s OU acao explicita do usuario.

### A5 — Default
- Estado normal, dados presentes.

## B — Responsividade

### Breakpoints obrigatorios
- Mobile: <768px (preferencia: comeca daqui — mobile-first).
- Tablet: 768-1024px.
- Desktop: 1024-1920px.

### Comportamentos esperados
- Sidebar -> drawer no mobile.
- Tabela -> cards no mobile.
- Drawer right -> bottom sheet no mobile.
- Tipografia escala (text-base mobile, text-lg desktop ou similar).

### Codegen exige no plan
```markdown
### Responsividade
- Mobile: lista vira cards verticais empilhados, sem hover.
- Tablet: 2 colunas de cards.
- Desktop: tabela tradicional com hover.
```

## C — Acessibilidade

### Roles ARIA
- `<button>` para acao -> nao usar `<div onClick>`.
- `<dialog>` ou `role="dialog"` + aria-labelledby para modals.
- `role="listbox"` + `role="option"` em selects custom.

### Labels
- Input sem `<label>` visivel: usar `aria-label`.
- Icon-only button: `aria-label="Fechar"` obrigatorio.

### Focus
- Modal aberto: focus vai para primeiro elemento focavel.
- Modal fechado: focus volta para trigger.
- Tab order segue ordem visual.
- Focus indicator distinto de hover (outline 2px ring-primary).

### Contraste
- AA: 4.5:1 texto, 3:1 UI.
- Erro inline NAO so vermelho — adicionar icone/texto "Erro:".

## D — Tokens do DS

### Cores
- OK: `bg-primary`, `text-foreground`, `border-border`.
- Anti: `bg-[#3b82f6]`, `text-blue-500` quando primary existe.

### Spacing
- OK: `gap-2`, `p-4`, `mt-6`.
- Anti: `gap-[7px]`, `p-[13px]`.

### Typography
- OK: `text-sm`, `font-semibold`, `leading-tight`.
- Anti: `text-[13px]`, `tracking-[0.02em]` quando token existe.

### Radius
- OK: `rounded`, `rounded-md`, `rounded-lg`.
- Anti: `rounded-[7px]`.

### Excecoes permitidas (com justificativa)
- Animacao especifica nao-mapeada: `[animation-delay:120ms]` OK.
- Posicionamento dinamico: `top-[calc(100%+8px)]` OK.

## E — Interacao

### Trigger declaration
Cada elemento interativo precisa:
- Trigger: o que dispara (click, hover, focus, keypress, mount, query)
- Acao: que callback/mutation roda
- Resultado: qual estado muda + UI feedback

### Edge cases obrigatorios
- Double-click rapido em CTA -> debounce 300ms ou disabled durante mutation.
- Mutation lenta (>3s) -> mostrar loading inline ou progress.
- Mutation falha -> rollback ou error state com retry.
- Concorrencia (2 usuarios editando) -> conflict resolution declarado.

## Self-check rapido

Antes de submeter tela para codegen:

```
[ ] A1 loading state declarado e visualmente coerente?
[ ] A2 empty state existe + CTA primaria?
[ ] A3 error state com recovery?
[ ] B responsividade nos 3 breakpoints?
[ ] C aria-label em icon buttons + focus visivel?
[ ] D 0 valores hardcoded fora do DS?
[ ] E todos os triggers tem acao + resultado + edge cases?
```

Falhou em algum -> NAO codar ainda. Volte ao plano.
