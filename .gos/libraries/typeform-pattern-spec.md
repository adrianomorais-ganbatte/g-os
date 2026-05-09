# Typeform Pattern — Spec abstrata

> Abstracao do quiz/form passo-a-passo estilo Typeform, baseada em
> `body-metrics-edge/.examples/tsx/old/body-metrics-quiz-typeform.tsx`
> e `template-lp-wanderson/.a8z/skills/designkit/templates/form.tsx.template`.
>
> Use sempre que o usuario pedir form de coleta de dados, quiz, onboarding multi-step,
> survey, lead form, ou qualquer entrada estruturada que beneficia de **uma pergunta por vez**.

## Por que esse pattern

- **Conversao 2-3x maior** que forms longos (uma tela por pergunta vs paredao de inputs).
- **Cognitive load baixo** — usuario ve so uma decisao por vez.
- **Mobile-first natural** — funciona perfeitamente em telas pequenas.
- **Estado intermediario salvavel** — refresh nao perde progresso.

## Anatomia do pattern

### 1. Question schema

```ts
export type QuestionType = 'welcome' | 'text' | 'number' | 'choice' | 'multiChoice' | 'date' | 'review';

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
  iconName?: keyof typeof import('lucide-react');  // Lucide React (zero emoji)
}

export interface Question<F = Record<string, unknown>> {
  id: string;
  type: QuestionType;
  field: keyof F | null;
  question: string | ((data: F) => string);  // pode ser dinamica
  description?: string;
  placeholder?: string;
  suffix?: string;
  decimal?: boolean;
  buttonText?: string;
  options?: QuestionOption[];
  validate?: (value: unknown, data: F) => string | null;  // null = ok, string = erro
  showWhen?: (data: F) => boolean;  // condicional
}
```

### 2. State

```ts
const [currentIndex, setCurrentIndex] = useState(0);
const [data, setData] = useState<FormData>({});
const [isAnimating, setIsAnimating] = useState(false);
```

Persistir em `sessionStorage` ou `Supabase row` se descartavel = false.

### 3. Filtro de ativas (condicional)

```ts
const activeQuestions = questions.filter(q => !q.showWhen || q.showWhen(data));
const currentQ = activeQuestions[currentIndex];
```

### 4. Navegacao

- `Enter` -> next (com validacao).
- `Shift+Enter` (em textarea) -> nova linha.
- `Esc` -> previous (opcional).
- Botao "Voltar" sempre visivel exceto na welcome.
- Animacao opacity+translate-y com 200-300ms entre transicoes.

### 5. Componentes-tipo

**Welcome screen**
```
- Titulo grande (text-4xl/5xl)
- Subtitulo
- CTA primario "Comecar" (Button size lg)
- Lucide icon ilustrativo (h-16 w-16)
```

**Text input**
```
- Question (text-2xl semibold)
- Description opcional (text-base muted-foreground)
- Input grande (h-12 ou h-14, text-lg)
- Hint "Pressione Enter para continuar" + CornerDownLeft icon
```

**Number input**
```
- Igual text input mas type="number"
- Suffix visual ao lado (ex: "anos", "kg", "cm")
- Decimal opt-in via prop
```

**Choice (radio)**
```
- Stack vertical de cards clicaveis
- Cada card: Lucide icon + label + description opcional
- Hover ring + active filled
- Selecao avanca automaticamente apos 300ms
```

**MultiChoice (checkbox)**
```
- Igual choice mas selecao acumula
- Botao "Continuar" obrigatorio (nao auto-avanca)
- Mostra contagem ("3 de 5 selecionados")
```

**Review (final)**
```
- Resumo dos dados coletados em cards
- Botao "Editar" por secao (volta para a question correspondente)
- CTA primario "Confirmar" / "Calcular" / "Enviar"
```

### 6. Animacao

```tsx
<div className={`transition-all duration-300 ${
  isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
}`}>
  {/* question */}
</div>
```

### 7. Progress bar

Top of screen, fixed:
```tsx
<div className="fixed top-0 left-0 right-0 h-1 bg-muted">
  <div
    className="h-full bg-primary transition-all duration-300"
    style={{ width: `${((currentIndex + 1) / activeQuestions.length) * 100}%` }}
  />
</div>
```

### 8. Validacao

Por question:
```ts
{
  id: 'email',
  type: 'text',
  field: 'email',
  question: 'Qual seu email?',
  validate: (value) => {
    if (!value) return 'Campo obrigatorio';
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(String(value))) return 'Email invalido';
    return null;
  }
}
```

Erro inline abaixo do input. Nunca toast/alert.

### 9. Estados visuais (UI guardrails)

- **Loading** (submitting): botao disabled + Lucide `Loader2` com `animate-spin`.
- **Empty** (review sem dados): mostrar "Voce ainda nao respondeu — comece pelo inicio."
- **Error** (submit falhou): inline acima do CTA + botao retry.
- **Success**: tela final com Lucide `CheckCircle2` h-16 w-16 + redirect ou prox-step.

### 10. Acessibilidade

- `aria-live="polite"` no container de question (anuncia mudanca pra screen reader).
- Focus auto no input ao mudar de question (`useEffect` + `inputRef.current?.focus()`).
- Labels via `<Label htmlFor>` ou `aria-label`.
- Botao voltar com `aria-label="Pergunta anterior"`.

## Stack obrigatorio

- React 18+
- TypeScript strict
- Tailwind v4 + shadcn/ui (Button, Input, Card, Label)
- Lucide React (UNICA lib de icones — zero emoji)
- React Hook Form + Zod (validacao schema-first quando form complexo)

## Variantes

- **Quiz com calculo** (body-metrics-quiz original): apos ultima question, calcula metricas e mostra resultado.
- **Lead form** (capturar email/whats): submita para Supabase.
- **Onboarding** (apos signup): salva preferencias na profiles table.
- **Survey publico** (NPS, feedback): tabela com RLS public-insert apenas.

## Anti-patterns

- Mostrar todas perguntas de uma vez como form tradicional — defeats the purpose.
- Sem progress bar — usuario nao sabe quanto falta.
- Pular validacao no front — mau UX (back so pra forma).
- Auto-avanco SEM debounce em choice — usuario clica errado e ja avancou.
- Texto unicode/emoji nas opcoes — usar `iconName` Lucide.
- Sem estado de submitting no final — usuario clica enviar 3x.

## Reuso no G-OS

Quando usuario pede "form de cadastro", "quiz", "onboarding", "captura de leads":
1. `gos-master` sugere pattern typeform.
2. Usuario aprova -> skill `typeform-form-pattern` gera estrutura base.
3. Customiza questions[] do dominio.
4. Estilizacao via tokens shadcn (sem hardcoded colors).
