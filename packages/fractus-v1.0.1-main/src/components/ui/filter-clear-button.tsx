import * as React from "react"
import { FilterX } from "lucide-react"
import { Button, ButtonProps } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface FilterClearButtonProps extends ButtonProps {
  activeCount: number;
}

export function FilterClearButton({ activeCount, className, ...props }: FilterClearButtonProps) {
  const hasFilters = activeCount > 0;

  return (
    <div className="relative inline-flex items-center">
      <Button
        variant="outline"
        className={cn(
          "gap-2 h-9 px-4 font-medium transition-colors border-zinc-200",
          hasFilters 
            ? "text-zinc-700 bg-white hover:bg-zinc-100 border-zinc-300 shadow-sm" 
            : "text-zinc-400 bg-white border-zinc-200 hover:bg-white hover:text-zinc-400 cursor-not-allowed",
          className
        )}
        {...props}
      >
        Limpar
        <FilterX className="size-4" />
      </Button>
      
      {hasFilters && (
        <Badge
          className="absolute -right-2 top-1/2 -translate-y-1/2 translate-x-full px-2 py-0.5 min-w-5 h-6 ml-2 flex items-center justify-center bg-slate-200 text-slate-800 hover:bg-slate-200 font-medium border-0"
        >
          {activeCount}
        </Badge>
      )}
    </div>
  )
}
