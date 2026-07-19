import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
  route("", "routes/_layout.tsx", [
    index("routes/dashboard.tsx"),
    route("categories", "routes/categories.tsx"),
    route("users", "routes/users.tsx"),
    route("customers", "routes/customers.tsx"),
    route("projects", "routes/projetos.tsx"),
    route("screenshots", "routes/screenshots.tsx"),
    route("projects/:id", "routes/projetos.$id.tsx"),
    route("agents", "routes/agents.tsx"),
    route("profile", "routes/profile.tsx"),
    route("reports/project-time", "routes/reports.project-time.tsx"),
    route("reports/timeline", "routes/reports.timeline.tsx"),
    route("reports/task-time", "routes/reports.task-time.tsx"),
    route("reports/user-time", "routes/reports.user-time.tsx"),
  ]),
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  route("forgot-password", "routes/forgot-password.tsx"),
  route("reset-password", "routes/reset-password.tsx"),
] satisfies RouteConfig
