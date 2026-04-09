import { AppShell } from "@/components/layout/app-shell"
import { PageHeader } from "@/components/layout/page-header"
import { CategoryBadge } from "@/components/ui/category-badge"
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
import { ArrowLeft, ToggleLeft, ToggleRight } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getTemplateById } from "@/app/actions/templates/actions"
import { getInstances } from "@/app/actions/instances/actions"

interface Props {
  params: Promise<{ id: string }>
}

const tipoCampoLabels: Record<string, string> = {
  texto: 'Texto',
  escolha_unica: 'Escolha Única',
  multipla_escolha: 'Múltipla Escolha',
  escala: 'Escala',
}

export default async function TemplateDetailPage({ params }: Props) {
  const { id } = await params
  const template = await getTemplateById(id)

  if (!template) {
    notFound()
  }

  const allInstances = await getInstances()
  const instances = allInstances.filter(i => i.template_id === id)
  const campos = template.campo_templates?.sort((a, b) => a.ordem - b.ordem) || []

  return (
    <AppShell>
      <div className="flex flex-col gap-8 p-8">
        <PageHeader
          title={template.nome}
          description={template.descricao || undefined}
          breadcrumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Templates", href: "/dashboard/templates" },
            { label: template.nome },
          ]}
          actions={
            <Button variant="outline"
              render={(props) => (
                <Link href="/dashboard/templates" {...props} className={cn(props.className, "gap-2")}>
                  <ArrowLeft className="size-4" />
                  Voltar
                </Link>
              )}
            />
          }
        >
          <div className="flex items-center gap-3 pt-1">
            <CategoryBadge category={template.tipo} />
            <StatusBadge status={template.ativo ? 'ativo' : 'inativo'} />
            <Badge variant="outline" className="gap-1">
              v{template.versao}
            </Badge>
            {template.permitir_multiplas_respostas && (
              <Badge variant="secondary" className="gap-1">
                <ToggleRight className="size-3" />
                Múltiplas respostas
              </Badge>
            )}
          </div>
        </PageHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold">{campos.length}</p>
              <p className="text-xs text-muted-foreground">Campos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold">{instances.length}</p>
              <p className="text-xs text-muted-foreground">Instâncias</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold">
                {campos.filter(c => c.is_indicador).length}
              </p>
              <p className="text-xs text-muted-foreground">Indicadores</p>
            </CardContent>
          </Card>
        </div>

        {/* Campos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Campos do Formulário</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Obrigatório</TableHead>
                  <TableHead>Indicador</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campos.map((campo, index) => (
                  <TableRow key={campo.id}>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">{campo.label}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{tipoCampoLabels[campo.tipo] || campo.tipo}</Badge>
                    </TableCell>
                    <TableCell>
                      {campo.obrigatorio ? (
                        <ToggleRight className="size-4 text-primary" />
                      ) : (
                        <ToggleLeft className="size-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      {campo.is_indicador ? (
                        <Badge variant="secondary" className="text-xs">
                          {campo.nome_indicador || 'Indicador'}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Instâncias */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Instâncias Vinculadas</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Criado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-20 text-center text-muted-foreground">
                      Nenhuma instância criada para este template.
                    </TableCell>
                  </TableRow>
                ) : (
                  instances.map((inst) => (
                    <TableRow key={inst.id}>
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
      </div>
    </AppShell>
  )
}
