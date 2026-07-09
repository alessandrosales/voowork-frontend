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
`react-router.config.ts` sets `ssr: false`. The app is a fully client-rendered SPA. No loaders/actions — all data comes from local `data.json` files.

### Routes (Portuguese)
Defined in `app/routes.ts`. All paths are in Portuguese:
- `/` (dashboard), `/categorias`, `/usuarios`, `/clientes`, `/fornecedores`, `/agentes`, `/produtos`, `/estoques`, `/login`, `/signup`

### Page pattern
Each route page follows the same template:
```tsx
import { SomeTable, schema } from "~/components/some-table"
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
All data is currently static JSON files in domain directories:
`app/products/data.json`, `app/inventory/data.json`, `app/inventory/movements.json`, `app/clients/data.json`, etc.

No `app/lib/api/`, `app/stores/`, or backend API calls exist yet.

### Component locations
| Directory | Contents |
|---|---|
| `app/components/ui/` | 26 shadcn primitives (button, card, dialog, sidebar, table, etc.) |
| `app/components/` | Flat feature components (row with domain table, form, nav, chart) |
| `app/hooks/` | `use-mobile.ts` only |
| `app/lib/` | `utils.ts` (just `cn()` function) |
| `app/routes/` | 11 page components |

Components are flat in `app/components/` (no domain subdirectories yet).

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

### Build & deploy
- Docker: multi-stage build with `node:20-alpine`
- Static output in `build/client/` (index.html + assets)
- Dev server has a custom `ignoreWellKnown` Vite plugin that blocks `/.well-known/` requests

## OpenCode agent notes

- The default agent is `frontend-agent-orchestrator` (configured in `opencode.jsonc`)
- This file is referenced as `instructions` in `opencode.jsonc`
- Agent definitions are in `.opencode/agents/` (10 agents)
- Skills in `.agents/skills/shadcn/`, `.agents/skills/tailwind-best-practices/`, `.agents/skills/tailwind-design-system/`
- Agent system prompts reference "allfinance-frontend" (the template this was generated from)
