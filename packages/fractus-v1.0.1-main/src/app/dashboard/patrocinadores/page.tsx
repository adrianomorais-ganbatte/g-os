import { AppShell } from "@/components/layout/app-shell"
import { getSponsors } from "@/app/actions/sponsors/actions"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { CreateSponsorDialog } from "@/components/domain/sponsors/create-sponsor-dialog"
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
import { Search, Building2, Trash2 } from "lucide-react"

export default async function PatrocinadoresListPage() {
  const patrocinadores = await getSponsors()

  return (
    <AppShell>
      <div className="flex flex-col gap-8 p-8">
        <PageHeader
          title="Patrocinadores"
          description="Gerencie os patrocinadores e parceiros dos programas."
          breadcrumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Patrocinadores" }
          ]}
          actions={<CreateSponsorDialog />}
        />

        <Card className="border-none shadow-sm ring-1 ring-foreground/5 bg-white/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="p-4 flex flex-row items-center gap-4 space-y-0 border-b">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por patrocinador..."
                className="pl-9 bg-white/40 h-10 border-foreground/10 focus:bg-white transition-all"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="w-[400px] py-4">Patrocinador</TableHead>
                  <TableHead>Cadastrado em</TableHead>
                  <TableHead className="text-right pr-6">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patrocinadores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-48 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-muted rounded-full">
                          <Building2 className="size-6 opacity-20" />
                        </div>
                        <p>Nenhum patrocinador cadastrado.</p>
                        <CreateSponsorDialog />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  patrocinadores.map((patrocinador) => (
                    <TableRow key={patrocinador.id} className="group hover:bg-muted/40 transition-colors border-b">
                      <TableCell className="font-medium py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary font-bold text-sm">
                            {patrocinador.nome.slice(0, 2).toUpperCase()}
                          </div>
                          <span>{patrocinador.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(patrocinador.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="size-4" />
                        </Button>
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
