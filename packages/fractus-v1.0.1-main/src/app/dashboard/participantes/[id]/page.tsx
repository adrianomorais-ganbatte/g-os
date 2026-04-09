import { AppShell } from "@/components/layout/app-shell"
import { PageHeader } from "@/components/layout/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { ArrowLeft, Mail, Phone, Calendar, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { getResponsesByParticipant } from "@/app/actions/responses/actions"
import { calculateRisk, type RiskFactors } from "@/lib/risk-calculator"

interface Props {
  params: Promise<{ id: string }>
}

const riskColors = {
  baixo: 'bg-green-100 text-green-700',
  medio: 'bg-yellow-100 text-yellow-700',
  alto: 'bg-orange-100 text-orange-700',
  critico: 'bg-red-100 text-red-700',
}

export default async function ParticipanteDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: participante } = await supabase
    .from('participantes')
    .select('*')
    .eq('id', id)
    .single()

  if (!participante) {
    notFound()
  }

  // Fetch program name
  const { data: programa } = await supabase
    .from('programas')
    .select('nome')
    .eq('id', participante.programa_id)
    .single()

  const respostas = await getResponsesByParticipant(id)

  // Calculate risk
  const riskFactors: RiskFactors = {
    status: participante.status,
    percentualPresenca: Number(participante.percentual_presenca),
    respondeuDiagnosticoInicial: participante.respondeu_diagnostico_inicial,
    faltasConsecutivas: participante.faltas_consecutivas,
    totalRespostas: respostas.length,
  }
  const risk = calculateRisk(riskFactors)

  // Check incomplete data
  const hasIncompleteData =
    (participante.status === 'selecionado' || participante.status === 'ativo') &&
    (!participante.telefone || !participante.data_nascimento)

  return (
    <AppShell>
      <div className="flex flex-col gap-8 p-8">
        <PageHeader
          title={participante.nome}
          breadcrumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Participantes", href: "/dashboard/participantes" },
            { label: participante.nome },
          ]}
          actions={
            <Button variant="outline"
              render={(props) => (
                <Link href="/dashboard/participantes" {...props} className={cn(props.className, "gap-2")}>
                  <ArrowLeft className="size-4" />
                  Voltar
                </Link>
              )}
            />
          }
        >
          <div className="flex items-center gap-3 pt-1">
            <StatusBadge status={participante.status as any} />
            <Badge className={`${riskColors[risk.level]} border-transparent gap-1`}>
              <AlertTriangle className="size-3" />
              Risco: {risk.level} ({risk.score})
            </Badge>
          </div>
        </PageHeader>

        {hasIncompleteData && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="size-5 text-amber-600" />
              <p className="text-sm text-amber-800 font-medium">
                Dados incompletos: {!participante.telefone && 'telefone'}{!participante.telefone && !participante.data_nascimento && ' e '}{!participante.data_nascimento && 'data de nascimento'} não informados.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="size-4 text-muted-foreground" />
                <span className="text-sm">{participante.email}</span>
              </div>
              {participante.telefone && (
                <div className="flex items-center gap-3">
                  <Phone className="size-4 text-muted-foreground" />
                  <span className="text-sm">{participante.telefone}</span>
                </div>
              )}
              {participante.data_nascimento && (
                <div className="flex items-center gap-3">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(participante.data_nascimento).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Programa</span>
                  <Link href={`/dashboard/programas/${participante.programa_id}`} className="text-primary hover:underline font-medium">
                    {programa?.nome || '—'}
                  </Link>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Presença</span>
                  <span className="font-bold">{Number(participante.percentual_presenca).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Faltas consecutivas</span>
                  <span className="font-bold">{participante.faltas_consecutivas}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Diagnóstico inicial</span>
                  <span className="font-bold">{participante.respondeu_diagnostico_inicial ? 'Sim' : 'Não'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Vínculo</span>
                  <span className="text-muted-foreground">{new Date(participante.data_vinculo).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk + Responses */}
          <div className="lg:col-span-2 space-y-6">
            {/* Risk Factors */}
            {risk.factors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="size-5" />
                    Fatores de Risco
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {risk.factors.map((factor, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <span className="size-1.5 rounded-full bg-destructive" />
                        {factor}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Responses */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Respostas ({respostas.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data de envio</TableHead>
                      <TableHead>Versão</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {respostas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="h-20 text-center text-muted-foreground">
                          Nenhuma resposta registrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      respostas.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="text-muted-foreground">
                            {r.data_envio ? new Date(r.data_envio).toLocaleDateString('pt-BR') : 'Rascunho'}
                          </TableCell>
                          <TableCell>v{r.versao_template}</TableCell>
                          <TableCell>
                            <StatusBadge status={r.completed_at ? 'ativo' : 'pendente'} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
