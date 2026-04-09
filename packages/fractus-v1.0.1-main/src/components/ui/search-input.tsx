import * as React from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export const SearchInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative w-full border border-slate-200 rounded-md bg-white flex items-center h-10 shadow-sm overflow-hidden">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={ref}
          type="search"
          className={cn("pl-10 border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 w-full bg-transparent", className)}
          {...props}
        />
      </div>
    )
  }
)
SearchInput.displayName = "SearchInput"
