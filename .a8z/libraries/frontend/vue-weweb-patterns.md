# Vue / WeWeb Patterns Library

Reference de padroes para Vue 3 (Composition API) e WeWeb custom components.

---

## Part 1: Vue 3 Composition API

### Feature Module Structure

```
src/
  features/
    orders/
      components/
        OrderList.vue
        OrderForm.vue
        OrderCard.vue
      composables/
        useOrders.ts
        useOrderActions.ts
      services/
        orderService.ts
      stores/
        orderStore.ts       # Pinia store
      types.ts
      index.ts              # Public API
```

### Composable Pattern (Vue equivalent of React hooks)

```ts
// features/orders/composables/useOrders.ts
import { ref, computed, watchEffect, type Ref } from 'vue';
import { orderService } from '../services/orderService';
import type { Order, OrderFilters } from '../types';

export function useOrders(filters?: Ref<OrderFilters>) {
  const orders = ref<Order[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchOrders() {
    loading.value = true;
    error.value = null;
    try {
      orders.value = await orderService.list(filters?.value);
    } catch (e: any) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  // Auto-refetch when filters change
  if (filters) {
    watchEffect(() => {
      if (filters.value) fetchOrders();
    });
  } else {
    fetchOrders();
  }

  const isEmpty = computed(() => !loading.value && orders.value.length === 0);

  return {
    orders: computed(() => orders.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    isEmpty,
    refetch: fetchOrders,
  };
}
```

### Service Layer

```ts
// services/httpClient.ts
import axios from 'axios';

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

httpClient.interceptors.response.use(
  (res) => res.data,
  (error) => {
    const message = error.response?.data?.message || 'Erro inesperado';
    return Promise.reject(new Error(message));
  }
);
```

```ts
// features/orders/services/orderService.ts
import { httpClient } from '@/services/httpClient';
import type { Order, CreateOrderDTO, OrderFilters } from '../types';

export const orderService = {
  list: (filters?: OrderFilters) =>
    httpClient.get<Order[]>('/orders', { params: filters }),

  getById: (id: string) =>
    httpClient.get<Order>(`/orders/${id}`),

  create: (data: CreateOrderDTO) =>
    httpClient.post<Order>('/orders', data),

  updateStatus: (id: string, status: string) =>
    httpClient.patch<Order>(`/orders/${id}/status`, { status }),
};
```

### Pinia Store (Global State)

```ts
// features/auth/stores/authStore.ts
import { defineStore } from 'pinia';
import { authService } from '../services/authService';
import type { User } from '../types';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
  },

  actions: {
    async login(credentials: { email: string; password: string }) {
      this.loading = true;
      try {
        const { user, token } = await authService.login(credentials);
        this.user = user;
        localStorage.setItem('token', token);
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.user = null;
      localStorage.removeItem('token');
    },
  },
});
```

### Component Pattern (script setup)

```vue
<!-- features/orders/components/OrderList.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { useOrders } from '../composables/useOrders';
import OrderCard from './OrderCard.vue';
import type { OrderFilters } from '../types';

const filters = ref<OrderFilters>({ status: 'active' });
const { orders, loading, isEmpty, refetch } = useOrders(filters);
</script>

<template>
  <div class="space-y-4">
    <div class="flex gap-2">
      <select v-model="filters.status">
        <option value="active">Active</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>

    <div v-if="loading" class="animate-pulse">Loading...</div>

    <div v-else-if="isEmpty" class="text-center py-8 text-gray-500">
      No orders found
    </div>

    <div v-else class="grid gap-4">
      <OrderCard
        v-for="order in orders"
        :key="order.id"
        :order="order"
        @updated="refetch"
      />
    </div>
  </div>
</template>
```

### Presentation vs Container (Vue style)

```vue
<!-- Presentation: OrderCard.vue — pure props + emits -->
<script setup lang="ts">
import type { Order } from '../types';

defineProps<{ order: Order }>();
defineEmits<{ updated: [] }>();
</script>

<template>
  <div class="rounded-lg border p-4">
    <h3>{{ order.title }}</h3>
    <p>{{ order.status }}</p>
    <button @click="$emit('updated')">Refresh</button>
  </div>
</template>
```

