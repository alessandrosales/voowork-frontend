import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar"
import { Link, useLocation } from "react-router"

interface NavItem {
  title: string
  url: string
  icon?: React.ReactNode
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

  const handleClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
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
            const isActive = location.pathname === item.url
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                  <Link to={item.url} onClick={handleClick}>
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
