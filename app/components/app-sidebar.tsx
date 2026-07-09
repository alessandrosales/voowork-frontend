import * as React from "react"

import { Logo } from "~/components/logo"
import { AiAssistantDialog } from "~/components/ai-assistant-dialog"
import { NavMain } from "~/components/nav-main"
import { NavUser } from "~/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar"
import { UsersIcon, TruckIcon, PackageIcon, Sprout, ListIcon, UserCogIcon, BotIcon, LayoutDashboardIcon } from "lucide-react"
import { Link } from "react-router"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
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
      title: "Usuários",
      url: "/usuarios",
      icon: <UserCogIcon />,
    },
    {
      title: "Agentes",
      url: "/agentes",
      icon: <BotIcon />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <AiAssistantDialog />
          </SidebarMenuItem>
        </SidebarMenu>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