```vue
<!-- Container: OrderCardContainer.vue — wires data -->
<script setup lang="ts">
import { useOrder, useUpdateOrder } from '../composables/useOrders';
import OrderCard from './OrderCard.vue';

const props = defineProps<{ orderId: string }>();
const { order, loading } = useOrder(props.orderId);
const { update } = useUpdateOrder();

async function handleUpdate() {
  await update(props.orderId, { status: 'completed' });
}
</script>

<template>
  <div v-if="loading">Loading...</div>
  <OrderCard v-else-if="order" :order="order" @updated="handleUpdate" />
</template>
```

---

## Part 2: WeWeb Custom Components

### Platform Architecture

WeWeb compiles Vue.js 3 applications with automatic prerendering for SEO and CDN hosting. Custom components are standard Vue components enhanced with special props for WeWeb Editor communication.

**Component types:**
- **Elements**: Reusable blocks that can nest within sections or other elements. Support repetition and nesting.
- **Sections**: Standalone large blocks that cannot nest within other components. Greater layout control as direct page children.

**Dual context model:** Components run in Editor mode (content editable, DB persistence on change) and Front mode (content changes only via dynamic binding).

### Project Setup

```bash
# Create new component
npm init @weweb/component my-component -- --type element

# Or section
npm init @weweb/component my-section -- --type section

cd my-component
npm install
npm run serve    # Dev on port 8080
```

For standalone local development (without WeWeb editor upload), use:
- `libraries/frontend/weweb-local-dev.md`

**Requirements:**
- Node.js >= 18
- Vue 3 provided by WeWeb — DO NOT add as dependency
- Accept SSL cert at `https://localhost:8080` before loading in editor

### File Structure

```
my-component/
  src/
    wwElement.vue          # Main component (required name for elements)
    wwSection.vue          # Main component (required name for sections)
    components/            # Sub-components
      InnerPart.vue
    composables/           # Local composables
      useComponentLogic.ts
  ww-config.js             # Properties, actions, events
  package.json
```

### package.json — Rules

```json
{
  "name": "my-component",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "serve": "weweb serve",
    "build": "weweb build"
  },
  "devDependencies": {
    "@weweb/cli": "latest",
    "sass": "^1.77.0"
  },
  "dependencies": {
    "lucide-vue-next": "^0.575.0"
  }
}
```

**CRITICAL package.json rules:**

| Rule | Why |
|------|-----|
| `@weweb/cli: "latest"` | Garante compatibilidade. Versao fixa pode quebrar |
| `sass` em devDependencies | WeWeb usa sass-loader para processar TODO CSS (mesmo CSS puro) |
| Apenas deps npm publicas | WeWeb nao tem acesso a registries privados — `npm install` falha silenciosamente |
| NO `"type": "module"` | Nenhum componente funcional usa; pode quebrar o build |
| NO `name=` ou `type=` args no build | Breaks drag & drop |
| NO `vue` em dependencies | Vue ja e fornecido pelo WeWeb |
| Name sem "weweb" ou "ww" | Proibido pela plataforma |
| Versoes especificas para deps de producao | Nao use "latest" em dependencies (apenas em devDependencies do CLI) |
| NO build config files | webpack.config.js, vite.config.js, .babelrc, tsconfig.json sao PROIBIDOS |

---

### NON-NEGOTIABLE RULES (from official docs)

Estas regras sao inegociaveis. Violar qualquer uma causa falha catastrofica do componente.

#### Rule 1: Optional Chaining para TODOS os acessos a content

Todas as referencias a `props.content` DEVEM usar optional chaining para prevenir crashes:

```javascript
// CORRETO
const value = props.content?.propertyName || 'default'
const items = computed(() => props.content?.data || [])

// ERRADO — crash se content for undefined durante inicializacao
const value = props.content.propertyName
```

#### Rule 2: Editor Code Blocks devem ter par

Todo `/* wwEditor:start */` DEVE ter um `/* wwEditor:end */` correspondente. Tags descasadas causam **falha catastrofica**. Estes blocos sao removidos no build de producao.

```javascript
props: {
  uid: { type: String, required: true },
  content: { type: Object, required: true },
  /* wwEditor:start */
  wwEditorState: { type: Object, required: true },
  /* wwEditor:end */
}
```

#### Rule 3: Acesso Global via wwLib

**NUNCA** acesse `document` ou `window` diretamente. Use:

```javascript
// CORRETO
const doc = wwLib.getFrontDocument()
const win = wwLib.getFrontWindow()

// ERRADO — quebra isolamento do componente
document.querySelector('.my-class')
window.addEventListener('resize', handler)
```

