import { AppShell } from "@/components/layout/app-shell"
import { PageHeader } from "@/components/layout/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { DateBadge } from "@/components/ui/data-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { Users, Briefcase, Calendar, ClipboardCheck, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { getParticipantsByProgram } from "@/app/actions/participants/actions"
import { getSponsorsByProgram } from "@/app/actions/sponsors/actions"
import { getInstancesByProgram } from "@/app/actions/instances/actions"

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProgramaDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: programa } = await supabase
    .from('programas')
    .select('*')
    .eq('id', id)
    .single()

  if (!programa) {
    notFound()
  }

  const [participantes, patrocinadores, instancias] = await Promise.all([
    getParticipantsByProgram(id),
    getSponsorsByProgram(id),
    getInstancesByProgram(id),
  ])

  // Fetch sessions
  const { data: sessoes } = await supabase
    .from('sessoes')
    .select('*')
    .eq('programa_id', id)
    .order('data', { ascending: false })

  const now = new Date()
  const inicio = new Date(programa.data_inicio)
  const fim = new Date(programa.data_fim)
  const programaStatus = now < inicio ? 'selecionado' : now > fim ? 'concluinte' : 'ativo'

  return (
    <AppShell>
      <div className="flex flex-col gap-8 p-8">
        <PageHeader
          title={programa.nome}
          description={programa.descricao || undefined}
          breadcrumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Programas", href: "/dashboard/programas" },
            { label: programa.nome },
          ]}
          actions={
            <Button variant="outline"
              render={(props) => (
                <Link href="/dashboard/programas" {...props} className={cn(props.className, "gap-2")}>
                  <ArrowLeft className="size-4" />
                  Voltar
                </Link>
              )}
            />
          }
        >
          <div className="flex items-center gap-3 pt-1">
            <StatusBadge status={programaStatus as any} />
            <DateBadge date={programa.data_inicio} label="Início" />
            <DateBadge date={programa.data_fim} label="Fim" variant="outline" />
          </div>
        </PageHeader>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="size-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{participantes.length}</p>
                <p className="text-xs text-muted-foreground">Participantes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Briefcase className="size-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{patrocinadores.length}</p>
                <p className="text-xs text-muted-foreground">Patrocinadores</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Calendar className="size-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{sessoes?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Sessões</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <ClipboardCheck className="size-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{instancias.length}</p>
                <p className="text-xs text-muted-foreground">Pesquisas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="participantes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="participantes" className="gap-2">
              <Users className="size-4" />
              Participantes
            </TabsTrigger>
            <TabsTrigger value="negocios" className="gap-2">
              <Briefcase className="size-4" />
              Patrocinadores
            </TabsTrigger>
            <TabsTrigger value="oficinas" className="gap-2">
              <Calendar className="size-4" />
              Oficinas / Sessões
            </TabsTrigger>
            <TabsTrigger value="pesquisas" className="gap-2">
              <ClipboardCheck className="size-4" />
              Pesquisas
            </TabsTrigger>
          </TabsList>

          {/* Participantes Tab */}
          <TabsContent value="participantes">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Presença</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {participantes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          Nenhum participante vinculado a este programa.
                        </TableCell>
                      </TableRow>
                    ) : (
                      participantes.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">
                            <Link href={`/dashboard/participantes/${p.id}`} className="hover:text-primary transition-colors">
                              {p.nome}
                            </Link>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{p.email}</TableCell>
                          <TableCell>
                            <StatusBadge status={p.status as any} />
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium">{Number(p.percentual_presenca).toFixed(0)}%</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm"
                              render={(props) => (
                                <Link href={`/dashboard/participantes/${p.id}`} {...props}>Ver perfil</Link>
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
          </TabsContent>

          {/* Patrocinadores Tab */}
          <TabsContent value="negocios">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patrocinador</TableHead>
                      <TableHead>Cadastrado em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patrocinadores.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                          Nenhum patrocinador vinculado a este programa.
                        </TableCell>
                      </TableRow>
                    ) : (
                      patrocinadores.map((pat) => (
                        <TableRow key={pat.id}>
                          <TableCell className="font-medium">{pat.nome}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(pat.created_at).toLocaleDateString('pt-BR')}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sessões Tab */}
          <TabsContent value="oficinas">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sessão</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Presença</TableHead>
                      <TableHead>NPS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(!sessoes || sessoes.length === 0) ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                          Nenhuma sessão registrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      sessoes.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">
                            <Link href={`/dashboard/sessoes/${s.id}`} className="hover:text-primary transition-colors">
                              {s.nome || `Sessão ${new Date(s.data).toLocaleDateString('pt-BR')}`}
                            </Link>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(s.data).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium">{Number(s.percentual_presenca).toFixed(0)}%</span>
                          </TableCell>
                          <TableCell>
                            {s.instancia_satisfacao_id ? (
                              <StatusBadge status="ativo" />
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pesquisas Tab */}
          <TabsContent value="pesquisas">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Link</TableHead>
                      <TableHead>Criado em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {instancias.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                          Nenhuma pesquisa vinculada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      instancias.map((inst) => (
                        <TableRow key={inst.id}>
                          <TableCell className="font-medium capitalize">
                            {inst.tipo.replace('_', ' ')}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={inst.status === 'publicado' ? 'publicado' : 'rascunho'} />
                          </TableCell>
                          <TableCell>
                            {inst.link_compartilhavel ? (
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                /f/{inst.link_compartilhavel}
                              </code>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(inst.created_at).toLocaleDateString('pt-BR')}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
