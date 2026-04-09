import { TableHead } from "@/components/ui/table";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortableTableHeadProps {
  label: string;
  sortKey: string;
  currentSort?: { key: string; direction: 'asc' | 'desc' } | null;
  onSort: (key: string) => void;
  className?: string;
}

export function SortableTableHead({
  label,
  sortKey,
  currentSort,
  onSort,
  className,
}: SortableTableHeadProps) {
  const isSorted = currentSort?.key === sortKey;

  return (
    <TableHead 
      className={cn("cursor-pointer hover:bg-muted/50 transition-colors", className)}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1.5">
        {label}
        {isSorted ? (
          currentSort.direction === 'asc' ? (
            <ArrowUp className="w-3.5 h-3.5" />
          ) : (
            <ArrowDown className="w-3.5 h-3.5" />
          )
        ) : (
          <ArrowUpDown className="w-3.5 h-3.5 opacity-30" />
        )}
      </div>
    </TableHead>
  );
}