#### Rule 4: Root Element sem dimensoes fixas

O root element NAO pode ter width/height hardcoded. Deve adaptar fluidamente ao tamanho definido pelo usuario. Elementos internos podem ter dimensoes fixas.

#### Rule 5: Reatividade de props.content (CRITICO)

Todas as propriedades de `props.content` devem ser totalmente reativas. Use `computed()` para dados derivados, **NUNCA** `ref()` ou `reactive()`:

```javascript
// ERRADO — perde reatividade quando content muda no editor
const internalData = ref([])
watch(() => props.content?.data, (newVal) => {
  internalData.value = newVal
})

// CORRETO — sempre reativo
const internalData = computed(() => props.content?.data || [])
```

#### Rule 6: Watch completo para reinicializacao

Quando o componente precisa de reinicializacao, watch TODAS as properties que afetam a renderizacao:

```javascript
watch(() => [
  props.content?.theme,
  props.content?.size,
  props.content?.layout,
  props.content?.perLine,
  props.content?.customData,
  // TODA prop que muda o output visual
], () => {
  setTimeout(() => {
    if (containerRef.value) reinitializeComponent()
  }, 50)
}, { deep: true })
```

Properties ausentes do watch = experiencia quebrada no editor.

---

### wwElement.vue — Template Completo (Dual Script Pattern)

Este e o padrao recomendado: dois `<script>` blocks. O primeiro para metadata WeWeb (Options API), o segundo para logica (Composition API).

```vue
<template>
  <div class="my-element" :style="dynamicStyles">
    <!-- Editor placeholder -->
    <!-- wwEditor:start -->
    <div v-if="!hasContent" class="editor-placeholder">
      <span>My Component</span>
      <small>Configure via settings panel</small>
    </div>
    <!-- wwEditor:end -->

    <!-- Actual content -->
    <div v-if="hasContent">
      <h1>{{ title }}</h1>
      <p>{{ description }}</p>
      <InnerPart
        v-for="item in items"
        :key="item.id"
        :item="item"
        @click="handleItemClick(item)"
      />
    </div>
  </div>
</template>

<!-- Block 1: Metadata WeWeb (Options API) -->
<script>
export default {
  name: 'MyElement',

  // REQUIRED: Must contain ALL properties from ww-config.js
  wwDefaultContent: {
    title: 'My Title',
    description: 'Description text',
    textColor: '#000000',
    backgroundColor: '#ffffff',
    data: [],
  },
}
</script>

<!-- Block 2: Logic (Composition API) -->
<script setup>
import { computed, watch, ref, onMounted } from 'vue';
import InnerPart from './components/InnerPart.vue'; // auto-registered

const props = defineProps({
  content: { type: Object, default: () => ({}) },
  uid: { type: String, default: '' },
  /* wwEditor:start */
  wwEditorState: { type: Object, default: () => ({}) },
  /* wwEditor:end */
});

const emit = defineEmits(['trigger-event']);

// --- Reactive computed from content (NEVER use ref for content data) ---
const title = computed(() => props.content?.title || 'My Title');
const description = computed(() => props.content?.description || '');
const items = computed(() => props.content?.data || []);
const hasContent = computed(() => items.value.length > 0);

// --- CSS variables via computed ---
const dynamicStyles = computed(() => ({
  '--text-color': props.content?.textColor || '#000000',
  '--bg-color': props.content?.backgroundColor || '#ffffff',
}));

// --- Internal state (OK to use ref for component-only state) ---
const selectedItem = ref(null);

// --- Event handlers ---
function handleItemClick(item) {
  selectedItem.value = item;
  emit('trigger-event', {
    name: 'item:click',
    event: { item, index: items.value.indexOf(item) },
  });
}
</script>

<style scoped>
.my-element {
  display: inline-block;
  min-width: 100px;
  min-height: 50px;
  color: var(--text-color);
  background: var(--bg-color);
  /* NO padding, margin on root — Editor manages these */
  /* NO hardcoded width/height on root */
}

/* wwEditor:start */
.editor-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
  background: #f3f4f6;
  border: 2px dashed #9ca3af;
  border-radius: 8px;
}

.editor-placeholder span { font-size: 14px; font-weight: 600; color: #374151; }
.editor-placeholder small { font-size: 12px; color: #9ca3af; }
/* wwEditor:end */
</style>
```

