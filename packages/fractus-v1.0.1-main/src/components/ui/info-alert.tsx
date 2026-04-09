import * as React from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"

export interface InfoAlertProps {
  title: string;
  children: React.ReactNode;
}

export function InfoAlert({ title, children }: InfoAlertProps) {
  return (
    <Alert className="!bg-blue-50 !border-blue-400 !text-blue-800 rounded-lg p-4 shadow-sm items-start">
      <Info className="h-4 w-4 !text-blue-500 shrink-0" />
      <AlertTitle className="!text-blue-700 font-medium text-base mb-1 col-start-2">{title}</AlertTitle>
      <AlertDescription className="!text-blue-600/90 text-[14px] leading-relaxed col-start-2">
        {children}
      </AlertDescription>
    </Alert>
  )
}
