import * as React from "react"

import { Logo } from "~/components/shared/logo"
import { AiAssistantDialog } from "~/components/agents/ai-assistant-dialog"
import { NavMain } from "~/components/layout/nav-main"
import { NavUser } from "~/components/layout/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "~/components/ui/sidebar"
import {
  UsersIcon,
  TruckIcon,
  PackageIcon,
  Sprout,
  ListIcon,
  UserCogIcon,
  BotIcon,
  LayoutDashboardIcon,
  FileTextIcon,
} from "lucide-react"
import { Link } from "react-router"
import { useAuth } from "~/hooks/use-auth"

const navData = {
  navPrimary: [
    {
      title: "Notas Fiscais",
      url: "/",
      icon: <FileTextIcon />,
    },
    {
      title: "Usuários",
      url: "/usuarios",
      icon: <UserCogIcon />,
    },
  ],
  navSecondary: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Clientes",
      url: "/clientes",
      icon: <UsersIcon />,
    },
    {
      title: "Fornecedores",
      url: "/fornecedores",
      icon: <TruckIcon />,
    },
    {
      title: "Insumos",
      url: "/insumos",
      icon: <Sprout />,
    },
    {
      title: "Estoque",
      url: "/estoques",
      icon: <PackageIcon />,
    },
    {
      title: "Categorias",
      url: "/categorias",
      icon: <ListIcon />,
    },
    {
      title: "Agentes",
      url: "/agentes",
      icon: <BotIcon />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link to="/">
                <Logo className="h-7 w-auto" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain title="Menu Principal" items={navData.navPrimary} />
        <SidebarSeparator />
        <NavMain title="Em Breve" items={navData.navSecondary} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <AiAssistantDialog />
          </SidebarMenuItem>
        </SidebarMenu>
        <NavUser
          user={
            user
              ? { name: user.name, email: user.email }
              : { name: "Carregando...", email: "" }
          }
        />
      </SidebarFooter>
    </Sidebar>
  )
}