**Vantagens do dual-script pattern `<script>` + `<script setup>`:**
- Imports de componentes sao **auto-registrados** (nao precisa de `components: {}`)
- Refs/computed/functions sao **auto-expostos** ao template (nao precisa de `return {}`)
- Props sao **automaticamente reativos** (nao precisa de `toRef`)
- Codigo mais limpo (~90 linhas a menos vs Options API puro)

**Script patterns suportados pelo WeWeb (todos funcionam):**
1. `<script>` + `<script setup>` (RECOMENDADO — dual-script)
2. Options API puro com `data()`/`methods`
3. `defineComponent()` com `setup()`

**NUNCA converta `<script setup>` para Options API sem necessidade.** O WeWeb suporta ambos. Se converter, problemas comuns:
- `content: props.content` no `return` cria referencia nao-reativa que sombra a prop
- `return {}` manual com 80+ variaveis e propenso a erros
- `components: {}` explicito necessario (em `<script setup>`, auto-registro)

### Critical Rules

| Rule | Why |
|------|-----|
| `wwDefaultContent` with ALL props | Props won't show in Editor without it |
| Optional chaining em `props.content?.` | Previne crash durante inicializacao |
| `/* wwEditor:start/end */` pareados | Tags descasadas = falha catastrofica |
| `wwLib.getFrontDocument/Window()` | Acesso direto a document/window quebra isolamento |
| `computed()` para dados de content | `ref()` perde reatividade quando content muda |
| NO `position: fixed` on root | Breaks drag & drop |
| NO hardcoded width/height on root | Deve adaptar ao tamanho do usuario |
| Define `min-width`/`min-height` | Allows selection in Editor |
| Single root element | No fragments |
| Avoid `padding`, `margin` on root | Managed by Editor |
| Keep `content` flat | Better WeWeb compatibility |
| NO `name` in ww-config.js root | Breaks drag & drop |

---

### ww-config.js — Complete Reference

```javascript
export default {
  // NO "name" property here!

  editor: {
    label: { en: 'My Component', pt: 'Meu Componente' },
    icon: 'table',  // Lucide icon name
  },

  properties: {
    // --- Text ---
    title: {
      label: { en: 'Title', pt: 'Titulo' },
      type: 'Text',
      defaultValue: 'My Title',
      bindable: true,
      section: 'settings',
    },

    // --- Color ---
    textColor: {
      label: { en: 'Text Color' },
      type: 'Color',
      defaultValue: '#000000',
      section: 'style',
      bindable: true,
    },

    // --- Number ---
    maxItems: {
      label: { en: 'Max Items' },
      type: 'Number',
      defaultValue: 10,
      options: { min: 1, max: 100, step: 1 },
    },

    // --- Length (with units) ---
    fontSize: {
      label: { en: 'Font Size' },
      type: 'Length',
      defaultValue: '16px',
      responsive: true,  // Different per breakpoint
      options: {
        unitChoices: [
          { value: 'px', label: 'px', min: 1, max: 100 },
          { value: 'em', label: 'em', min: 0.1, max: 10 },
        ],
      },
    },

    // --- Dropdown (ATENCAO: estrutura nested obrigatoria) ---
    variant: {
      label: { en: 'Variant' },
      type: 'TextSelect',
      defaultValue: 'default',
      section: 'settings',
      bindable: true,
      options: {
        options: [
          { value: 'default', label: 'Default' },
          { value: 'compact', label: 'Compact' },
          { value: 'expanded', label: 'Expanded' },
        ],
      },
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Valid values: default | compact | expanded',
      },
      /* wwEditor:end */
    },

    // --- Toggle ---
    showHeader: {
      label: { en: 'Show Header' },
      type: 'OnOff',
      defaultValue: true,
    },

    // --- Bindable Array (data source) ---
    data: {
      label: { en: 'Data Source' },
      type: 'Array',
      section: 'settings',
      bindable: true,
      defaultValue: [],
      options: {
        expandable: true,
        getItemLabel(item) {
          return item.name || item.label || `Item ${item.id}`
        },
        item: {
          type: 'Object',
          defaultValue: { id: 'item1', name: 'New Item' },
          options: {
            item: {
              id: { label: { en: 'ID' }, type: 'Text' },
              name: { label: { en: 'Name' }, type: 'Text' },
            },
          },
        },
      },
      /* wwEditor:start */
      bindingValidation: { type: 'array', tooltip: 'Array of objects with id and name' },
      /* wwEditor:end */
    },

    // --- Formula (field mapping for bound arrays) ---
    dataNameFormula: {
      label: { en: 'Name Field' },
      type: 'Formula',
      section: 'settings',
      options: content => ({
        template: Array.isArray(content.data) && content.data.length > 0
          ? content.data[0]
          : null,
      }),
      defaultValue: { type: 'f', code: "context.mapping?.['name']" },
      hidden: (content, sidepanelContent, boundProps) =>
        !Array.isArray(content.data) ||
        !content.data?.length ||
        !boundProps.data,
    },

    // --- Hidden (internal) ---
    internalConfig: {
      hidden: true,
      defaultValue: {},
    },

    // --- Dropzone ---
    headerSlot: {
      hidden: true,
      defaultValue: [],
      /* wwEditor:start */
      bindingValidation: { type: 'array' },
      /* wwEditor:end */
    },

    // --- Multi-language ---
    emptyMessage: {
      label: { en: 'Empty Message' },
      type: 'Text',
      defaultValue: 'No data',
      multiLang: true,
      bindable: true,
    },

    // --- Conditional visibility ---
    advancedOption: {
      label: { en: 'Advanced Option' },
      type: 'Text',
      defaultValue: '',
      hidden: content => !content?.showAdvanced,
    },
  },

  // Actions callable from WeWeb Workflows
  actions: [
    {
      label: 'Refresh Data',
      action: 'refreshData',
      args: [],
    },
    {
      label: 'Set Filter',
      action: 'setFilter',
      args: [
        { name: 'column', type: 'text', bindable: true },
        { name: 'value', type: 'text', bindable: true },
      ],
    },
  ],

  // Trigger Events emitted to WeWeb Workflows
  triggerEvents: [
    {
      name: 'row:click',
      label: { en: 'On Row Click' },
      event: { row: {}, index: 0 },
    },
    {
      name: 'data:loaded',
      label: { en: 'On Data Loaded' },
      event: { count: 0 },
    },
    {
      name: 'error',
      label: { en: 'On Error' },
      event: { message: '', code: '' },
    },
  ],
};
```

