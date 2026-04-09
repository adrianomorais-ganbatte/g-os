import { AppShell } from "@/components/layout/app-shell"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function PatrocinadoresLoading() {
  return (
    <AppShell>
      <div className="flex flex-col gap-8 p-8">
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Card>
          <CardHeader className="p-4">
            <Skeleton className="h-10 flex-1" />
          </CardHeader>
          <CardContent className="p-0 space-y-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border-b">
                <Skeleton className="size-10 rounded-lg" />
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-24 ml-auto" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
