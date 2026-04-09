import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Tag as TagIcon, Hash, MapPin, Building, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'outline';
  icon?: 'calendar' | 'clock' | 'tag' | 'hash' | 'location' | 'building' | 'user';
  className?: string;
}

const iconMap = {
  calendar: Calendar,
  clock: Clock,
  tag: TagIcon,
  hash: Hash,
  location: MapPin,
  building: Building,
  user: User,
};

export function DataBadge({ children, variant = 'outline', icon, className }: DataBadgeProps) {
  const Icon = icon ? iconMap[icon] : null;

  return (
    <Badge variant={variant} className={cn('font-normal gap-1 px-2 py-0.5', className)}>
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </Badge>
  );
}

export interface DateBadgeProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  date?: string | Date | number | null;
  format?: 'short' | 'long' | 'relative';
}

export function DateBadge({ 
  date, 
  format = 'short', 
  className,
  ...props
}: DateBadgeProps) {
  let formattedDate = 'dd/mm/aaaa';
  
  if (date) {
    const dateObj = new Date(date);
    if (!isNaN(dateObj.getTime())) {
      if (format === 'short') {
        formattedDate = dateObj.toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        });
      } else if (format === 'long') {
        formattedDate = dateObj.toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: 'long', 
          year: 'numeric' 
        });
      } else {
        // relative
        const now = new Date();
        const diffMs = now.getTime() - dateObj.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
          formattedDate = 'Hoje';
        } else if (diffDays === 1) {
          formattedDate = 'Ontem';
        } else if (diffDays < 7 && diffDays > 0) {
          formattedDate = `${diffDays} dias atrás`;
        } else {
          formattedDate = dateObj.toLocaleDateString('pt-BR');
        }
      }
    }
  }

  return (
    <Button 
      variant="outline" 
      className={cn('w-full h-10 justify-between text-left font-normal border-slate-200', !date && "text-muted-foreground", className)}
      {...props}
    >
      {formattedDate}
      <Calendar className="w-4 h-4 opacity-50" />
    </Button>
  );
}

interface TimeBadgeProps {
  time: string;
  variant?: 'default' | 'secondary' | 'outline';
  className?: string;
}

export function TimeBadge({ time, variant = 'outline', className }: TimeBadgeProps) {
  return (
    <Badge variant={variant} className={cn('font-normal gap-1 px-2 py-0.5', className)}>
      <Clock className="w-3 h-3" />
      {time}
    </Badge>
  );
}