**TextSelect — formato OBRIGATORIO (nested options):**

```javascript
// ERRADO — dropdown nao exibe opcoes
mySelect: {
  type: 'TextSelect',
  options: { value1: 'Label 1', value2: 'Label 2' }
}

// CORRETO — estrutura nested obrigatoria
mySelect: {
  label: { en: 'Select Option' },
  type: 'TextSelect',
  section: 'settings',
  options: {
    options: [
      { value: 'value1', label: 'Label 1' },
      { value: 'value2', label: 'Label 2' },
    ]
  },
  defaultValue: 'value1',
  bindable: true,
  /* wwEditor:start */
  bindingValidation: {
    type: 'string',
    tooltip: 'Valid values: value1 | value2',
  },
  /* wwEditor:end */
}
```

---

### Internal Variables (wwLib.wwVariable)

Para componentes interativos que precisam manter estado compartilhavel com workflows do WeWeb:

```javascript
// No <script setup>
const { value: internalValue, setValue: setInternalValue } =
  wwLib.wwVariable.useComponentVariable({
    uid: props.uid,
    name: 'value',
    type: 'string',
    defaultValue: 'default value',
  })

// Watch initialValue e reset internal variable
watch(() => props.content?.initialValue, (newValue) => {
  if (newValue !== undefined) {
    setInternalValue(newValue)
  }
}, { immediate: true })

// Emit trigger event on value change
const handleValueChange = (newValue) => {
  if (internalValue.value !== newValue) {
    setInternalValue(newValue)
    emit('trigger-event', {
      name: 'value-change',
      event: { value: newValue },
    })
  }
}
```

### Formula Processing (resolveMappingFormula)

Para processar arrays com field mapping dinamico:

```javascript
const processedItems = computed(() => {
  const items = props.content?.data || []
  const { resolveMappingFormula } = wwLib.wwFormula.useFormula()

  return items.map(item => {
    const name = resolveMappingFormula(
      props.content?.dataNameFormula,
      item
    ) ?? item.name

    return {
      id: item.id || `item-${Date.now()}-${Math.random()}`,
      name: name || 'Untitled',
      originalItem: item,
      ...item,
    }
  })
})
```

---

