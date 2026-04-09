import { PageHeader } from "@/components/layout/page-header";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { AppShell } from "@/components/layout/app-shell";

export default function ParticipantesLoading() {
  return (
    <AppShell>
      <div className="flex flex-col gap-8 p-8">
        <PageHeader 
          title="Gestão de Participantes" 
          description="Carregando participantes e dados de engajamento..." 
        />
        <TableSkeleton rows={10} columns={5} />
      </div>
    </AppShell>
  );
}
