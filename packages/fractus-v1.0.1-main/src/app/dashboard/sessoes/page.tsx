import { AppShell } from "@/components/layout/app-shell"
import { getPrograms } from "@/app/actions/programs/actions"
import { createClient } from "@/utils/supabase/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, MapPin, ChevronRight, Filter } from "lucide-react"
import { CreateSessionDialog } from "@/components/domain/sessions/create-session-dialog"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default async function SessoesListPage() {
  const supabase = await createClient()
  
  // Buscar programas para o modal e filtro, e templates de satisfação
  const [programas, { data: sessoes, error }, { data: templatesSatisfacao }] = await Promise.all([
    getPrograms(),
    supabase
      .from('sessoes')
      .select('*, programas(nome)')
      .order('data', { ascending: false })
      .limit(20),
    supabase
      .from('templates')
      .select('*')
      .eq('tipo', 'satisfacao_nps')
      .eq('ativo', true)
      .order('nome', { ascending: true }),
  ])

  if (error) {
    console.error('Erro ao buscar sessões:', error.message)
  }

  const getTipoLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      oficina: 'Oficina',
      mentoria: 'Mentoria',
      palestra: 'Palestra',
      encontro_geral: 'Encontro Geral'
    }
    return tipos[tipo] || tipo
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Cronograma e Presença</h1>
            <p className="text-muted-foreground">Gerencie seus encontros e registre a presença dos participantes.</p>
          </div>
          <CreateSessionDialog programas={programas} templatesSatisfacao={templatesSatisfacao || []} />
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-end">
           <div className="w-full md:w-[300px] space-y-1.5">
             <label className="text-sm font-medium">Filtrar por Programa</label>
             <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os programas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os programas</SelectItem>
                  {programas.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                  ))}
                </SelectContent>
             </Select>
           </div>
           <div className="w-full md:w-[300px] space-y-1.5 flex-1">
             <label className="text-sm font-medium">Pesquisar Sessão</label>
             <div className="relative">
                <Filter className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input placeholder="Nome da oficina ou tema..." className="pl-9" />
             </div>
           </div>
        </div>

        <div className="grid gap-4">
          {sessoes?.map((sessao: any) => (
            <Card key={sessao.id} className="group hover:border-blue-200 transition-all cursor-pointer">
              <CardContent className="p-0">
                <a href={`/dashboard/sessoes/${sessao.id}`} className="flex items-center p-6 gap-6">
                   <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-zinc-50 group-hover:bg-blue-50 transition-colors border">
                      <span className="text-xs font-bold text-muted-foreground uppercase leading-tight">
                        {new Date(sessao.data).toLocaleDateString('pt-BR', { month: 'short' })}
                      </span>
                      <span className="text-2xl font-black text-zinc-900 leading-tight">
                        {new Date(sessao.data).getDate()}
                      </span>
                   </div>
                   
                   <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                         <Badge variant="secondary" className="text-[10px] uppercase font-bold py-0 h-5">
                            {getTipoLabel(sessao.tipo)}
                         </Badge>
                         <span className="text-xs text-muted-foreground">•</span>
                         <span className="text-xs text-muted-foreground font-medium">{sessao.programas?.nome}</span>
                      </div>
                      <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors">{sessao.nome}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                         <div className="flex items-center gap-1">
                            <Calendar className="size-4" />
                            {new Date(sessao.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                         </div>
                         <div className="flex items-center gap-1">
                            <MapPin className="size-4" />
                            Presencial (Espaço Digital)
                         </div>
                      </div>
                   </div>

                   <div className="flex items-center gap-6">
                      <div className="hidden md:flex flex-col items-end">
                         <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Presenças</span>
                         <div className="flex items-center gap-1 text-emerald-600 font-bold">
                            <Users className="size-4" />
                            <span>--</span>
                         </div>
                      </div>
                      <ChevronRight className="size-5 text-muted-foreground group-hover:text-blue-500 transition-all translate-x-0 group-hover:translate-x-1" />
                   </div>
                </a>
              </CardContent>
            </Card>
          ))}
          
          {sessoes?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-2xl bg-zinc-50/50">
               <Calendar className="size-12 text-zinc-300 mb-4" />
               <p className="text-zinc-500 font-medium">Nenhuma sessão agendada.</p>
               <p className="text-zinc-400 text-sm mt-1">Clique em 'Agendar Encontro' para começar.</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
