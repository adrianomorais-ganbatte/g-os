import { PageHeader } from "@/components/layout/page-header";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { AppShell } from "@/components/layout/app-shell";

export default function ProgramasLoading() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <PageHeader 
          title="Gestão de Programas" 
          description="Carregando seus programas e métricas..." 
        />
        <TableSkeleton rows={8} columns={5} />
      </div>
    </AppShell>
  );
}
