# AGENTS.md — agrojg-frontend

A pharmacy (farmácia) management SPA. Stack: React Router 7 (SPA mode) + shadcn/ui (Radix Mira) + Tailwind CSS v4 + TypeScript 6 + Vite 8.

---

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server (react-router dev) |
| `npm run build` | Production build → `build/client/` |
| `npm run start` | Serve production build (react-router-serve) |
| `npm run typecheck` | `react-router typegen && tsc` — order matters, run both |
| `npm run format` | Prettier across `*.ts,*.tsx` |
| `npx shadcn@latest add <component>` | Add shadcn components |

No test framework is installed. Validation = `npm run typecheck` only.

## Architecture

### SPA, no SSR
`react-router.config.ts` sets `ssr: false`. The app is a fully client-rendered SPA. No loaders/actions — data comes from local `data.json` files and API services via `app/lib/api/`.

### Routes (Portuguese)
Defined in `app/routes.ts`. All paths are in Portuguese:
- `/` (dashboard), `/categorias`, `/usuarios`, `/clientes`, `/fornecedores`, `/agentes`, `/produtos`, `/estoques`, `/login`, `/signup`

### Page pattern
Each route page follows the same template:
```tsx
import { SomeTable, schema } from "~/components/some/some-table"
import rawData from "../some/data.json"
const data = rawData as z.infer<typeof schema>[]

export default function SomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        ...h1...<SomeTable data={data} />
      </div>
    </div>
  )
}
```

### Data layer
Data comes from two sources:

1. **Static JSON** (being migrated): Domain directories with `data.json` files:
   `app/products/data.json`, `app/inventory/data.json`, `app/inventory/movements.json`, `app/clients/data.json`, etc.

2. **API services** (`app/lib/api/`): Unified HTTP client layer for the Rails backend at `VITE_API_URL`.
   - `client.ts` — fetch wrapper with JWT injection, typed responses, error handling
   - `types.ts` — shared TypeScript interfaces matching the OpenAPI spec
   - `auth.ts` — auth service (login, register, me, logout)
   - Services are extended per domain (agents, conversations, etc.)

### Component locations
| Directory | Contents |
|---|---|
| `app/components/ui/` | shadcn primitives (button, card, dialog, sidebar, table, etc.) |
| `app/components/shared/` | Reusable across domains (logo, data-table, theme-provider) |
| `app/components/layout/` | Navigation, sidebar, header (app-sidebar, site-header, nav-*) |
| `app/components/auth/` | Login, signup, auth-shell |
| `app/components/dashboard/` | Dashboard (charts, section-cards, low-stock) |
| `app/components/agents/` | AI agents (agents-table, ai-assistant-dialog) |
| `app/components/categories/` | Categories (categories-table) |
| `app/components/clients/` | Clients (clients-table) |
| `app/components/inventory/` | Inventory (inventory-table) |
| `app/components/invoices/` | Invoices (invoices-table) |
| `app/components/suppliers/` | Suppliers (suppliers-table) |
| `app/components/supplies/` | Supplies (supplies-table) |
| `app/components/users/` | Users (users-table) |
| `app/hooks/` | `use-mobile.ts`, `use-auth.tsx` (AuthProvider + useAuth) |
| `app/lib/` | `utils.ts` (just `cn()` function) |
| `app/lib/api/` | API client layer: `client.ts`, `types.ts`, `auth.ts`, `index.ts` |
| `app/routes/` | 11 page components |

**Organização por domínio:** Componentes de aplicação (não-shadcn) são organizados em subpastas por domínio. Cada pasta de domínio corresponde a uma área de funcionalidade e pode conter múltiplos componentes relacionados (tabela, formulário, diálogo, etc.). **Nunca coloque um componente solto na raiz de `app/components/`** — sempre dentro da subpasta de domínio apropriada. Se um novo domínio for criado, crie também sua subpasta em `app/components/`.

### Key imports
- Path alias: `~/*` → `./app/*`
- UI components: `import { Button } from "~/components/ui/button"`
- Util: `import { cn } from "~/lib/utils"`

### Typegen
React Router generates route types to `.react-router/types/`. The `typecheck` command runs `react-router typegen` first, then `tsc`. The generated types include `+routes.ts` with all route params.

