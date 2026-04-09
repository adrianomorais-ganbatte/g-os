# ADR-005: Mulish como font family do Design System

**Status:** Aceita
**Data:** 2026-03-30
**Decisores:** Time Fractus (validado no Figma DS)

## Contexto

O Design System oficial no Figma (`Testes-DS-Fractus`) define a tipografia da plataforma. A spec v1 não especificava font family; o protótipo usava a fonte default do Tailwind (Inter/system).

## Decisão

Usar **Mulish** (Google Fonts) em 3 pesos: Regular (400), Medium (500), Semibold (600).

## Fonte da decisão

Extraído diretamente do Figma DS node `7087:36096` — header preenchido com código React+Tailwind que referencia `font-family: Mulish` em todos os elementos de texto.

## Especificação tipográfica

| Estilo | Fonte | Tamanho | Line height | Letter spacing |
|--------|-------|---------|-------------|----------------|
| Heading 3 | Mulish Semibold (600) | 24px | 28.8px | -1px |
| Paragraph small | Mulish Regular/Medium | 14px | 20px | — |
| Paragraph mini | Mulish Regular/Medium | 12px | 16px | — |

## Implementação

```tsx
// app/layout.tsx
import { Mulish } from 'next/font/google';

const mulish = Mulish({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mulish',
});

export default function RootLayout({ children }) {
  return (
    <html className={mulish.variable}>
      <body>{children}</body>
    </html>
  );
}
```

```css
/* tailwind.css */
@theme {
  --font-sans: var(--font-mulish), system-ui, sans-serif;
}
```

## Consequências

### Positivas
- Alinhamento pixel-perfect com o Figma DS
- `next/font/google` otimiza carregamento (self-hosted, zero CLS)
- 3 pesos cobrem toda a hierarquia tipográfica do DS

### Negativas
- Mulish é menos popular que Inter — devs podem não ter instalada localmente para preview

## Referências
- Figma DS: `Testes-DS-Fractus` node `7087:36096`
- `docs/prompts/start-projeto.md` seção "Tipografia"
