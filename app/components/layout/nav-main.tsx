import { useState } from "react"
import { ChevronRightIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "~/components/ui/sidebar"
import { Link, useLocation } from "react-router"

interface NavItem {
  title: string
  url?: string
  icon?: React.ReactNode
  children?: NavItem[]
}

export function NavMain({
  title,
  items,
}: {
  title?: string
  items: NavItem[]
}) {
  const location = useLocation()
  const { isMobile, setOpenMobile } = useSidebar()
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})

  const handleClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  return (
    <SidebarGroup>
      {title ? (
        <SidebarGroupLabel className="px-2 pb-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </SidebarGroupLabel>
      ) : null}
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            if (item.children) {
              const isOpen = openMenus[item.title] ?? false
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => toggleMenu(item.title)}
                    className="cursor-pointer"
                  >
                    {item.icon}
                    <span>{item.title}</span>
                    <ChevronRightIcon
                      className={`ml-auto transition-transform ${isOpen ? "rotate-90" : ""}`}
                    />
                  </SidebarMenuButton>
                  {isOpen && (
                    <SidebarMenuSub>
                      {item.children.map((child) => {
                        const isChildActive = child.url
                          ? location.pathname === child.url
                          : false
                        return (
                          <SidebarMenuSubItem key={child.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isChildActive}
                            >
                              <Link
                                to={child.url ?? "#"}
                                onClick={handleClick}
                              >
                                {child.icon}
                                <span>{child.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              )
            }

            const isActive = location.pathname === item.url
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.title}
                >
                  <Link to={item.url ?? "#"} onClick={handleClick}>
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
