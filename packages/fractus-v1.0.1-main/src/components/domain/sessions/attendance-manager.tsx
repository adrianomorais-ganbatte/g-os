"use client"

import * as React from "react"
import { Check, X, Save, Search, Users, CalendarCheck, Clock } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { recordAttendance } from "@/app/actions/sessions/actions"
import { Database } from "@/types/supabase"

type Participante = Database['public']['Tables']['participantes']['Row']
type Presenca = Database['public']['Tables']['presencas']['Row']

interface AttendanceManagerProps {
  sessao: any
  participantes: Participante[]
  presencasIniciais: Presenca[]
}

export function AttendanceManager({ sessao, participantes, presencasIniciais }: AttendanceManagerProps) {
  const [isPending, setIsPending] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [attendanceState, setAttendanceState] = React.useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {}
    participantes.forEach(p => {
      const presenca = presencasIniciais.find(pr => pr.participante_id === p.id)
      initialState[p.id] = presenca ? presenca.presente : false
    })
    return initialState
  })

  const toggleAttendance = (participanteId: string) => {
    setAttendanceState(prev => ({
      ...prev,
      [participanteId]: !prev[participanteId]
    }))
  }

  const handleSave = async () => {
    setIsPending(true)
    try {
      const payload = Object.entries(attendanceState).map(([participanteId, presente]) => ({
        sessao_id: sessao.id,
        participante_id: participanteId,
        presente,
      }))

      const result = await recordAttendance(payload)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success("Lista de presença salva com sucesso!")
    } catch (error) {
      toast.error("Ocorreu um erro ao salvar as presenças.")
    } finally {
      setIsPending(false)
    }
  }

  const filteredParticipantes = participantes.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const presentesCount = Object.values(attendanceState).filter(v => v).length

  return (
    <div className="flex flex-col gap-6">
      {/* Resumo da Sessão */}
      <div className="flex items-center justify-between p-6 bg-blue-600 rounded-2xl text-white shadow-lg overflow-hidden relative">
        <div className="relative z-10 space-y-1">
          <Badge variant="secondary" className="bg-white/20 text-white border-0 hover:bg-white/30 capitalize">
            {sessao.tipo}
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight">{sessao.nome}</h2>
          <div className="flex items-center gap-4 text-white/80 text-sm">
             <div className="flex items-center gap-1">
               <CalendarCheck className="size-4" />
               {new Date(sessao.data).toLocaleDateString('pt-BR')}
             </div>
             <div className="flex items-center gap-1">
               <Clock className="size-4" />
               {new Date(sessao.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
             </div>
          </div>
        </div>
        <div className="hidden md:flex flex-col items-end relative z-10">
           <span className="text-xs font-bold text-white/60 uppercase tracking-widest leading-none mb-1">
              Frequência
           </span>
           <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black">{presentesCount}</span>
              <span className="text-xl text-white/60">/ {participantes.length}</span>
           </div>
        </div>
        {/* Background Decor */}
        <Users className="absolute -right-10 -bottom-10 size-48 text-white/5 rotate-12" />
      </div>

      <Card className="border-0 shadow-sm border-t-2 border-t-blue-100">
        <CardHeader className="flex flex-row items-center justify-between px-6 py-4">
          <div className="relative flex-1 max-w-sm">
             <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
             <Input 
                placeholder="Pesquisar participante..." 
                className="pl-9 bg-zinc-50 border-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700 shadow-md gap-2 h-10 px-6 rounded-full"
          >
            <Save className="size-4" />
            {isPending ? "Salvando..." : "Confirmar Chamada"}
          </Button>
        </CardHeader>
        <CardContent className="px-2">
           <div className="grid gap-1">
              {filteredParticipantes.map((p) => (
                <div 
                  key={p.id}
                  onClick={() => toggleAttendance(p.id)}
                  className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                    attendanceState[p.id] 
                      ? 'bg-emerald-50 border-emerald-100 hover:bg-emerald-100/80 shadow-sm border' 
                      : 'hover:bg-zinc-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                      <AvatarFallback className={attendanceState[p.id] ? 'bg-emerald-200 text-emerald-800' : 'bg-zinc-200'}>
                         {p.nome.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-0.5">
                      <p className={`font-semibold text-sm ${attendanceState[p.id] ? 'text-emerald-900' : 'text-zinc-900'}`}>
                        {p.nome}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {p.email || 'Sem e-mail cadastrado'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                     {attendanceState[p.id] ? (
                       <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500 text-white font-bold text-xs shadow-sm">
                         <Check className="size-4" strokeWidth={3} />
                         PRESENTE
                       </div>
                     ) : (
                       <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-200 text-zinc-500 font-bold text-xs">
                         <X className="size-4" strokeWidth={3} />
                         AUSENTE
                       </div>
                     )}
                  </div>
                </div>
              ))}
              
              {filteredParticipantes.length === 0 && (
                <div className="py-12 text-center text-muted-foreground italic">
                  Nenhum participante encontrado com este termo.
                </div>
              )}
           </div>
        </CardContent>
      </Card>
    </div>
  )
}