### Dropzones (wwLayout)

**Configuracao no ww-config.js:**

```javascript
dropzoneContent: {
  hidden: true,
  defaultValue: [],
  /* wwEditor:start */
  bindingValidation: { type: 'array' },
  /* wwEditor:end */
},

showDropzone: {
  label: { en: 'Show Dropzone' },
  type: 'OnOff',
  section: 'settings',
  defaultValue: true,
},

dropzoneHeight: {
  label: { en: 'Dropzone Height' },
  type: 'Length',
  section: 'style',
  defaultValue: '80px',
  hidden: content => !content?.showDropzone,
},
```

**Template:**

```vue
<!-- Simple dropzone -->
<wwLayout path="headerSlot" direction="column" class="header-zone" />

<!-- Conditional dropzone -->
<div v-if="content?.showDropzone" class="dropzone-area">
  <wwLayout
    path="dropzoneContent"
    direction="row"
    class="dropzone-container"
  />
</div>

<!-- Repeatable dropzone (binds to collection) -->
<wwLayout path="cards" direction="row" class="cards-zone">
  <template v-slot="{ item }">
    <wwLayoutItem class="card-item">
      <wwObject v-bind="item" />
    </wwLayoutItem>
  </template>
</wwLayout>
```

```scss
// REQUIRED: min-height for dropzones to allow dropping
.header-zone {
  min-height: 20px;
  display: flex;
  flex-direction: column;
}

.dropzone-area {
  border: 2px dashed #d0d0d0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  transition: all 0.2s ease;
}

/* wwEditor:start */
.dropzone-area:hover {
  border-color: #007aff;
  background: rgba(0, 122, 255, 0.05);
}
/* wwEditor:end */

.dropzone-container:empty::after {
  content: 'Drop content here';
  color: #999;
  font-style: italic;
}
```

For repeatable dropzones, use `bindable: 'repeatable'` in ww-config:

```javascript
cards: {
  hidden: true,
  bindable: 'repeatable',
  defaultValue: [],
},
```

---

### Nested Elements (wwElement)

```javascript
// ww-config.js — element created on instantiation
titleElement: {
  hidden: true,
  defaultValue: { isWwObject: true, type: 'ww-text' },
},
```

```vue
<!-- Render nested element, force text via computed -->
<wwElement v-bind="content.titleElement" :ww-props="{ text: computedTitle }" />
```

---

### Trigger Events — Correct Pattern

```javascript
// CORRECT — <script setup> pattern
emit('trigger-event', {
  name: 'row:click',               // Must match triggerEvents name
  event: { row: data, index: i },  // Must match event schema
});

// CORRECT — Options API pattern
this.$emit('trigger-event', {
  name: 'row:click',
  event: { row: data, index: i },
});

// WRONG — this won't trigger WeWeb workflows
this.$emit('row:click', data);  // Regular Vue emit, not WeWeb trigger
emit('row:click', data);        // Same problem in script setup
```

Ensure event data matches schema exactly. Missing fields = empty values in workflow.

---

### CSS Variables for Reactivity

```vue
<script setup>
const dynamicStyles = computed(() => ({
  '--primary-color': props.content?.primaryColor || '#fff',
  '--animation-speed': props.content?.speed || 1,
  '--gap-size': props.content?.gap || '8px',
}))
</script>

<template>
  <div :style="dynamicStyles" class="component">
    <slot />
  </div>
</template>

<style scoped>
.component {
  color: var(--primary-color);
  gap: var(--gap-size);
}

/* Animations with CSS variables */
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animated {
  animation: rotate calc(10s / var(--animation-speed)) linear infinite;
  will-change: transform;
}
</style>
```

**Performance de animacao:** Use `transform` e `opacity` para animacoes. Adicione `will-change` para elementos animados.

---

### Multi-Page Sections (Reuse Pattern)

To reuse a configured component across pages:

1. Configure component inside a Section on page A
2. Rename the Section clearly (e.g., "CookieConsent - Main")
3. On page B: Add > Multi-page sections > find the Section
4. Choose **"Create an instance"** (NOT copy)
5. Changes to any instance reflect in all instances

---

### CSS Best Practices for WeWeb

