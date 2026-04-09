import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Target,
  TrendingUp,
  Calendar,
  ArrowRight,
  Activity,
  Heart,
  CheckCircle,
} from "lucide-react"
import { getPrograms } from "@/app/actions/programs/actions"
import { getAllParticipants } from "@/app/actions/participants/actions"
import { getDeals } from "@/app/actions/deals/actions"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export default async function DashboardPage() {
  const [programas, participantes, negocios] = await Promise.all([
    getPrograms(),
    getAllParticipants(),
    getDeals()
  ])

  // Cálculos Reais
  const now = new Date()
  const totalParticipantes = participantes.length
  const participantesAtivos = participantes.filter(p => p.status === 'ativo' || p.status === 'selecionado').length
  const totalProgramas = programas.length
  
  // Infernindo status ativo baseado nas datas já que o banco não tem campo status direto
  const programasAtivosList = programas.filter(p => {
    const inicio = new Date(p.data_inicio)
    const fim = new Date(p.data_fim)
    return now >= inicio && now <= fim
  })
  
  const valorPipeline = negocios.reduce((acc, curr) => acc + (curr.valor || 0), 0)
  const taxaRetencao = totalParticipantes > 0 ? ((participantesAtivos / totalParticipantes) * 100).toFixed(1) : 0

  const kpis = [
    {
      titulo: 'Programas',
      valor: totalProgramas,
      descricao: `${programasAtivosList.length} em andamento`,
      link: '/dashboard/programas',
    },
    {
      titulo: 'Participantes',
      valor: totalParticipantes,
      descricao: `${participantesAtivos} ativos agora`,
      link: '/dashboard/participantes',
    },
    {
      titulo: 'Pipeline CRM',
      valor: formatCurrency(valorPipeline),
      descricao: 'Valor acumulado',
      link: '/dashboard/negocios',
    },
    {
      titulo: 'Impacto Social',
      valor: `${taxaRetencao}%`,
      descricao: 'Taxa de retenção',
      link: '/',
    },
  ];

  const modulos = [
    {
      titulo: 'Programas',
      descricao: 'Gerencie programas sociais e educacionais',
      icon: Target,
      link: '/dashboard/programas',
      color: 'bg-blue-500',
      stats: [
        { label: 'Total', value: totalProgramas },
        { label: 'Ativos', value: programasAtivosList.length },
      ]
    },
    {
      titulo: 'Negócios (CRM)',
      descricao: 'Gerencie patrocinadores e parcerias',
      icon: Heart,
      link: '/dashboard/negocios',
      color: 'bg-pink-500',
      stats: [
        { label: 'Negócios', value: negocios.length },
        { label: 'Pipeline', value: formatCurrency(valorPipeline) },
      ]
    },
    {
      titulo: 'Impacto',
      descricao: 'Análise de diagnósticos e evolução',
      icon: TrendingUp,
      link: '/',
      color: 'bg-orange-500',
      stats: [
        { label: 'Indicadores', value: '-' },
        { label: 'Evolução', value: '-' },
      ]
    },
  ];

  const atividades = [
    ...programas.slice(0, 3).map(p => ({
      tipo: 'Programa criado',
      nome: p.nome,
      data: p.created_at,
    })),
    ...participantes.slice(0, 3).map(p => ({
      tipo: 'Participante cadastrado',
      nome: p.nome,
      data: p.created_at,
    })),
  ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).slice(0, 5);

  return (
    <AppShell>
      <div className="flex flex-col p-10 gap-10 min-h-screen">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight text-primary">Bem-vindo ao FRACTUS</h1>
          <p className="text-muted-foreground text-lg font-medium opacity-80 max-w-2xl">
            Sua plataforma central de gestão, medição de impacto social e saúde operacional.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {kpis.map((kpi) => (
            <Link key={kpi.titulo} href={kpi.link}>
              <Card className="border-none shadow-premium hover:shadow-2xl transition-all cursor-pointer bg-gradient-to-br from-white to-zinc-50/50">
                <CardHeader className="pb-3 px-6 pt-6">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70">
                    {kpi.titulo}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-3">
                  <div className="text-4xl font-black tracking-tighter text-primary">
                    {kpi.valor}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground tracking-tight">
                    <Activity className="size-3 text-primary opacity-40" />
                    {kpi.descricao}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Módulos */}
        <div className="space-y-6">
          <h2 className="text-xl font-black uppercase tracking-widest text-primary/70 pl-2">Centrais de Operação</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modulos.map((modulo) => {
              const Icon = modulo.icon;
              return (
                <Card key={modulo.titulo} className="border-none shadow-premium group overflow-hidden">
                  <CardHeader className="p-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl ${modulo.color} bg-opacity-10 text-primary shadow-sm ring-1 ring-inset ring-black/[0.05]`}>
                          <Icon className={`size-7 ${modulo.color.replace('bg-', 'text-')}`} />
                        </div>
                        <div className="flex flex-col">
                          <CardTitle className="text-lg font-black tracking-tight">{modulo.titulo}</CardTitle>
                          <p className="text-xs text-muted-foreground font-medium leading-relaxed mt-1">
                            {modulo.descricao}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-0">
                    <div className="space-y-4 mb-6 pt-4 border-t border-border/20">
                      {modulo.stats.map((stat, idx) => (
                        <div key={idx} className="flex justify-between items-end text-sm">
                          <span className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">{stat.label}</span>
                          <span className="font-black text-primary tracking-tight">{stat.value}</span>
                        </div>
                      ))}
                    </div>
                    <Link href={modulo.link}>
                      <Button className="w-full gap-2 rounded-xl h-11 font-bold group-hover:shadow-md transition-all">
                        Acessar Console
                        <ArrowRight className="size-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Atividades Recentes */}
        <Card className="border-none shadow-premium overflow-hidden">
          <CardHeader className="bg-zinc-50/50 border-b border-border/30 px-8 py-5">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary opacity-70">Log de Impacto Recente</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/10">
              {atividades.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-16 italic opacity-60">Pioneirismo em progresso: aguardando primeiras atividades.</p>
              ) : (
                atividades.map((atividade, idx) => (
                  <div key={idx} className="flex items-center gap-6 px-8 py-5 hover:bg-zinc-50/80 transition-colors group">
                    <div className="size-10 rounded-full bg-emerald-100/50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                      <CheckCircle className="size-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-primary group-hover:translate-x-1 transition-transform">{atividade.tipo}</p>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-tighter mt-0.5">{atividade.nome}</p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
                      <Calendar className="size-3" />
                      {new Date(atividade.data).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
