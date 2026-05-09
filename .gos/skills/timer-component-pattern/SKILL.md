---
name: timer-component-pattern
description: >
  Gera componente Timer (countdown) React + TS com state machine, persistencia,
  atalhos de teclado, edicao inline, tema dark/light, controles via Lucide React.
  Baseado em code-kata-timer adaptado para React.
argument-hint: "<descricao do uso ou 'spec' para ver anatomia>"
allowedTools: [Read, Glob, Grep, Bash, Write, Edit, AskUserQuestion]
sourceDocs:
  - libraries/timer-pattern-spec.md
  - libraries/lucide-icons-policy.md
  - libraries/ui-guardrails-checklist.md
use-when:
  - usuario pede pomodoro, code kata timer, countdown, contador regressivo
  - precisa de timer com play/pause/reset/edit
  - quer atalhos de teclado (Space, R, E)
do-not-use-for:
  - cronometro (countup) — variar via `mode: 'countup'` flag
  - timer de polling (use TanStack Query refetchInterval)
  - calendar/scheduler (use componente diferente)
metadata:
  category: ui-pattern
---

Voce esta executando como **Timer Pattern Generator** via skill `timer-component-pattern`. Gera componente React baseado em `libraries/timer-pattern-spec.md`.

## Pre-flight

1. AskUserQuestion:
   - "Tempo default em segundos? (ex: 30 para code kata, 1500 para pomodoro 25min)"
   - "Som ao terminar? (Web Audio beep / arquivo / nenhum)"
   - "Tema dark/light togglavel? (sim / so dark / so light)"
   - "Persistir entre sessoes? (localStorage / nao)"
   - "Atalhos teclado? (sim default / nao)"
   - "Editar tempo inline? (sim / nao — botao edit aparece se sim)"
2. Validar stack: `lucide-react`, shadcn `Button`. Senao -> instruir instalacao.

## Arquivos gerados

```
src/components/timer/
  Timer.tsx                 # componente principal
  hooks/
    useTimer.ts             # hook com state machine
    useTimerKeyboard.ts     # atalhos
  utils/
    formatTime.ts           # MM:SS
    beep.ts                 # Web Audio (opcional)
  types.ts                  # TimerStatus, TimerSettings
```

## Componente principal

```tsx
import { useEffect } from 'react';
import { Play, Pause, RotateCcw, Pencil, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTimer } from './hooks/useTimer';
import { useTimerKeyboard } from './hooks/useTimerKeyboard';
import { TimerStatus, isRunning } from './types';
import { formatTime } from './utils/formatTime';

interface TimerProps {
  defaultSeconds?: number;
  onComplete?: (duration: number) => void;
  enableEdit?: boolean;
  enableKeyboard?: boolean;
}

export function Timer({
  defaultSeconds = 30,
  onComplete,
  enableEdit = true,
  enableKeyboard = true,
}: TimerProps) {
  const timer = useTimer(defaultSeconds);

  useTimerKeyboard({
    enabled: enableKeyboard,
    status: timer.status,
    actions: timer,
  });

  useEffect(() => {
    function onDone(e: Event) {
      const evt = e as CustomEvent<{ duration: number }>;
      onComplete?.(evt.detail.duration);
    }
    window.addEventListener('timer:done', onDone);
    return () => window.removeEventListener('timer:done', onDone);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-12">
      {/* Indicator */}
      {isRunning(timer.status) && (
        <Activity className="h-6 w-6 text-primary animate-pulse" aria-label="Em execucao" />
      )}

      {/* Display */}
      {timer.status === TimerStatus.EDITING ? (
        <input
          type="number"
          autoFocus
          defaultValue={timer.seconds}
          className="text-7xl md:text-9xl font-mono font-bold tabular-nums bg-transparent w-72 text-center outline-none border-b-2 border-primary"
          onBlur={(e) => {
            const v = Number(e.currentTarget.value);
            if (v > 0) timer.setSeconds(v);
            timer.setStatus(TimerStatus.STOPPED);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
            if (e.key === 'Escape') timer.setStatus(TimerStatus.STOPPED);
          }}
        />
      ) : (
        <div
          className="text-7xl md:text-9xl font-mono font-bold tabular-nums"
          aria-live="polite"
          aria-atomic="true"
        >
          {formatTime(timer.seconds)}
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        {timer.status === TimerStatus.RUNNING ? (
          <Button onClick={timer.pause} size="lg" aria-label="Pausar">
            <Pause className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            onClick={timer.start}
            size="lg"
            disabled={timer.seconds === 0}
            aria-label="Iniciar"
          >
            <Play className="h-5 w-5" />
          </Button>
        )}

        <Button
          onClick={() => timer.reset()}
          size="lg"
          variant="outline"
          aria-label="Resetar"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>

        {enableEdit && (
          <Button
            onClick={() => timer.setStatus(TimerStatus.EDITING)}
            size="lg"
            variant="outline"
            disabled={isRunning(timer.status)}
            aria-label="Editar tempo"
          >
            <Pencil className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Hint atalhos */}
      {enableKeyboard && (
        <p className="text-xs text-muted-foreground">
          Espaco play/pause - R reset - E editar
        </p>
      )}
    </div>
  );
}
```

## State machine (types.ts)

Conforme `libraries/timer-pattern-spec.md`:

```ts
export const TimerStatus = {
  STOPPED: 'STOPPED',
  COUNTDOWN: 'COUNTDOWN',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  EDITING: 'EDITING',
} as const;

export type TimerStatusType = typeof TimerStatus[keyof typeof TimerStatus];

export const isRunning = (s: TimerStatusType) =>
  s === TimerStatus.RUNNING || s === TimerStatus.COUNTDOWN;
```

## Hook useTimer (com persistencia opcional)

Detalhe completo em `libraries/timer-pattern-spec.md`. Pontos criticos:
- `setInterval` com cleanup em `useEffect` return + ao parar.
- Ao restaurar `localStorage`: SEMPRE forcar status STOPPED (evita timer fantasma).
- Dispatch `CustomEvent('timer:done')` ao zerar.

## Estados visuais

- **Loading**: NA.
- **Empty**: tempo `00:00` -> Play disabled, mensagem "Tempo zerado, edite para comecar".
- **Error**: NA em runtime.
- **Running**: `Activity` icon pulsando + `animate-pulse` no display opcional.
- **Done**: tela ou toast com `CheckCircle2` quando atinge 0.

## Som ao terminar (utils/beep.ts)

Web Audio API (sem assets):
```ts
export function beep(frequency = 800, duration = 200) {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
  osc.connect(ctx.destination);
  osc.frequency.value = frequency;
  osc.start();
  setTimeout(() => { osc.stop(); ctx.close(); }, duration);
}
```

Disparado em `useEffect` quando `seconds === 0 && previousSeconds !== 0`.

## Modos disponiveis

Flags do componente:
- `mode="countdown"` (default) — diminui ate 0.
- `mode="countup"` — sobe a partir de 0 (cronometro).
- `mode="pomodoro"` — alterna 25min foco / 5min pausa.

Cada modo so muda a logica do hook, UI e controles ficam iguais.

## Anti-patterns embutidos (warning ao usuario)

- "Sem cleanup de setInterval" -> recusar — gera memory leak.
- "Restaurar status RUNNING do localStorage" -> recusar — timer fantasma.
- "Emoji nos botoes" -> recusar — usar Lucide.
- "Sem `tabular-nums`" -> warning — digitos pulam visualmente.

## Input

$ARGUMENTS