```vue
<template>
  <div :style="cssVars" class="component">
    <!-- NEVER position: fixed on root -->
    <div class="fixed-container">
      <!-- Fixed content goes here -->
    </div>
  </div>
</template>

<style scoped>
.component {
  display: inline-block;
  min-width: 100px;
  min-height: 50px;
  /* NO padding, margin on root (Editor manages these) */
  /* NO hardcoded width/height on root */

  /* Use CSS variables from content */
  background: var(--bg-color);
  color: var(--text-color);
}

.fixed-container {
  position: fixed;
  z-index: 9999;
}

/* Responsive */
@media (max-width: 768px) {
  .component {
    min-width: 100%;
  }
}
</style>
```

**Avoid `lang="scss"` se nao precisar** — se usar, garanta `sass` em devDependencies. O webpack do WeWeb usa sass-loader para processar TODOS os `<style>` tags (mesmo CSS puro quando sass-loader esta presente).

---

### Build & Deploy

```bash
# Local development
npm run serve              # Default port 8080
npm run serve -- port=4040 # Custom port

# Build (no args!)
npm run build
```

**HTTPS:** O dev server usa HTTPS. Authorize o certificado:
1. Navegue ate `https://localhost:8080`
2. "Advanced" > "Continue to localhost"
3. Chrome: habilite `chrome://flags` > "Allow invalid certificates for resources loaded from localhost"

**Load in Editor:**
1. Dev > Open Dev Editor
2. Dev > Add local Element (port 8080)
3. Accept SSL cert
4. Drag from "Local Elements" to page

**NOTA:** Durante dev, autosave fica desabilitado (componente pode estar inconsistente). Salve manualmente antes de refresh.

**Publish:**
1. Push to GitHub
2. Dashboard > Coded components > Import element
3. Select repo + branch > wait for build
4. Set active version
5. In Editor: Add > Coded components > drag

**Update:** Bump version in package.json > push > change active version in Dashboard.

---

### Common Property Types Reference

| Type | Example | Notes |
|------|---------|-------|
| `Text` | `{ type: 'Text', bindable: true, defaultValue: 'Default' }` | Texto simples |
| `Color` | `{ type: 'Color', defaultValue: '#ffffff', bindable: true }` | Color picker |
| `Number` | `{ type: 'Number', options: { min: 0, max: 100, step: 1 } }` | Com range |
| `OnOff` | `{ type: 'OnOff', defaultValue: true }` | Toggle boolean |
| `Length` | `{ type: 'Length', defaultValue: '16px' }` | Com unidades (px, em, %) |
| `TextSelect` | `{ type: 'TextSelect', options: { options: [...] } }` | **Nested options obrigatorio** |
| `Array` | `{ type: 'Array', bindable: true, options: { expandable: true } }` | Com getItemLabel |
| `Formula` | `{ type: 'Formula', options: content => ({...}) }` | Field mapping |
| `Object` | `{ type: 'Object', defaultValue: {} }` | Nested config |

---

### Pre-Publish Checklist

**Dependencias:**
- [ ] `@weweb/cli: "latest"` em devDependencies
- [ ] `sass` em devDependencies (se usar qualquer CSS)
- [ ] ZERO pacotes npm privados (@scope/...)
- [ ] NO `"type": "module"` no package.json
- [ ] NO build config files (webpack, vite, babel, tsconfig)

**Componente:**
- [ ] `wwDefaultContent` has ALL properties from ww-config.js
- [ ] Optional chaining (`?.`) em TODOS os acessos a `props.content`
- [ ] `/* wwEditor:start/end */` blocos pareados
- [ ] `wwLib.getFrontDocument/Window()` em vez de document/window direto
- [ ] `computed()` para dados derivados de content (nunca `ref()`)
- [ ] Root element sem width/height fixo
- [ ] `min-width`/`min-height` definidos no root
- [ ] Single root element (no fragments)
- [ ] NO `position: fixed` on root
- [ ] NO `padding`/`margin` on root

**Config:**
- [ ] No `name` in root of ww-config.js
- [ ] Labels in EN and PT
- [ ] TextSelect com estrutura nested `options: { options: [...] }`
- [ ] `bindingValidation` dentro de `/* wwEditor:start/end */`
- [ ] Actions have clear argument placeholders
- [ ] triggerEvents documented with correct schema

**Build:**
- [ ] Build local passa (`npx weweb serve` sem ERRORs)
- [ ] No `name=`/`type=` args no build script
- [ ] Version bumped no package.json
- [ ] Responsive tested (desktop + mobile)
- [ ] Tested in WeWeb Editor (Dev Editor)
