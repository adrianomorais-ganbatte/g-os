import { AppShell } from "@/components/layout/app-shell"
import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { AttendanceManager } from "@/components/domain/sessions/attendance-manager"
import { getSessionAttendance } from "@/app/actions/sessions/actions"

interface SessaoPageProps {
  params: Promise<{ id: string }>
}

export default async function SessaoDetailPage({ params }: SessaoPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Buscar detalhes da sessão e o programa vinculado
  const { data: sessao, error: sessaoError } = await supabase
    .from('sessoes')
    .select('*, programas(id, nome)')
    .eq('id', id)
    .single()

  if (sessaoError || !sessao) {
    notFound()
  }

  // 2. Buscar participantes ATIVOS ou SELECIONADOS do programa
  const { data: participantes, error: partError } = await supabase
    .from('participantes')
    .select('*')
    .eq('programa_id', sessao.programa_id)
    .order('nome')

  if (partError) {
    console.error('Erro ao buscar participantes para chamada:', partError.message)
  }

  // 3. Buscar presenças atuais da sessão
  const presencas = await getSessionAttendance(id)

  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
           <a href="/dashboard/sessoes" className="hover:text-blue-600 transition-colors">Cronograma</a>
           <span>/</span>
           <span className="font-medium text-zinc-900">{sessao.nome}</span>
        </div>

        <AttendanceManager
          sessao={sessao}
          participantes={participantes || []}
          presencasIniciais={presencas.map((p: any) => ({
            id: p.id,
            sessao_id: p.sessao_id,
            participante_id: p.participante_id,
            presente: p.presente,
          }))}
        />
      </div>
    </AppShell>
  )
}
