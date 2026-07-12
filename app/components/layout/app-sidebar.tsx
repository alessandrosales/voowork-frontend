"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"

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
  UsersIcon,
} from "lucide-react"
import { Link } from "react-router"
import { useAuth } from "~/hooks/use-auth"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const { t } = useTranslation()

  const navPrimary = React.useMemo(
    () => [
      {
        title: t("nav.dashboard"),
        url: "/",
        icon: <LayoutDashboardIcon />,
      },
      {
        title: t("nav.users"),
        url: "/users",
        icon: <UserCogIcon />,
      },
      {
        title: t("nav.customers"),
        url: "/customers",
        icon: <UsersIcon />,
      },
      {
        title: t("nav.projects"),
        url: "/projects",
        icon: <FolderKanbanIcon />,
      },
      {
        title: t("nav.agents"),
        url: "/agents",
        icon: <BotIcon />,
      },
    ],
    [t],
  )

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
        <NavMain title={t("nav.menu-title")} items={navPrimary} />
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
