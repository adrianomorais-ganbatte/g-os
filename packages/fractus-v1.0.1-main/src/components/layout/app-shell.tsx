"use client"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-zinc-50/50">
        <main className="flex-1 overflow-auto">
          <div className="max-w-[1600px] mx-auto min-h-screen">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