### UI conventions
- shadcn Radix Mira style
- Tailwind CSS v4 CSS-first config in `app/app.css`
- Theme storage key: `pharmacy-ui-theme` (custom ThemeProvider, not next-themes)
- `"use client"` directive on interactive components (chart-area-interactive, login-form, section-cards, etc.)
- Container queries used (`@container/main`, `@xl/main:`, `@5xl/main:`)
- Lucide icons throughout
- Semantic CSS variables for colors (oklch)
- Inter Variable font via `@fontsource-variable/inter`

### Notable dependencies
- @tanstack/react-table: all data tables
- @dnd-kit/core/sortable/modifiers: drag-and-drop reordering in tables
- recharts: chart components
- zod: schema validation for table data
- sonner: toast notifications
- vaul: drawer components
- lucide-react: icons

### Dev tooling
- Prettier with `prettier-plugin-tailwindcss` (config in `.prettierrc`)
- `use client` directive used for components with `useState`/`useEffect` — but no framework-enforced RSC boundaries (SPA-only)

### Environment variables
- `VITE_API_URL` — backend API base URL (default: `http://localhost:3000`). Set in `.env` (copied from `.env.example`).
- All Vite env vars use the `VITE_` prefix and are typed via `vite/client` (included in `tsconfig.json` `types`).

### Build & deploy
- Docker: multi-stage build with `node:20-alpine`
- Static output in `build/client/` (index.html + assets)
- Dev server has a custom `ignoreWellKnown` Vite plugin that blocks `/.well-known/` requests

---
## API Consumption Patterns

Este projeto consome uma API Rails (`/api/v1/`) com JWT Bearer auth. Siga **rigorosamente** os padrões abaixo em toda implementação que envolva chamadas de API.

### 1. Service layer — adicionar novo domínio

Cada domínio da API tem seu próprio arquivo em `app/lib/api/`.

**Regras:**
- Use `apiGet`, `apiPost`, `apiPatch`, `apiDelete` do `client.ts` — nunca `fetch` direto
- O token JWT é injetado automaticamente pelo `client.ts` (via `localStorage`)
- Erros chegam como `ApiError` com `.status` e `.errors` (dicionário campo → mensagens)
- Tipos da resposta vão em `types.ts`

**Exemplo — adicionar service de agents:**

```tsx
// app/lib/api/agents.ts
import { apiGet, apiPost, apiPatch, apiDelete } from "./client"
import type { Agent } from "./types"

const AGENTS_PATH = "/api/v1/agents"

export const AgentsService = {
  async list(): Promise<Agent[]> {
    return apiGet<Agent[]>(AGENTS_PATH)
  },

  async get(id: string): Promise<Agent> {
    return apiGet<Agent>(`${AGENTS_PATH}/${id}`)
  },

  async create(data: { name: string; system_prompt: string; rules?: string; model?: string }): Promise<Agent> {
    return apiPost<Agent>(AGENTS_PATH, { agent: data })
  },

  async update(id: string, data: Partial<{ name: string; system_prompt: string; rules: string; model: string }>): Promise<Agent> {
    return apiPatch<Agent>(`${AGENTS_PATH}/${id}`, { agent: data })
  },

  async delete(id: string): Promise<void> {
    return apiDelete(`${AGENTS_PATH}/${id}`)
  },
}
```

**Depois exporte em** `app/lib/api/index.ts`:
```tsx
export { AgentsService } from "./agents"
```

### 2. Tipos da API — estender `types.ts`

```tsx
// app/lib/api/types.ts (dentro do arquivo existente)
export interface Agent {
  id: string
  name: string
  system_prompt: string
  rules: string | null
  model: string
  created_at: string
  updated_at: string
}
```

**Convenções de tipos:**
- Use `string` para UUIDs (não crie tipo UUID próprio)
- Use `| null` para campos opcionais que a API retorna como `null`
- Use `"active" | "archived"` para enums (union de literais)
- Requests bodies devem ser interfaces separadas (`LoginRequest`, `RegisterRequest`, etc.)

### 3. Consumir API em componentes

**Regras:**
- Use `useAuth()` para obter o usuário logado (quando precisar de contexto de auth)
- Use hooks `useState`/`useEffect` para dados assíncronos
- Capture `ApiError` para exibir erros amigáveis
- Use `"use client"` no topo do arquivo

**Exemplo — listar agents em uma página:**

