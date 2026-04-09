import { AppShell } from "@/components/layout/app-shell"
import { getPrograms } from "@/app/actions/programs/actions"
import { PageHeader } from "@/components/layout/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { DateBadge } from "@/components/ui/data-badge"
import { CreateProgramDialog } from "@/components/domain/programs/create-program-dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils" // Fixed missing import
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Filter, ExternalLink } from "lucide-react"
import Link from "next/link"

export default async function ProgramasListPage() {
  const programas = await getPrograms()

  return (
    <AppShell>
      <div className="flex flex-col gap-8 p-8">
        <PageHeader
          title="Gestão de Programas"
          description="Monitore o progresso e impacto de cada iniciativa de aceleração."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Programas" }
          ]}
          actions={<CreateProgramDialog />}
        />

        <Card className="border-none shadow-sm ring-1 ring-foreground/5 bg-white/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="p-4 flex flex-row items-center gap-4 space-y-0 border-b">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por programa..." 
                className="pl-9 bg-white/40 h-10 border-foreground/10 focus:bg-white transition-all" 
              />
            </div>
            <Button variant="outline" className="gap-2 h-10">
              <Filter className="size-4" />
              Filtros
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="w-[350px] py-4">Programa</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Engajamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-muted rounded-full">
                          <Search className="size-6 opacity-20" />
                        </div>
                        <p>Nenhum programa encontrado.</p>
                        <CreateProgramDialog />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  programas.map((programa) => (
                    <TableRow key={programa.id} className="group hover:bg-muted/40 transition-colors border-b">
                      <TableCell className="font-medium py-4">
                        <div className="flex flex-col gap-0.5">
                          <Link 
                            href={`/dashboard/programas/${programa.id}`}
                            className="hover:text-primary transition-colors cursor-pointer"
                          >
                            {programa.nome}
                          </Link>
                          <span className="text-sm text-muted-foreground font-normal line-clamp-1 opacity-70 group-hover:opacity-100 transition-opacity">
                            {programa.descricao || 'Sem descrição cadastrada'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <DateBadge date={programa.data_inicio} label="Início" />
                          <DateBadge date={programa.data_fim} label="Fim" variant="outline" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-bold text-foreground">{programa.total_inscritos ?? 0}</span> 
                            <span className="text-muted-foreground">de {programa.quantidade_vagas || '∞'} vagas</span>
                          </div>
                          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ 
                                width: `${Math.min(100, ((programa.total_inscritos || 0) / (programa.quantidade_vagas || 100)) * 100)}%` 
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const now = new Date()
                          const inicio = new Date(programa.data_inicio)
                          const fim = new Date(programa.data_fim)
                          if (now < inicio) return <StatusBadge status="selecionado" />
                          if (now > fim) return <StatusBadge status="concluinte" />
                          return <StatusBadge status="ativo" />
                        })()}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="hover:bg-primary/5 hover:text-primary transition-all group-hover:translate-x-1"
                          render={(props) => (
                            <Link href={`/dashboard/programas/${programa.id}`} {...props} className={cn(props.className, "flex items-center gap-2")}>
                              Detalhes
                              <ExternalLink className="size-3.5" />
                            </Link>
                          )}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
