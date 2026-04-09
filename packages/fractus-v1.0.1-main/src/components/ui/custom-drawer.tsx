import * as React from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

export interface CustomDrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  onCancel?: () => void;
  onSave?: () => void;
}

export function CustomDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  onCancel,
  onSave
}: CustomDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col p-0 !max-w-[600px] sm:w-[800px]">
        <SheetHeader className="px-6 py-4 border-b border-slate-200 text-left space-y-1">
          <SheetTitle className="text-zinc-900 font-bold text-xl">{title}</SheetTitle>
          {description && (
            <SheetDescription className="text-zinc-500 text-sm">
              {description}
            </SheetDescription>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {children}
        </div>

        <SheetFooter className="px-6 py-4 border-t border-slate-200 flex flex-row justify-end gap-3 items-center w-full">
          <Button
            variant="outline"
            onClick={onCancel}
            className="text-[#F37D5E] border-[#F37D5E] hover:text-[#F37D5E] hover:bg-[#F37D5E]/10 bg-transparent"
          >
            Cancelar
          </Button>
          <Button
            onClick={onSave}
            className="bg-[#F37D5E] hover:bg-[#F37D5E]/90 text-white"
          >
            Salvar informações
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
