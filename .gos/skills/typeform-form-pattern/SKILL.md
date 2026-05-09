---
name: typeform-form-pattern
description: >
  Gera estrutura de form passo-a-passo estilo Typeform (uma pergunta por vez), com
  questions[] tipadas, hooks de navegacao, validacao Zod, animacao, progress bar e
  estados visuais. Lucide React (zero emoji). React + TS + Tailwind + shadcn.
argument-hint: "<descricao do form ou 'spec' para ver a anatomia>"
allowedTools: [Read, Glob, Grep, Bash, Write, Edit, AskUserQuestion]
sourceDocs:
  - libraries/typeform-pattern-spec.md
  - libraries/lucide-icons-policy.md
  - libraries/ui-guardrails-checklist.md
use-when:
  - usuario pede form de cadastro/onboarding/quiz/lead/survey
  - precisa coletar dados em multiplas etapas com baixo cognitive load
  - mobile-first form
do-not-use-for:
  - settings page com varios campos editaveis simultaneamente (use form tradicional)
  - input simples 1-2 campos (overhead nao compensa)
metadata:
  category: ui-pattern
---

Voce esta executando como **Typeform Pattern Generator** via skill `typeform-form-pattern`. Gera estrutura completa baseada em `libraries/typeform-pattern-spec.md`.

## Pre-flight

1. Pergunta ao usuario:
   - "Quantas perguntas previstas?" (estimar — pode evoluir)
   - "Salvar progresso entre sessoes? (sessionStorage / Supabase / nao)"
   - "Tem tela de Welcome inicial? E de Review final?"
   - "Submit final manda pra Supabase, Workers, ou apenas mostra resultado?"
2. Validar stack: deve existir `tailwind.config`, `lucide-react` no package.json, shadcn `Button`, `Input`, `Card`, `Label`. Senao -> propor instalar.
3. Aplicar `libraries/lucide-icons-policy.md` — zero emoji, todos icones via Lucide.

## Geracao

### Arquivos criados

```
src/components/<feature>/
  questions.ts              # tipos + array de questions
  TypeformContainer.tsx     # estado + navegacao
  questions/
    WelcomeQuestion.tsx
    TextQuestion.tsx
    NumberQuestion.tsx
    ChoiceQuestion.tsx
    MultiChoiceQuestion.tsx
    ReviewQuestion.tsx
  hooks/
    useTypeformFlow.ts
  schemas/
    formSchema.ts           # Zod
```

### Estrutura base de `questions.ts`

```ts
import type { ComponentType } from 'lucide-react';
import * as Icons from 'lucide-react';

export type QuestionType =
  | 'welcome' | 'text' | 'number' | 'choice' | 'multiChoice' | 'date' | 'review';

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
  iconName?: keyof typeof Icons;
}

export interface Question<F = Record<string, unknown>> {
  id: string;
  type: QuestionType;
  field: keyof F | null;
  question: string | ((data: F) => string);
  description?: string;
  placeholder?: string;
  suffix?: string;
  decimal?: boolean;
  buttonText?: string;
  options?: QuestionOption[];
  validate?: (value: unknown, data: F) => string | null;
  showWhen?: (data: F) => boolean;
}

// Exemplo:
export const questions: Question<FormData>[] = [
  {
    id: 'welcome',
    type: 'welcome',
    field: null,
    question: 'Vamos comecar',
    description: 'Sera rapido — leva 2 minutos.',
    buttonText: 'Comecar',
  },
  {
    id: 'name',
    type: 'text',
    field: 'name',
    question: 'Como podemos te chamar?',
    placeholder: 'Seu nome',
    validate: (v) => (!v ? 'Campo obrigatorio' : null),
  },
  // ...
];
```

### Hook `useTypeformFlow`

Encapsula:
- `currentIndex`, `setCurrentIndex`
- `data`, `updateField`
- `activeQuestions` (filtrado por `showWhen`)
- `currentQ`
- `handleNext` (com validacao)
- `handlePrevious`
- `handleKeyPress` (Enter, Esc)
- `progress` (% concluido)
- Persistencia opcional (sessionStorage ou Supabase)

### Container

```tsx
export function TypeformContainer({ onComplete }: Props) {
  const flow = useTypeformFlow(questions);

  return (
    <div className="min-h-screen flex flex-col">
      <ProgressBar value={flow.progress} />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className={`max-w-2xl w-full transition-all duration-300 ${
          flow.isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
        }`}>
          <QuestionRenderer question={flow.currentQ} flow={flow} />
        </div>
      </main>

      <NavButtons flow={flow} />
    </div>
  );
}
```

### Estados visuais (UI guardrails)

Aplicar `libraries/ui-guardrails-checklist.md`:

- **Loading** (submitting): botao final disabled + `<Loader2 className="h-4 w-4 animate-spin mr-2" />`.
- **Empty** (questions = []): tela "Nenhuma pergunta configurada" com `<AlertCircle />`.
- **Error**: inline acima do CTA primario.
- **Success**: tela final com `<CheckCircle2 className="h-16 w-16 text-success" />` + redirect/proximos passos.
- **Skeleton**: nao aplicavel (form nao tem fetch inicial geralmente).

### Validacao com Zod

```ts
// schemas/formSchema.ts
import { z } from 'zod';

export const formSchema = z.object({
  name: z.string().min(2, 'Minimo 2 caracteres'),
  email: z.string().email('Email invalido'),
  age: z.coerce.number().int().min(13, 'Minimo 13 anos').max(120),
  // ...
});

export type FormData = z.infer<typeof formSchema>;
```

Chamar no submit final:
```ts
const result = formSchema.safeParse(data);
if (!result.success) {
  // mostrar primeiro erro inline
}
```

### Acessibilidade obrigatoria

- `aria-live="polite"` no container que troca de question.
- `aria-label` em botoes voltar / Lucide-icon-only.
- `useEffect` foca o input ao mudar de question.
- Roles ARIA em listas de opcoes (`role="radiogroup"` para choice).

### Atalhos teclado

- `Enter` -> next.
- `Esc` ou `Backspace` (em campo vazio) -> previous.
- Em multiChoice: setas para navegar opcoes, espaco para toggle.

## Customizacao por usuario

Apos gerar estrutura base, AskUserQuestion:
1. "Cor primaria? (default: shadcn primary)"
2. "Animacao de transicao? (fade / slide / nenhuma)"
3. "Progress bar: top, bottom, ou nao?"
4. "Permite voltar e editar respostas? (sim/nao)"

## Anti-patterns embutidos (gera com warning se usuario insistir)

- "Quero todas as perguntas em uma tela" -> form tradicional, nao typeform-pattern.
- "Sem progress bar" -> warning, mas gera (UX ruim em mobile).
- "Emoji nas opcoes" -> recusar, usar Lucide.

## Input

$ARGUMENTS
