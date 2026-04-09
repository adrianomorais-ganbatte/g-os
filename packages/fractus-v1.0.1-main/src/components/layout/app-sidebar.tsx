"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import {
  Menu,
  Settings,
  Handshake,
  FileText,
  BarChart,
  LogOut
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
  useSidebar
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navGroups = [
  {
    title: "Gestão",
    items: [
      {
        title: "Projetos",
        url: "/dashboard/projetos",
        icon: Settings,
      },
      {
        title: "Financiadores",
        url: "/dashboard/financiadores",
        icon: Handshake,
      },
    ]
  },
  {
    title: "Templates",
    items: [
      {
        title: "Formulários",
        url: "/dashboard/formularios",
        icon: FileText,
      },
    ]
  },
  {
    title: "Impacto",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard/impacto",
        icon: BarChart,
      },
    ]
  }
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname() || ""
  const { toggleSidebar, state } = useSidebar()

  const isActive = (url: string) => {
    return pathname.startsWith(url)
  }

  return (
    <Sidebar className="m-4 rounded-xl border border-sidebar-border shadow-sm bg-background transition-all duration-300 h-[calc(100vh-2rem)] overflow-hidden !border-none ring-1 ring-border" collapsible="icon" {...props}>
      <SidebarHeader className="px-4 flex flex-row items-center justify-between h-16 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
        <div className="flex items-center overflow-hidden group-data-[collapsible=icon]:hidden">
          <Image src="/logo-fractus.svg" alt="Fractus" width={140} height={40} className="h-9 w-auto shrink-0 object-contain" priority />
        </div>
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="shrink-0 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <Menu className="size-5" />
        </Button>
      </SidebarHeader>
      
      <SidebarSeparator className="mx-0" />

      <SidebarContent className="px-2 py-4 gap-4">
        {navGroups.map((group) => (
          <SidebarGroup key={group.title} className="p-0">
            <SidebarGroupLabel className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider px-3 mb-2 group-data-[collapsible=icon]:hidden">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                      className="h-10 px-3 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-secondary data-[active=true]:text-secondary-foreground rounded-lg group-data-[collapsible=icon]:!justify-center group-data-[collapsible=icon]:!p-0"
                      render={(buttonProps) => (
                        <Link href={item.url} {...buttonProps}>
                          <item.icon className="size-4 shrink-0" />
                          <span className="font-semibold text-sm group-data-[collapsible=icon]:hidden">{item.title}</span>
                        </Link>
                      )}
                    />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarSeparator className="mx-0" />

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 mb-4 rounded-xl border border-transparent group-data-[collapsible=icon]:justify-center">
          <Avatar className="size-9 shrink-0 border border-sidebar-border">
            <AvatarImage src="https://i.pravatar.cc/150?img=47" alt="Karen Franquini" />
            <AvatarFallback>KF</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-bold truncate leading-none text-foreground">Karen Franquini</p>
            <p className="text-[10px] lowercase text-muted-foreground mt-1 capitalize">Gestor</p>
          </div>
        </div>
        
        <form action={() => console.log('logout')}>
          <Button
            type="submit"
            variant="outline"
            className="w-full justify-start gap-2 h-9 text-muted-foreground hover:text-foreground transition-all group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:hover:bg-transparent group-data-[collapsible=icon]:border-none group-data-[collapsible=icon]:shadow-none group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:ring-0"
          >
            <LogOut className="size-4 shrink-0" />
            <span className="font-semibold text-xs group-data-[collapsible=icon]:hidden">Sair</span>
          </Button>
        </form>
      </SidebarFooter>
    </Sidebar>
  )
}
