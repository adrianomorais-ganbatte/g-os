import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Option {
  label: string;
  value: string;
}

export interface MultiSelectFilterProps {
  label: string;
  options: Option[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  onApply?: () => void;
  className?: string;
}

export function MultiSelectFilter({
  label,
  options,
  selectedValues,
  onChange,
  onApply,
  className,
}: MultiSelectFilterProps) {
  const [open, setOpen] = React.useState(false);

  const handleToggle = (value: string) => {
    const currentIndex = selectedValues.indexOf(value);
    const newSelected = [...selectedValues];

    if (currentIndex === -1) {
      newSelected.push(value);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    onChange(newSelected);
  };

  // Build the display string
  const displayString = React.useMemo(() => {
    if (selectedValues.length === 0) return "Todos";
    
    const selectedLabels = selectedValues.map(
      val => options.find(opt => opt.value === val)?.label || val
    );
    
    const joined = selectedLabels.join(", ");
    return joined.length > 20 ? joined.substring(0, 18) + "..." : joined;
  }, [selectedValues, options]);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-sm text-muted-foreground font-medium px-1">
        {label}
      </label>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger 
          render={
            <Button 
              variant="outline" 
              role="combobox" 
              aria-expanded={open}
              className="w-[200px] justify-between h-9 font-normal text-muted-foreground bg-transparent border-zinc-200"
            />
          }
        >
          <span className={cn("truncate", selectedValues.length > 0 && "text-foreground font-medium")}>
            {displayString}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0 rounded-xl" align="start">
          <div className="p-3">
            <p className="text-sm font-medium text-muted-foreground mb-3">{label}</p>
            <div className="flex flex-col gap-3">
              {options.map((option) => {
                const isChecked = selectedValues.includes(option.value);
                return (
                  <div key={option.value} className="flex items-center space-x-2.5">
                    <Checkbox 
                      id={`opt-${option.value}`} 
                      checked={isChecked}
                      onCheckedChange={() => handleToggle(option.value)}
                      className="rounded-[3px]"
                    />
                    <label 
                      htmlFor={`opt-${option.value}`} 
                      className="text-sm font-medium leading-none cursor-pointer text-zinc-700"
                    >
                      {option.label}
                    </label>
                  </div>
                )
              })}
            </div>
            
            <div className="flex justify-end mt-4 pt-4">
              <Button 
                 size="sm" 
                 className="bg-[#F37D5E] hover:bg-[#F37D5E]/90 text-white h-7 rounded-md px-3 text-xs"
                 onClick={() => {
                   if (onApply) onApply();
                   setOpen(false);
                 }}
              >
                aplicar
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
