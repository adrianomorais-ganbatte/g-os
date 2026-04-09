"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export interface PageHeaderMetadata {
  icon?: React.ElementType;
  label: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: React.ReactNode;
  actions?: React.ReactNode;
  metadata?: PageHeaderMetadata[];
  navigation?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  metadata,
  navigation,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col w-full bg-background rounded-xl border border-transparent shadow-sm", className)}>
      <div className={cn("flex flex-col gap-6", navigation ? "p-6 pb-5" : "p-6")}>
        
        {/* Breadcrumbs Row */}
        {breadcrumbs && (
          <div className="flex items-center text-sm text-muted-foreground max-w-full overflow-hidden">
            {breadcrumbs}
          </div>
        )}

        {/* Info & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-1 flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-medium tracking-tight text-foreground truncate">
              {title}
            </h1>
            
            {description && (
              <p className="text-sm md:text-base text-muted-foreground">
                {description}
              </p>
            )}

            {metadata && metadata.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {metadata.map((item, idx) => (
                  <Badge 
                    key={idx} 
                    variant="secondary" 
                    className="h-7 px-3 py-0 flex items-center gap-1.5 rounded-full font-medium text-xs bg-secondary/60 hover:bg-secondary/60 text-muted-foreground border-transparent cursor-default"
                  >
                    {item.icon && <item.icon className="size-3.5 text-muted-foreground/80" />}
                    <span>{item.label}</span>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {actions && (
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Separator and Bottom Navigation Tab area */}
      {navigation && (
        <div className="flex flex-col">
          <hr className="w-full border-t border-border" />
          <div className="px-6 py-4 overflow-x-auto no-scrollbar flex items-center gap-2">
            {navigation}
          </div>
        </div>
      )}
    </div>
  );
}