```tsx
"use client"

import { useEffect, useState } from "react"
import { AgentsService, ApiError } from "~/lib/api"
import type { Agent } from "~/lib/api/types"

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    AgentsService.list()
      .then(setAgents)
      .catch((err) => {
        if (err instanceof ApiError) {
          setError(err.message)
        } else {
          setError("Erro ao carregar agentes.")
        }
      })
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <p>Carregando...</p>
  if (error) return <p className="text-destructive">{error}</p>

  return (
    <div>
      {agents.map((agent) => (
        <div key={agent.id}>{agent.name}</div>
      ))}
    </div>
  )
}
```

### 4. Auth — como usar

O `AuthProvider` já está no `root.tsx`. Use o hook em qualquer componente:

```tsx
import { useAuth } from "~/hooks/use-auth"

function MyComponent() {
  const { user, isAuthenticated, isLoading, login, register, logout } = useAuth()

  if (isLoading) return <p>Verificando sessão...</p>
  if (!isAuthenticated) return <p>Redirecionando para login...</p>

  return <p>Olá, {user.name}!</p>
}
```

**Regras de uso do `useAuth()`:**
- `login(email, password)` — lança `ApiError` se 401 ou erro de rede
- `register(data: RegisterRequest)` — lança `ApiError` se validação falhar
- `logout()` — limpa token e usuário, redirecionamento a cargo do componente
- `isLoading` = `true` durante validação do token no mount
- Token expirado → `logout()` automático → `isAuthenticated` = `false`

### 5. Proteção de rotas

O layout `app/routes/_layout.tsx` já protege as rotas aninhadas. **Não duplique a proteção** em páginas individuais. Se uma página precisar ser pública, coloque-a fora do layout (como `/login` e `/signup`).

```tsx
// app/routes.ts
export default [
  route("", "routes/_layout.tsx", [
    // Todas protegidas por auth
    index("routes/invoices.tsx"),
    route("dashboard", "routes/dashboard.tsx"),
  ]),
  // Públicas — fora do layout
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
]
```

### 6. Tratamento de erros — padrão

```tsx
import { ApiError } from "~/lib/api"

try {
  await algumServico.chamar()
} catch (err) {
  if (err instanceof ApiError) {
    if (err.status === 422 && err.errors) {
      // Erros de validação: { email: ["já existe"], password: ["muito curta"] }
      const msgs = Object.values(err.errors).flat()
      setError(msgs.join(". "))
    } else if (err.status === 401) {
      setError("Credenciais inválidas.")
    } else if (err.status === 404) {
      setError("Registro não encontrado.")
    } else {
      setError(err.message || "Erro inesperado.")
    }
  } else {
    setError("Erro de conexão. Verifique o servidor.")
  }
}
```

### 7. Formulários — padrão de loading e erro

Todo formulário que chama API deve seguir este esqueleto:

```tsx
const [isSubmitting, setIsSubmitting] = useState(false)
const [error, setError] = useState<string | null>(null)

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError(null)
  setIsSubmitting(true)

  try {
    await algumServico.chamar(data)
    navigate("/alguma-rota")
  } catch (err) {
    if (err instanceof ApiError) {
      setError(err.message)
    } else {
      setError("Erro de conexão.")
    }
  } finally {
    setIsSubmitting(false)
  }
}

// No JSX:
{error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
<Button type="submit" disabled={isSubmitting}>
  {isSubmitting ? "Salvando..." : "Salvar"}
</Button>
```

### 8. Estrutura de diretórios (app/lib/api/)

```
app/lib/api/
├── index.ts      # Barrel: re-exporta tudo
├── client.ts     # Core HTTP: apiGet, apiPost, apiPatch, apiDelete, ApiError, getToken/setToken
├── types.ts      # Interfaces da API (User, Account, Agent, Conversation, etc.)
├── auth.ts       # AuthService: login, register, me, logout
├── agents.ts     # AgentsService (exemplo — criar por domínio)
└── conversations.ts  # ConversationsService (exemplo)
```

**Sempre coloque cada domínio em seu próprio arquivo.** Não acumule num service monolítico.

## OpenCode agent notes

- The default agent is `frontend-agent-orchestrator` (configured in `opencode.jsonc`)
- This file is referenced as `instructions` in `opencode.jsonc`
- Agent definitions are in `.opencode/agents/` (10 agents)
- Skills in `.agents/skills/shadcn/`, `.agents/skills/tailwind-best-practices/`, `.agents/skills/tailwind-design-system/`
- Agent system prompts reference "agrojg-frontend" (the template this was generated from)
