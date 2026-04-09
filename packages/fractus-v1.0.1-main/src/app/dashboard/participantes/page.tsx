import { AppShell } from "@/components/layout/app-shell"
import { getAllParticipants } from "@/app/actions/participants/actions"
import { getPrograms } from "@/app/actions/programs/actions"
import { PageHeader } from "@/components/layout/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { CreateParticipantDialog } from "@/components/domain/participants/create-participant-dialog"
import { CSVImportDialog } from "@/components/domain/participants/csv-import-dialog"
import { cn } from "@/lib/utils"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Filter, Mail, ExternalLink } from "lucide-react"
import Link from "next/link"

export default async function ParticipantesListPage() {
  const [participantes, programas] = await Promise.all([
    getAllParticipants(),
    getPrograms(),
  ])

  return (
    <AppShell>
      <div className="flex flex-col gap-8 p-8">
        <PageHeader
          title="Gestão de Participantes"
          description="Acompanhe a jornada, frequência e engajamento individual de cada participante."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Participantes" }
          ]}
          actions={
            <div className="flex items-center gap-2">
              <CSVImportDialog programas={programas} />
              <CreateParticipantDialog programas={programas} />
            </div>
          }
        />

        <Card className="border-none shadow-sm ring-1 ring-foreground/5 bg-white/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="p-4 flex flex-col md:flex-row items-center gap-4 space-y-0 border-b bg-muted/10">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nome ou e-mail..." 
                className="pl-9 bg-white/40 h-10 border-foreground/10 focus:bg-white transition-all" 
              />
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Select>
                <SelectTrigger className="w-full md:w-[220px] h-10 bg-white/40 border-foreground/10">
                  <SelectValue placeholder="Todos os Programas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Programas</SelectItem>
                  {programas.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" className="gap-2 h-10 shrink-0 border-foreground/10">
                <Filter className="size-4" />
                Filtros
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="w-[350px] py-4">Participante</TableHead>
                  <TableHead>Programa</TableHead>
                  <TableHead>Frequência</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participantes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                       <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-muted rounded-full">
                          <Search className="size-6 opacity-20" />
                        </div>
                        <p>Nenhum participante encontrado.</p>
                        <CreateParticipantDialog programas={programas} />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  participantes.map((participante) => {
                    const programa = programas.find((p) => p.id === participante.programa_id)
                    return (
                      <TableRow key={participante.id} className="group hover:bg-muted/40 transition-colors border-b">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-9 rounded-lg border">
                              <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                {participante.nome.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-foreground">{participante.nome}</span>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Mail className="size-3 opacity-60" /> 
                                {participante.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <span className="px-2.5 py-1 bg-muted/50 rounded-full text-foreground/80 border text-[11px] font-medium uppercase tracking-wider">
                             {programa?.nome || 'Não Vinculado'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-bold text-foreground">{participante.percentual_presenca}%</span> 
                              <span className="text-muted-foreground font-normal">presença</span>
                            </div>
                            <div className="w-24 h-1 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full transition-all",
                                  participante.percentual_presenca > 75 ? "bg-green-500" : 
                                  participante.percentual_presenca > 50 ? "bg-yellow-500" : "bg-red-500"
                                )} 
                                style={{ width: `${participante.percentual_presenca}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={participante.status as any} />
                        </TableCell>
                        <TableCell className="text-right pr-6">
                           <Button 
                            variant="ghost" 
                            size="sm" 
                            className="hover:bg-primary/5 hover:text-primary transition-all group-hover:translate-x-1"
                            render={(props) => (
                              <Link href={`/dashboard/participantes/${participante.id}`} {...props} className={cn(props.className, "flex items-center gap-2")}>
                                Perfil
                                <ExternalLink className="size-3.5" />
                              </Link>
                            )}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
