import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border bg-transparent px-2.5 py-0.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        cadastrado: "border-gray-400 text-gray-600",
        inativado: "border-rose-400 text-rose-600",
        selecionado: "border-blue-500 text-blue-700",
        ativo: "border-emerald-500 text-emerald-700",
      },
    },
    defaultVariants: {
      variant: "cadastrado",
    },
  }
);

// Map of dot colors corresponding to the variant
const dotColors: Record<NonNullable<VariantProps<typeof badgeVariants>["variant"]>, string> = {
  cadastrado: "bg-gray-400",
  inativado: "bg-rose-400",
  selecionado: "bg-blue-500",
  ativo: "bg-emerald-500",
};

export type Status =
  | 'cadastrado'
  | 'inativado'
  | 'selecionado'
  | 'ativo'
  // Retrocompatibilidade opcional (pode abstrair pras novas vars)
  | 'rascunho'
  | 'planejamento'
  | 'execucao'
  | 'finalizado'
  | 'inativo'
  | 'concluinte'
  | 'desistente'
  | 'desclassificado'
  | 'pre_selecionado'
  | 'publicado'
  | 'pendente'
  | 'aprovado'
  | 'rejeitado';

const statusConfig: Record<Status, { 
  label: string; 
  variant: NonNullable<VariantProps<typeof badgeVariants>["variant"]>;
}> = {
  // Status principais exigidos pelo Figma
  cadastrado: { label: 'cadastrado', variant: 'cadastrado' },
  inativado: { label: 'inativado', variant: 'inativado' },
  selecionado: { label: 'selecionado', variant: 'selecionado' },
  ativo: { label: 'ativo', variant: 'ativo' },

  // Mapeamentos secundários para não quebrar software legado
  rascunho: { label: 'Rascunho', variant: 'cadastrado' },
  planejamento: { label: 'Planejamento', variant: 'cadastrado' },
  execucao: { label: 'Execução', variant: 'selecionado' },
  finalizado: { label: 'Finalizado', variant: 'ativo' },
  inativo: { label: 'inativo', variant: 'cadastrado' },
  concluinte: { label: 'Concluinte', variant: 'ativo' },
  desistente: { label: 'Desistente', variant: 'inativado' },
  desclassificado: { label: 'Desclassificado', variant: 'inativado' },
  pre_selecionado: { label: 'Pré-selecionado', variant: 'selecionado' },
  publicado: { label: 'Publicado', variant: 'selecionado' },
  pendente: { label: 'Pendente', variant: 'cadastrado' },
  aprovado: { label: 'Aprovado', variant: 'ativo' },
  rejeitado: { label: 'Rejeitado', variant: 'inativado' },
};

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: Status;
  withDot?: boolean;
}

export function StatusBadge({ status, withDot = true, className, ...props }: StatusBadgeProps) {
  const config = statusConfig[status || 'pendente'] || statusConfig.pendente;

  return (
    <div 
      className={cn(badgeVariants({ variant: config.variant }), className)}
      {...props}
    >
      {withDot && (
        <span className={cn("size-2 rounded-full", dotColors[config.variant])} />
      )}
      <span className="leading-none mt-px">{config.label}</span>
    </div>
  );
}
