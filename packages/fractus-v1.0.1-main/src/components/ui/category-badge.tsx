import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  ClipboardCheck, 
  Smile, 
  TrendingUp,
  BarChart,
  Users,
  Target,
  Award,
  Heart,
  BookOpen,
  Briefcase,
  GraduationCap,
  Home as HomeIcon,
  Utensils,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

type CategoryType = 
  | 'diagnostico_inicial'
  | 'diagnostico_meio'
  | 'diagnostico_final'
  | 'satisfacao_nps'
  | 'feedback'
  | 'avaliacao'
  | 'censo'
  | 'frequencia'
  | 'educacao'
  | 'saude'
  | 'trabalho'
  | 'moradia'
  | 'alimentacao'
  | 'renda'
  | 'custom';

interface CategoryBadgeProps {
  category: CategoryType;
  label?: string;
  variant?: 'default' | 'secondary' | 'outline';
  withIcon?: boolean;
  className?: string;
}

const categoryConfig: Record<CategoryType, {
  defaultLabel: string;
  icon: any;
  className: string;
}> = {
  diagnostico_inicial: {
    defaultLabel: 'Diagnóstico Inicial',
    icon: ClipboardCheck,
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  },
  diagnostico_meio: {
    defaultLabel: 'Diagnóstico Meio',
    icon: BarChart,
    className: 'bg-purple-100 text-purple-700 hover:bg-purple-100',
  },
  diagnostico_final: {
    defaultLabel: 'Diagnóstico Final',
    icon: TrendingUp,
    className: 'bg-green-100 text-green-700 hover:bg-green-100',
  },
  satisfacao_nps: {
    defaultLabel: 'Satisfação / NPS',
    icon: Smile,
    className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
  },
  feedback: {
    defaultLabel: 'Feedback',
    icon: FileText,
    className: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100',
  },
  avaliacao: {
    defaultLabel: 'Avaliação',
    icon: Award,
    className: 'bg-orange-100 text-orange-700 hover:bg-orange-100',
  },
  censo: {
    defaultLabel: 'Censo',
    icon: Users,
    className: 'bg-teal-100 text-teal-700 hover:bg-teal-100',
  },
  frequencia: {
    defaultLabel: 'Frequência',
    icon: Target,
    className: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-100',
  },
  educacao: {
    defaultLabel: 'Educação',
    icon: GraduationCap,
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  },
  saude: {
    defaultLabel: 'Saúde',
    icon: Activity,
    className: 'bg-red-100 text-red-700 hover:bg-red-100',
  },
  trabalho: {
    defaultLabel: 'Trabalho',
    icon: Briefcase,
    className: 'bg-slate-100 text-slate-700 hover:bg-slate-100',
  },
  moradia: {
    defaultLabel: 'Moradia',
    icon: HomeIcon,
    className: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
  },
  alimentacao: {
    defaultLabel: 'Alimentação',
    icon: Utensils,
    className: 'bg-lime-100 text-lime-700 hover:bg-lime-100',
  },
  renda: {
    defaultLabel: 'Renda',
    icon: Heart,
    className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
  },
  custom: {
    defaultLabel: 'Outro',
    icon: BookOpen,
    className: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
  },
};

export function CategoryBadge({ 
  category, 
  label, 
  variant = 'secondary', 
  withIcon = true,
  className 
}: CategoryBadgeProps) {
  const config = categoryConfig[category];
  const Icon = config.icon;
  const displayLabel = label || config.defaultLabel;

  return (
    <Badge 
      variant={variant} 
      className={cn(config.className, className)}
    >
      {withIcon && <Icon className="w-3 h-3" />}
      {displayLabel}
    </Badge>
  );
}

interface TagBadgeProps {
  tipo: string;
  valor: string;
  variant?: 'default' | 'secondary' | 'outline';
  onRemove?: () => void;
  className?: string;
}

export function TagBadge({ tipo, valor, variant = 'outline', onRemove, className }: TagBadgeProps) {
  return (
    <Badge 
      variant={variant} 
      className={cn('font-normal gap-1', className)}
    >
      <span className="font-medium">{tipo}:</span>
      <span>{valor}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:text-destructive"
          type="button"
        >
          ×
        </button>
      )}
    </Badge>
  );
}

interface WorkspaceBadgeProps {
  nome: string;
  cor?: string;
  variant?: 'default' | 'secondary' | 'outline';
  className?: string;
}

export function WorkspaceBadge({ nome, cor, variant = 'secondary', className }: WorkspaceBadgeProps) {
  return (
    <Badge 
      variant={variant}
      className={className}
      style={cor ? { 
        backgroundColor: `${cor}20`, 
        color: cor,
        borderColor: cor
      } : undefined}
    >
      {nome}
    </Badge>
  );
}
