import { AppShell } from "@/components/layout/app-shell"
import { getTemplates } from "@/app/actions/templates/actions"
import { PageHeader } from "@/components/layout/page-header"
import { CategoryBadge } from "@/components/ui/category-badge"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
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
import { cn } from "@/lib/utils"
import { Search, Filter, Plus, ExternalLink, ListOrdered } from "lucide-react"
import Link from "next/link"

export default async function TemplatesListPage() {
  const templates = await getTemplates()

  return (
    <AppShell>
      <div className="flex flex-col gap-8 p-8">
        <PageHeader
          title="Templates de Coleta"
          description="Crie e gerencie formulários reutilizáveis para diagnósticos e pesquisas."
          breadcrumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Templates" }
          ]}
          actions={
            <Button
              render={(props) => (
                <Link href="/dashboard/templates/novo" {...props} className={cn(props.className, "gap-2")}>
                  <Plus className="size-4" />
                  Novo Template
                </Link>
              )}
            />
          }
        />

        <Card className="border-none shadow-sm ring-1 ring-foreground/5 bg-white/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="p-4 flex flex-row items-center gap-4 space-y-0 border-b">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por template..."
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
                  <TableHead className="w-[300px] py-4">Template</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Campos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-muted rounded-full">
                          <ListOrdered className="size-6 opacity-20" />
                        </div>
                        <p>Nenhum template encontrado.</p>
                        <Button size="sm"
                          render={(props) => (
                            <Link href="/dashboard/templates/novo" {...props}>Criar Template</Link>
                          )}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  templates.map((template) => (
                    <TableRow key={template.id} className="group hover:bg-muted/40 transition-colors border-b">
                      <TableCell className="font-medium py-4">
                        <div className="flex flex-col gap-0.5">
                          <Link
                            href={`/dashboard/templates/${template.id}`}
                            className="hover:text-primary transition-colors cursor-pointer"
                          >
                            {template.nome}
                          </Link>
                          <span className="text-sm text-muted-foreground font-normal line-clamp-1 opacity-70 group-hover:opacity-100 transition-opacity">
                            {template.descricao || 'Sem descrição'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <CategoryBadge category={template.tipo} />
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">
                          {template.campo_templates?.length || 0} campos
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={template.ativo ? 'ativo' : 'inativo'} />
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="sm"
                          render={(props) => (
                            <Link href={`/dashboard/templates/${template.id}`} {...props} className={cn(props.className, "flex items-center gap-2")}>
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
