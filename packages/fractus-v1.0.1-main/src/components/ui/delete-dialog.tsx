import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  warningContext?: string;
  affectedItems?: string[];
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  warningContext,
  affectedItems,
  onCancel,
  onConfirm,
}: DeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md gap-4 flex flex-col items-center !p-6">
        <AlertDialogHeader className="!flex !flex-col !items-center !text-center sm:!text-center !place-items-center mb-0 w-full">
          <AlertDialogTitle className="text-xl font-semibold">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-center text-zinc-900 mt-1 w-full">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {(warningContext || affectedItems) && (
          <div className="flex flex-col gap-2 w-full mb-2 mt-0">
            {warningContext && (
              <p className="text-sm text-muted-foreground text-center w-full">{warningContext}</p>
            )}
            {affectedItems && affectedItems.length > 0 && (
              <div className="flex flex-wrap justify-start gap-2.5">
                {affectedItems.map((item, i) => (
                  <span key={i} className="border border-zinc-200 rounded-full px-3 py-1 text-sm bg-transparent text-zinc-700">
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <AlertDialogFooter className="!grid !grid-cols-2 !w-full gap-4 pt-2 mt-0 !p-0 !m-0 !bg-transparent !border-t-0">
          <AlertDialogCancel 
            onClick={onCancel} 
            className="h-11 w-full mt-0 font-medium"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            className="h-11 w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground mt-0 font-medium"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
