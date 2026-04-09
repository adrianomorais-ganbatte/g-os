import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  subtitle?: string;
  changePercentage?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  className?: string;
}

export function StatCard({
  title,
  value,
  trend,
  subtitle,
  changePercentage,
  changeType = 'positive',
  className,
}: StatCardProps) {
  const TrendIcon = changeType === 'positive' ? ArrowUpRight : changeType === 'negative' ? ArrowDownRight : null;

  return (
    <Card className={cn('bg-gradient-to-br from-white to-gray-50/50 border-gray-200', className)}>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {/* Header com título e badge de variação */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            {changePercentage && (
              <Badge
                variant={changeType === 'negative' ? 'destructive' : 'default'}
                className={cn(
                  'gap-1 font-semibold',
                  changeType === 'positive' && 'bg-green-100 text-green-700 hover:bg-green-100',
                  changeType === 'neutral' && 'bg-gray-100 text-gray-700 hover:bg-gray-100'
                )}
              >
                {changeType === 'positive' ? (
                  <TrendingUp className="w-3 h-3" />
                ) : changeType === 'negative' ? (
                  <TrendingDown className="w-3 h-3" />
                ) : null}
                {changePercentage}
              </Badge>
            )}
          </div>

          {/* Valor principal */}
          <div className="text-3xl font-bold tracking-tight text-gray-900">
            {/* Format number if it is a number */}
            {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
          </div>

          {/* Linha de tendência e subtítulo */}
          {(trend || subtitle) && (
            <div className="space-y-0.5">
              {trend && (
                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  {TrendIcon && <TrendIcon className="w-3.5 h-3.5" />}
                  <span>{trend}</span>
                </div>
              )}
              {subtitle && (
                <p className="text-xs text-gray-500">{subtitle}</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
