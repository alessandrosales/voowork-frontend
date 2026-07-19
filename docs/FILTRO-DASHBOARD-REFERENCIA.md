# Sistema de Filtros do Dashboard — Documentação para Referência do Backend

## Visão Geral

O frontend possui um sistema de filtros baseado em um **painel lateral (Sheet)** acionado por botão. O componente é reutilizável e atualmente usado nas páginas de **Dashboard** e **Screenshots**.

O filtro envia parâmetros via **query string** para o endpoint da API. O backend deve interpretar esses parâmetros para filtrar os resultados.

---

## Arquitetura do Componente

```
FilterDrawer (app/components/shared/filter-drawer.tsx)
  └── DashboardFilters (app/components/dashboard/dashboard-filters.tsx)
        ├── PeriodFilter
        │     └── (condicional) DatePickerInput → DatePickerInput
        ├── UserFilter
        ├── ProjectFilter
        └── Botão "Filtrar"
```

### Fluxo de Dados

1. Usuário abre o painel clicando no botão "Filtros"
2. Seleciona período, usuário e/ou projeto
3. Clica em "Filtrar"
4. O componente `DashboardFilters` monta um objeto `ScreenshotFilters` e chama `onApply(filters)`
5. A página (ex: `screenshots.tsx`) recebe os filtros, atualiza o estado e faz uma nova requisição à API
6. O `ScreenshotsService` serializa os filtros como **query params** na URL

---

## Parâmetros Enviados para a API

### Interface `ScreenshotFilters`

```typescript
interface ScreenshotFilters {
  user_id?: string           // UUID do usuário
  project_id?: string        // UUID do projeto
  captured_after?: string    // Data ISO 8601 (início do intervalo)
  captured_before?: string   // Data ISO 8601 (fim do intervalo)
}
```

### Como os Parâmetros São Enviados (GET)

Exemplo de requisição:

```
GET /api/v1/screenshots?user_id=550e8400-e29b-41d4-a716-446655440000&captured_after=2026-07-19T00:00:00.000Z&captured_before=2026-07-19T23:59:59.000Z&page=1&limit=50
```

**Regras de serialização (no frontend):**
- `user_id`: só é enviado se **diferente de `"all"`**
- `project_id`: só é enviado se **diferente de `"all"`**
- `captured_after`: sempre em **ISO 8601** (UTC)
- `captured_before`: sempre em **ISO 8601** (UTC)
- `page`: número da página (começa em 1)
- `limit`: limite por página (default `50`)

---

## Filtro de Período — Mapeamento de Valores

O componente `PeriodFilter` oferece estas opções:

| Rótulo | Valor | Envio para API |
|---|---|---|
| Hoje | `"today"` | `captured_after` = início do dia atual (00:00:00 UTC) |
| Essa semana | `"week"` | `captured_after` = 7 dias atrás |
| Este mês | `"month"` | `captured_after` = 30 dias atrás |
| Outro Período | `"custom"` | Envia `captured_after` e `captured_before` conforme datas selecionadas |

**Importante:** Quando o período é `"today"`, `"week"` ou `"month"`, **apenas** `captured_after` é enviado. O backend deve interpretar a ausência de `captured_before` como "até o momento atual".

### Lógica de Conversão (Frontend)

```typescript
function periodToParams(period: string, startDate?: string, endDate?: string) {
  const now = new Date()
  const params: { captured_after?: string; captured_before?: string } = {}

  switch (period) {
    case "today":
      params.captured_after = new Date(
        now.getFullYear(), now.getMonth(), now.getDate()
      ).toISOString()  // Ex: "2026-07-19T00:00:00.000Z"
      break
    case "week":
      params.captured_after = new Date(
        now.getTime() - 7 * 24 * 60 * 60 * 1000
      ).toISOString()
      break
    case "month":
      params.captured_after = new Date(
        now.getTime() - 30 * 24 * 60 * 60 * 1000
      ).toISOString()
      break
    case "custom":
      if (startDate) params.captured_after = new Date(startDate).toISOString()
      if (endDate) params.captured_before = new Date(endDate).toISOString()
      break
  }

  return params
}
```

---

## Filtro de Usuário

- Quando `"all"` → não envia `user_id` na requisição
- Quando um usuário específico → envia `user_id` (string — formato UUID)
- O backend deve tratar a **ausência** do parâmetro como "todos os usuários"

## Filtro de Projeto

- Quando `"all"` → não envia `project_id` na requisição
- Quando um projeto específico → envia `project_id` (string — formato UUID)
- O backend deve tratar a **ausência** do parâmetro como "todos os projetos"

---

## Paginação

O endpoint também recebe parâmetros de paginação:

| Parâmetro | Tipo | Default | Descrição |
|---|---|---|---|
| `page` | `number` | `1` | Número da página |
| `limit` | `number` | `50` | Itens por página |

### Resposta Esperada (Paginação)

```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "pages": 5,
    "count": 234,
    "prev": null,
    "next": 2
  }
}
```

| Campo | Tipo | Descrição |
|---|---|---|
| `page` | `number` | Página atual |
| `limit` | `number` | Limite por página |
| `pages` | `number` | Total de páginas |
| `count` | `number` | Total de registros |
| `prev` | `number \| null` | Página anterior (ou `null` se não houver) |
| `next` | `number \| null` | Próxima página (ou `null` se não houver) |

---

## Endpoint Atual

**Rails:** `GET /api/v1/screenshots`

**Query params aceitos:**
- `user_id` (string, opcional)
- `project_id` (string, opcional)
- `captured_after` (string ISO 8601, opcional)
- `captured_before` (string ISO 8601, opcional)
- `page` (integer, opcional, default: 1)
- `limit` (integer, opcional, default: 50)

---

## Padrão para Novos Endpoints

Para criar um novo endpoint com filtro no mesmo padrão, o frontend espera:

1. **Endpoint GET** com query params
2. Parâmetros de filtro opcionais (enviados apenas quando selecionados)
3. Resposta paginada no formato `{ data: [...], pagination: {...} }`
4. Ausência de um parâmetro = "todos" (sem filtro naquele campo)

---

## Exemplo Completo de Uso

### Frontend envia:

```
GET /api/v1/screenshots?captured_after=2026-07-12T00:00:00.000Z&user_id=550e8400-e29b-41d4-a716-446655440000&page=1&limit=50
```

### Backend responde:

```json
{
  "data": [
    {
      "id": "abc-123",
      "tracking_id": "track-001",
      "path": "/dashboard",
      "original_id": "orig-001",
      "captured_at": "2026-07-15T14:30:00Z",
      "signed_url": "https://...",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "user_name": "Ana Silva",
      "user_initials": "AS",
      "project_id": null,
      "project_name": null,
      "task_id": null,
      "task_name": null,
      "peripheral_events": {},
      "created_at": "2026-07-15T14:30:00Z",
      "updated_at": "2026-07-15T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "pages": 1,
    "count": 1,
    "prev": null,
    "next": null
  }
}
```

---

## Observações para o Backend

1. **Datas em ISO 8601 (UTC):** O frontend sempre envia datas em UTC. O backend deve tratar no mesmo fuso ou converter adequadamente.
2. **Parâmetros ausentes = sem filtro:** Se `user_id` não está na query, retorne todos os usuários.
3. **`captured_after` sem `captured_before`:** Deve ser interpretado como "desta data até agora".
4. **Paginação é obrigatória:** O frontend espera `pagination` na resposta mesmo que só tenha 1 página.
5. **Campos `null`:** O frontend lida bem com `null` em campos opcionais (`user_name`, `project_name`, etc.).
