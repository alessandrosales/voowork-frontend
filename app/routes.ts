import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
  route("", "routes/_layout.tsx", [
    index("routes/dashboard.tsx"),
    route("categorias", "routes/categories.tsx"),
    route("usuarios", "routes/users.tsx"),
    route("clientes", "routes/clients.tsx"),
    route("fornecedores", "routes/suppliers.tsx"),
    route("agentes", "routes/agents.tsx"),
    route("insumos", "routes/supplies.tsx"),
    route("estoques", "routes/inventory.tsx"),
    route("meus-dados", "routes/profile.tsx"),
  ]),
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  route("forgot-password", "routes/forgot-password.tsx"),
  route("reset-password", "routes/reset-password.tsx"),
] satisfies RouteConfig
