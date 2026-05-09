# Lucide Icons Policy — G-OS

> Regra do dono: **NUNCA usar emojis em codigo gerado**. Sempre usar Lucide React.
> Excecao: usuario pediu emoji explicitamente OU output em texto plano para usuario final humano.

## Por que

1. Consistencia visual (todos os icones na mesma grid 24x24).
2. Tema-aware (`currentColor` segue color/dark mode).
3. Tree-shaking (so icones usados entram no bundle).
4. Acessibilidade (sized + aria-friendly).
5. Profissionalismo — emojis em UI corporativa parecem amador.

## Stack

```bash
npm install lucide-react
```

## Uso padrao

```tsx
import { Folder, Plus, Trash2, Settings } from "lucide-react";

<Button>
  <Plus className="h-4 w-4" />
  Novo projeto
</Button>

<Folder className="h-5 w-5 text-muted-foreground" />

// Icon-only button — aria-label OBRIGATORIO
<Button variant="ghost" size="icon" aria-label="Configuracoes">
  <Settings className="h-4 w-4" />
</Button>
```

## Tamanhos canonicos

| Contexto | className |
|----------|-----------|
| Inline em texto | `h-3 w-3` ou `h-3.5 w-3.5` |
| Inside button (sm) | `h-4 w-4` |
| Inside button (default) | `h-4 w-4` |
| Inside button (lg) | `h-5 w-5` |
| Icon-only button | `h-4 w-4` |
| Section heading | `h-5 w-5` |
| Empty state | `h-12 w-12` ou `h-16 w-16` |
| Hero / illustration | `h-24 w-24` |

## Cores

```tsx
// Default — segue cor do parent (currentColor)
<Plus className="h-4 w-4" />

// Cor especifica via Tailwind
<AlertCircle className="h-5 w-5 text-destructive" />
<CheckCircle2 className="h-5 w-5 text-success" />
<Info className="h-5 w-5 text-muted-foreground" />
```

## Mapeamento emoji -> Lucide (referencia rapida)

| Emoji | Lucide | Uso |
|-------|--------|-----|
| 👍 | `ThumbsUp` | aprovado |
| 👎 | `ThumbsDown` | rejeitado |
| ✅ | `Check` ou `CheckCircle2` | sucesso |
| ❌ | `X` ou `XCircle` | erro/fechar |
| ⚠️ | `AlertTriangle` | aviso |
| ℹ️ | `Info` | informacao |
| 🔍 | `Search` | busca |
| 📅 | `Calendar` | data |
| 📝 | `Pencil` ou `FileText` | editar / nota |
| 🗑️ | `Trash2` | deletar |
| ⚙️ | `Settings` | configuracoes |
| 👤 | `User` | usuario |
| 👥 | `Users` | grupo |
| 🏠 | `Home` | home |
| 📂 | `Folder` | pasta |
| 📄 | `FileText` | documento |
| 💾 | `Save` | salvar |
| 🔒 | `Lock` | privado |
| 🔓 | `Unlock` | publico |
| 📈 | `TrendingUp` | crescimento |
| 📉 | `TrendingDown` | queda |
| ⏰ | `Clock` | horario |
| 🔔 | `Bell` | notificacao |
| ❤️ | `Heart` | favorito |
| ⭐ | `Star` | rating |
| 🚀 | `Rocket` | launch |
| 🎯 | `Target` | objetivo |
| 💡 | `Lightbulb` | ideia |
| 🔧 | `Wrench` | ferramenta |
| 📊 | `BarChart3` | grafico |
| 📥 | `Download` ou `Inbox` | download |
| 📤 | `Upload` ou `Send` | upload |
| 🔗 | `Link` | link |
| 📌 | `Pin` | fixar |
| 🌟 | `Sparkles` | destaque |
| 🎨 | `Palette` | design |
| 🔥 | `Flame` | hot/destaque |
| ✨ | `Sparkles` | novo/magico |

## Estados visuais com Lucide (skeleton, empty, error)

### Skeleton loading
```tsx
import { Skeleton } from "@/components/ui/skeleton";

<div className="space-y-3">
  <Skeleton className="h-4 w-3/4" />
  <Skeleton className="h-4 w-1/2" />
  <Skeleton className="h-32 w-full" />
</div>
```

### Empty state
```tsx
import { Inbox } from "lucide-react";

<div className="flex flex-col items-center justify-center py-12 text-center">
  <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
  <h3 className="text-lg font-semibold">Nenhum projeto ainda</h3>
  <p className="text-sm text-muted-foreground mt-1 mb-4">
    Comece criando seu primeiro projeto.
  </p>
  <Button>
    <Plus className="h-4 w-4 mr-2" />
    Novo projeto
  </Button>
</div>
```

### Error state
```tsx
import { AlertTriangle, RotateCw } from "lucide-react";

<div className="flex flex-col items-center justify-center py-12 text-center">
  <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
  <h3 className="text-lg font-semibold">Algo deu errado</h3>
  <p className="text-sm text-muted-foreground mt-1 mb-4">{error.message}</p>
  <Button variant="outline" onClick={retry}>
    <RotateCw className="h-4 w-4 mr-2" />
    Tentar de novo
  </Button>
</div>
```

## Anti-patterns

- Emoji em codigo gerado: `<button>👍 Aprovar</button>` — REPROVADO.
- Texto unicode visual: `✓` em vez de `<Check />` — REPROVADO em codigo.
- Inline SVG quando Lucide tem o icone — usar Lucide.
- FontAwesome / Heroicons / outros — usar Lucide (one icon lib policy).
- Icon sem `aria-label` em icon-only button — REPROVADO em a11y.

## Excecoes (emoji permitido)

- Output em terminal/Bash que sera lido por humano (ex: `npm run doctor`).
- Documentacao README.md (estilo).
- Slack messages, ClickUp comments (texto plano fora de codigo de UI).
- Mensagens em chat enquanto agente conversa com usuario (regra global do agente — nao em codigo gerado).
- Usuario pede explicitamente: "use emoji aqui".

## Validacao automatica

`ui-guardrails` checa toda task de UI:
- [ ] Imports de `lucide-react` quando ha icone declarado?
- [ ] Zero emoji unicode em strings de UI (regex `/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u`)?
- [ ] Icon-only buttons com `aria-label`?

Falha em qualquer -> bloqueia codegen.
