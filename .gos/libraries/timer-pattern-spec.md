# Timer Pattern — Spec abstrata

> Abstracao do timer-de-estudo passo-a-passo, baseada em `code-kata-timer/script.js`
> + `code-kata-timer/style.css`. Adaptado para React + TypeScript + Tailwind.
>
> Use quando o usuario pedir contador regressivo, timer de pomodoro, code kata,
> stopwatch com countdown, ou qualquer interface de tempo com play/pause/edit.

## State machine

```ts
export const TimerStatus = {
  STOPPED: 'STOPPED',
  COUNTDOWN: 'COUNTDOWN',  // animacao 3-2-1-GO antes de iniciar
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  EDITING: 'EDITING',      // usuario editando valor
} as const;
export type TimerStatusType = typeof TimerStatus[keyof typeof TimerStatus];

export const isRunning = (s: TimerStatusType) =>
  s === TimerStatus.RUNNING || s === TimerStatus.COUNTDOWN;
```

Transicoes validas:
```
STOPPED -> COUNTDOWN -> RUNNING -> PAUSED -> RUNNING
                                          -> STOPPED
EDITING <-> STOPPED  (so edita parado)
```

## Persistencia

LocalStorage com chave `timerSettings`:
```ts
interface TimerSettings {
  currentSeconds: number;
  timerStatus: TimerStatusType;  // sempre STOPPED ao recarregar
  theme: 'dark' | 'light';
  showContributors?: boolean;     // app-specific, opcional
}
```

**Regra critica** (do code-kata-timer original): ao carregar settings, **sempre forcar status para STOPPED** — nao restaurar RUNNING. Caso contrario timer "fantasma" continua contando.

## Hook reutilizavel

```ts
export function useTimer(defaultSeconds = 30) {
  const [status, setStatus] = useState<TimerStatusType>(TimerStatus.STOPPED);
  const [seconds, setSeconds] = useState(defaultSeconds);
  const intervalRef = useRef<number | null>(null);

  const start = useCallback(() => {
    if (status === TimerStatus.RUNNING) return;
    setStatus(TimerStatus.RUNNING);
    intervalRef.current = window.setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setStatus(TimerStatus.STOPPED);
          // dispatch event 'timer:done' para componentes ouvirem
          window.dispatchEvent(new CustomEvent('timer:done'));
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, [status]);

  const pause = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStatus(TimerStatus.PAUSED);
  }, []);

  const reset = useCallback((to = defaultSeconds) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSeconds(to);
    setStatus(TimerStatus.STOPPED);
  }, [defaultSeconds]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { status, seconds, start, pause, reset, setSeconds };
}
```

## Display

Formato `MM:SS` com font monospace (Orbitron, JetBrains Mono ou Tailwind `font-mono`):

```tsx
function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

<div className="text-7xl md:text-9xl font-mono font-bold tabular-nums">
  {formatTime(seconds)}
</div>
```

`tabular-nums` garante que digitos nao "pulem" durante a contagem.

## Controles (Lucide React)

```tsx
import { Play, Pause, RotateCcw, Pencil } from "lucide-react";

<div className="flex gap-3 justify-center">
  {status === TimerStatus.STOPPED || status === TimerStatus.PAUSED ? (
    <Button onClick={start} size="lg" aria-label="Iniciar">
      <Play className="h-5 w-5" />
    </Button>
  ) : (
    <Button onClick={pause} size="lg" aria-label="Pausar">
      <Pause className="h-5 w-5" />
    </Button>
  )}
  <Button onClick={() => reset()} size="lg" variant="outline" aria-label="Resetar">
    <RotateCcw className="h-5 w-5" />
  </Button>
  <Button
    onClick={() => setStatus(TimerStatus.EDITING)}
    size="lg"
    variant="outline"
    aria-label="Editar tempo"
    disabled={isRunning(status)}
  >
    <Pencil className="h-5 w-5" />
  </Button>
</div>
```

## Atalhos de teclado

```ts
useEffect(() => {
  function onKey(e: KeyboardEvent) {
    if (e.target instanceof HTMLInputElement) return; // nao interferir em editing
    if (e.code === 'Space') { e.preventDefault(); status === TimerStatus.RUNNING ? pause() : start(); }
    if (e.code === 'KeyR') reset();
    if (e.code === 'KeyE') setStatus(TimerStatus.EDITING);
  }
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}, [status, start, pause, reset]);
```

## Tema

Variaveis CSS (root data-theme):
- `--timer-bg`: bg principal
- `--timer-fg`: cor do texto/digitos
- `--timer-accent`: cor do CTA primario

Toggle via `document.documentElement.dataset.theme = 'dark' | 'light'`. Persistir em `localStorage`.

## Edicao inline

Ao entrar em `EDITING`:
- Display vira `<input type="number">` com mesmo styling do display.
- Enter -> salva e volta para `STOPPED`.
- Esc -> cancela e volta para `STOPPED`.

```tsx
{status === TimerStatus.EDITING ? (
  <input
    type="number"
    autoFocus
    defaultValue={seconds}
    className="text-7xl font-mono font-bold tabular-nums bg-transparent w-64 text-center"
    onBlur={(e) => {
      const v = Number(e.currentTarget.value);
      if (v > 0) setSeconds(v);
      setStatus(TimerStatus.STOPPED);
    }}
    onKeyDown={(e) => {
      if (e.key === 'Enter') e.currentTarget.blur();
      if (e.key === 'Escape') setStatus(TimerStatus.STOPPED);
    }}
  />
) : (
  <div>{formatTime(seconds)}</div>
)}
```

## Eventos customizados

Dispatch quando timer termina:
```ts
window.dispatchEvent(new CustomEvent('timer:done', { detail: { duration } }));
```

Componentes ouvem:
```ts
useEffect(() => {
  const handler = (e: Event) => {
    const evt = e as CustomEvent<{ duration: number }>;
    // mostrar toast, tocar som, etc
  };
  window.addEventListener('timer:done', handler);
  return () => window.removeEventListener('timer:done', handler);
}, []);
```

## Som ao terminar (opcional)

Web Audio API simples — sem precisar arquivo:
```ts
function beep(frequency = 800, duration = 200) {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = frequency;
  osc.start();
  setTimeout(() => { osc.stop(); ctx.close(); }, duration);
}
```

## Estados visuais (UI guardrails)

- **Loading**: nao aplicavel (timer e estado puro).
- **Empty**: tempo zerado mostra `00:00` mas botao Iniciar disabled.
- **Error**: nao deve haver erro em runtime — se houver, fallback para reset.
- **Running indicator**: Lucide `Activity` pulsando ou borda do display animada.

## Anti-patterns

- `setInterval` sem cleanup -> memory leak.
- Restaurar status RUNNING do localStorage -> timer fantasma.
- Sem `tabular-nums` -> digitos pulam visualmente.
- Sem atalho de teclado -> mau UX em uso intensivo.
- Emoji nos botoes -> usar Lucide.
- Sem dispatch de evento ao terminar -> componentes externos nao reagem.

## Reuso no G-OS

`gos-master` reconhece pedidos:
- "timer", "contador regressivo", "countdown"
- "pomodoro", "pomodoro timer"
- "code kata timer", "kata"
- "stopwatch" (variacao — countup vs countdown)

Aciona skill `timer-component-pattern` que aplica spec acima.
