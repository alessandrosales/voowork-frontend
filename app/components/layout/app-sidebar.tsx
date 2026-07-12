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
} from "~/components/ui/sidebar"
import {
  UserCogIcon,
  BotIcon,
  LayoutDashboardIcon,
  FolderKanbanIcon,
} from "lucide-react"
import { Link } from "react-router"
import { useAuth } from "~/hooks/use-auth"

const navData = {
  navPrimary: [
    {
      title: "Dashboard",
      url: "/",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Usuários",
      url: "/usuarios",
      icon: <UserCogIcon />,
    },
    {
      title: "Projetos",
      url: "/projetos",
      icon: <FolderKanbanIcon />,
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
              size="lg"
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link to="/">
                <Logo className="h-9 w-auto" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain title="Menu Principal" items={navData.navPrimary} />
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
