import { AppShell } from "@/components/layout/app-shell"
import { getDeals } from "@/app/actions/deals/actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Briefcase, TrendingUp, Handshake } from "lucide-react"
import { CreateDealDialog } from "@/components/domain/deals/create-deal-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

const statusMap = {
  prospeccao: { label: 'Prospecção', color: 'bg-zinc-100 text-zinc-700' },
  negociacao: { label: 'Negociação', color: 'bg-blue-100 text-blue-700' },
  fechado: { label: 'Fechado/Ganhos', color: 'bg-green-100 text-green-700' },
  perdido: { label: 'Perdido', color: 'bg-red-100 text-red-700' },
}

export default async function NegociosListPage() {
  const negocios = await getDeals()

  const totalValue = negocios.reduce((acc, curr) => acc + (curr.valor || 0), 0)
  const averageProbability = negocios.length > 0
    ? (negocios.reduce((acc, curr) => acc + (curr.probabilidade || 0), 0) / negocios.length).toFixed(1)
    : 0

  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Oportunidades de Impacto (CRM)</h1>
            <p className="text-muted-foreground">Monitore o pipeline financeiro e parcerias estratégicas.</p>
          </div>
          <CreateDealDialog />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Pipeline Total</CardTitle>
              <TrendingUp className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
              <p className="text-xs text-muted-foreground">{negocios.length} oportunidades ativas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Probabilidade Média</CardTitle>
              <Briefcase className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageProbability}%</div>
              <p className="text-xs text-muted-foreground">Confiança média no pipeline</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Acordos Fechados</CardTitle>
              <Handshake className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {negocios.filter(d => d.status === 'fechado').length}
              </div>
              <p className="text-xs text-muted-foreground">Parcerias concretizadas</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="p-4 flex flex-row items-center gap-4 space-y-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder="Buscar por negócio ou empresa..." className="pl-9" />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="size-4" />
              Filtros
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Nome do Negócio</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Probabilidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {negocios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Nenhum negócio registrado ainda. Crie sua primeira oportunidade de impacto!
                    </TableCell>
                  </TableRow>
                ) : (
                  negocios.map((negocio) => (
                    <TableRow key={negocio.id}>
                      <TableCell className="font-medium">
                        {negocio.nome}
                      </TableCell>
                      <TableCell>{negocio.empresa}</TableCell>
                      <TableCell className="font-semibold text-primary">
                        {formatCurrency(negocio.valor || 0)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 w-24">
                          <span className="text-xs font-medium">{negocio.probabilidade || 0}% de chance</span>
                          <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${negocio.probabilidade || 0}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusMap[negocio.status].color} border-transparent`}>
                          {statusMap[negocio.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                           <a href={`/dashboard/negocios/${negocio.id}`}>Gerenciar</a>
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
