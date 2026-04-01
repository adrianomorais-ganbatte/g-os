# Tailwind CSS — guia rápido

> **Tailwind CSS** é um framework CSS utility-first que oferece classes de baixo nível para construir designs customizados rapidamente ([https://tailwindcss.com](https://tailwindcss.com))

## Quando usar
* Desenvolvimento rápido sem escrever CSS customizado
* Projetos que precisam de design system consistente
* Times que valorizam utility classes ao invés de componentes CSS
* Aplicações que requerem responsividade out-of-the-box

## Instalação
```bash
# npm
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Vite
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Next.js
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## Configuração

### tailwind.config.js
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

### CSS principal
```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom styles */
@layer components {
  .btn-primary {
    @apply bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded;
  }
}
```

### Layout e containers
```jsx
function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold">App Name</h1>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-600 hover:text-gray-900">Home</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">About</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Content */}
        </div>
      </main>
    </div>
  )
}
```

### Componentes comuns
```jsx
// Card component
function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {children}
    </div>
  )
}

// Button variants
function Buttons() {
  return (
    <div className="space-x-4">
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Primary
      </button>
      <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
        Outline
      </button>
      <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
        Secondary
      </button>
    </div>
  )
}
```

### Responsividade
```jsx
function ResponsiveGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {/* Breakpoints:
          sm: 640px
          md: 768px
          lg: 1024px
          xl: 1280px
          2xl: 1536px
      */}
      {items.map(item => (
        <div key={item.id} className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
          <p className="text-gray-600 text-sm md:text-base">{item.description}</p>
        </div>
      ))}
    </div>
  )
}
```

### Dark mode
```jsx
// Ativar dark mode no config
module.exports = {
  darkMode: 'class', // ou 'media'
  // ...
}

// Usar no componente
function DarkModeExample() {
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold">
        Título que muda com o tema
      </h1>
      <button className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded">
        Botão responsivo ao tema
      </button>
    </div>
  )
}
```

### Utilities mais usadas
```jsx
// Spacing: p-4 (padding), m-4 (margin), space-x-4 (gap horizontal)
// Colors: bg-blue-500, text-red-600, border-gray-300
// Typography: text-xl, font-bold, text-center
// Layout: flex, grid, hidden, block
// Sizing: w-full, h-screen, max-w-md
// Effects: shadow-lg, rounded-lg, opacity-50
```

---

## Tailwind CSS v4 — Novidades

### Instalacao v4

```bash
npm install tailwindcss @tailwindcss/vite
# ou para Next.js:
npm install tailwindcss @tailwindcss/next
```

### Nova sintaxe de import

```css
/* Antes (v3) */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Agora (v4) */
@import "tailwindcss";
```

### @theme — CSS Variables como fonte de verdade

Em v4, o tema eh definido diretamente em CSS com `@theme`:

```css
/* src/styles/globals.css */
@import "tailwindcss";

@theme {
  --color-surface: hsl(0 0% 100%);
  --color-surface-raised: hsl(0 0% 98%);

  --color-foreground: hsl(240 10% 3.9%);
  --color-foreground-subtle: hsl(240 3.8% 46.1%);
  --color-muted-foreground: hsl(240 3.8% 46.1%);

  --color-primary: hsl(240 5.9% 10%);
  --color-primary-foreground: hsl(0 0% 98%);

  --color-secondary: hsl(240 4.8% 95.9%);
  --color-secondary-foreground: hsl(240 5.9% 10%);

  --color-muted: hsl(240 4.8% 95.9%);
  --color-border: hsl(240 5.9% 90%);
  --color-input: hsl(240 5.9% 90%);
  --color-ring: hsl(240 5.9% 10%);

  --color-destructive: hsl(0 84.2% 60.2%);
  --color-destructive-foreground: hsl(0 0% 98%);

  --font-sans: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
}
```

### Uso em componentes

```tsx
// As variaveis @theme geram classes Tailwind automaticamente
// --color-surface -> bg-surface, text-surface, border-surface

function Card() {
  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm">
      <h2 className="text-foreground font-semibold">Titulo</h2>
      <p className="text-muted-foreground text-sm">Subtitulo</p>
    </div>
  )
}
```

### Dark mode em v4

```css
@theme {
  --color-surface: hsl(0 0% 100%);
  --color-foreground: hsl(240 10% 3.9%);
}

/* Via classe .dark */
.dark {
  --color-surface: hsl(240 10% 3.9%);
  --color-foreground: hsl(0 0% 98%);
}

/* Ou via media query */
@media (prefers-color-scheme: dark) {
  :root {
    --color-surface: hsl(240 10% 3.9%);
    --color-foreground: hsl(0 0% 98%);
  }
}
```

### Sem tailwind.config.js em v4

Em v4, `tailwind.config.js` eh opcional. A configuracao vai direto no CSS com `@theme`. Para projetos novos, prefira `@theme` no CSS.

### Migracao v3 -> v4

| v3 | v4 |
|----|----|
| `@tailwind base/components/utilities` | `@import "tailwindcss"` |
| `theme.extend.colors` no config | `@theme { --color-* }` |
| `tailwind.config.js` | Opcional (pode usar CSS-only) |
| `postcss.config.js` | Substituido por plugin Vite/Next |
| `darkMode: 'class'` no config | Override de CSS variables em `.dark` |