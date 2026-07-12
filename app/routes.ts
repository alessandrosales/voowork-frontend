import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
  route("", "routes/_layout.tsx", [
    index("routes/dashboard.tsx"),
    route("categories", "routes/categories.tsx"),
    route("users", "routes/users.tsx"),
    route("customers", "routes/customers.tsx"),
    route("suppliers", "routes/suppliers.tsx"),
    route("projects", "routes/projetos.tsx"),
    route("projects/:id", "routes/projetos.$id.tsx"),
    route("agents", "routes/agents.tsx"),
    route("supplies", "routes/supplies.tsx"),
    route("inventory", "routes/inventory.tsx"),
    route("profile", "routes/profile.tsx"),
  ]),
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  route("forgot-password", "routes/forgot-password.tsx"),
  route("reset-password", "routes/reset-password.tsx"),
] satisfies RouteConfig
