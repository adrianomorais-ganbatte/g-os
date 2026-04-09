"use client";

import * as React from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { copyToClipboard } from "@/lib/clipboard";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CopyLinkInputProps {
  url: string;
  label?: string;
  className?: string;
}

export function CopyLinkInput({ url, label, className }: CopyLinkInputProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Falha ao copiar link.");
    }
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <span className="text-xs font-medium text-gray-500">{label}</span>}
      <div className="flex gap-2">
        <Input 
          value={url} 
          readOnly 
          className="bg-white font-mono text-xs h-9" 
        />
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCopy}
          className="gap-2 h-9"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copiado" : "Copiar"}
        </Button>
      </div>
    </div>
  );
}
