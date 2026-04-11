import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Eye, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Trash2,
  Link
} from 'lucide-react';

const meta: Meta<typeof Table> = {
  title: 'UI/Table',
  component: Table,
  parameters: {
    layout: 'padded',
  },
};

export default meta;

export const ShowcaseMock: StoryObj = {
  render: () => {
    // Gerar 10 linhas repetidas pro mock
    const rows = Array.from({ length: 10 }).map((_, i) => ({
      id: i,
      participante: 'Nome do participante',
      negocio: 'Nome do negócio',
      satisfacao: 'x% (satisfação)',
      presenca: 'x% (presença)',
      ativo: i % 2 === 0, // Intercala ligado/desligado para visualização
    }));

    return (
      <div className="w-full max-w-6xl mx-auto rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden flex flex-col">
        {/* Container da Tabela com overflow para scroll se necessário */}
        <div className="w-full overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-medium text-zinc-500 min-w-[200px]">
                  <div className="flex items-center gap-2 cursor-pointer hover:text-zinc-700">
                    Projeto <ArrowUpDown className="h-3 w-3 text-zinc-400" />
                  </div>
                </TableHead>
                <TableHead className="font-medium text-zinc-500 min-w-[200px]">
                  <div className="flex items-center gap-2 cursor-pointer hover:text-zinc-700">
                    Investidores <ArrowUpDown className="h-3 w-3 text-zinc-400" />
                  </div>
                </TableHead>
                <TableHead className="font-medium text-zinc-500">
                  <div className="flex items-center gap-2 cursor-pointer hover:text-zinc-700">
                    Frente <ArrowUpDown className="h-3 w-3 text-zinc-400" />
                  </div>
                </TableHead>
                <TableHead className="font-medium text-zinc-500">
                  <div className="flex items-center gap-2 cursor-pointer hover:text-zinc-700">
                    Execução <ArrowUpDown className="h-3 w-3 text-zinc-400" />
                  </div>
                </TableHead>
                <TableHead className="font-medium text-zinc-500">
                  <div className="flex items-center gap-2 cursor-pointer hover:text-zinc-700">
                    Presença <ArrowUpDown className="h-3 w-3 text-zinc-400" />
                  </div>
                </TableHead>
                <TableHead className="font-medium text-zinc-500">
                  <div className="flex items-center gap-2 cursor-pointer hover:text-zinc-700">
                    NPS <ArrowUpDown className="h-3 w-3 text-zinc-400" />
                  </div>
                </TableHead>
                <TableHead className="font-medium text-zinc-500 w-[100px]">Ativo</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} className="bg-white hover:bg-zinc-50/50">
                  <TableCell className="font-medium text-zinc-700 py-4">
                    {row.participante}
                  </TableCell>
                  <TableCell className="text-zinc-600">
                    {row.negocio}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status="cadastrado" className="pointer-events-none" />
                  </TableCell>
                  <TableCell className="text-zinc-600">
                    {row.satisfacao}
                  </TableCell>
                  <TableCell className="text-zinc-600">
                    {row.presenca}
                  </TableCell>
                  <TableCell className="text-zinc-600">
                    {/* Placeholder para a coluna NPS caso tivéssemos o valor, o print engloba NPS em branco ou algo parecido */}
                    -
                  </TableCell>
                  <TableCell>
                    <Switch 
                      defaultChecked={row.ativo} 
                      className="data-[state=checked]:bg-[#F37D5E]" 
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-600">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Rodapé de Paginação customizado */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-zinc-200 bg-white">
          
          <div className="flex items-center gap-12">
            
            {/* Bloco Esquerda (Texto + Select) */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-600">Exibição por página</span>
              <Select defaultValue="10">
                <SelectTrigger className="w-[70px] h-8 bg-transparent text-zinc-700">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bloco Direita (Texto + Botões) grudados e alinhados */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-zinc-700">Página 1 de 1</span>
              
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-700 disabled:opacity-50" disabled>
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-700 disabled:opacity-50" disabled>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-700 disabled:opacity-50" disabled>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-700 disabled:opacity-50" disabled>
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  },
};

export const RowVariations: StoryObj = {
  render: () => {
    return (
      <div className="w-full max-w-6xl mx-auto rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden flex flex-col p-4">
        
        <Table>
          <TableBody className="[&_tr]:border-b-8 [&_tr]:border-transparent">
            {/* Linha 1 */}
            <TableRow className="bg-white hover:bg-zinc-50/50 shadow-sm border border-zinc-100 rounded-lg">
              <TableCell className="font-medium text-zinc-700 py-4 max-w-[200px] truncate">
                Programa de Capacitação Profis...
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="font-normal text-zinc-600 bg-zinc-100/80">Fundação ABC</Badge>
                  <Badge variant="secondary" className="font-normal text-zinc-600 bg-zinc-100/80">Instituto XYZ</Badge>
                </div>
              </TableCell>
              <TableCell className="text-zinc-600">Frente</TableCell>
              <TableCell className="text-zinc-600">80%</TableCell>
              <TableCell className="text-zinc-600">80%</TableCell>
              <TableCell className="text-zinc-600">80%</TableCell>
              <TableCell className="w-[80px]">
                <Switch defaultChecked className="data-[state=checked]:bg-[#F37D5E]" />
              </TableCell>
              <TableCell className="text-right w-[60px]">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-600">
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>

            {/* Linha 2 */}
            <TableRow className="bg-white hover:bg-zinc-50/50 shadow-sm border border-zinc-100 rounded-lg">
              <TableCell className="font-medium text-zinc-700 py-4">Nome do participante</TableCell>
              <TableCell className="text-zinc-600">Nome do negócio</TableCell>
              <TableCell>
                <StatusBadge status="cadastrado" className="pointer-events-none" />
              </TableCell>
              <TableCell className="text-zinc-600">x% (satisfação)</TableCell>
              <TableCell className="text-zinc-600">x% (presença)</TableCell>
              <TableCell className="text-zinc-600"></TableCell>
              <TableCell>
                <Switch defaultChecked className="data-[state=checked]:bg-[#F37D5E]" />
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-600">
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>

            {/* Linha 3 */}
            <TableRow className="bg-white hover:bg-zinc-50/50 shadow-sm border border-zinc-100 rounded-lg">
              <TableCell className="py-4">
                <Badge variant="outline" className="font-normal text-zinc-600">Nome do negócio</Badge>
              </TableCell>
              <TableCell className="text-zinc-600">n</TableCell>
              <TableCell className="text-zinc-600"></TableCell>
              <TableCell className="text-zinc-600">n</TableCell>
              <TableCell className="text-zinc-600"></TableCell>
              <TableCell className="text-zinc-600"></TableCell>
              <TableCell>
                <Switch defaultChecked className="data-[state=checked]:bg-[#F37D5E]" />
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-600">
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>

            {/* Linha 4 */}
            <TableRow className="bg-white hover:bg-zinc-50/50 shadow-sm border border-zinc-100 rounded-lg">
              <TableCell className="font-medium text-zinc-700 py-4">dd/mm/aaaa</TableCell>
              <TableCell className="text-zinc-600">Nome do módulo</TableCell>
              <TableCell className="text-zinc-600"></TableCell>
              <TableCell className="text-zinc-600">n/n</TableCell>
              <TableCell>
                <Link className="h-4 w-4 text-rose-500" />
              </TableCell>
              <TableCell className="text-zinc-600">n%</TableCell>
              <TableCell>
                <Switch defaultChecked className="data-[state=checked]:bg-[#F37D5E]" />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-1 justify-end">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-600">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>

            {/* Linha 5 */}
            <TableRow className="bg-white hover:bg-zinc-50/50 shadow-sm border border-zinc-100 rounded-lg">
              <TableCell className="font-medium text-zinc-700 py-4">dd/mm/aaaa</TableCell>
              <TableCell className="text-zinc-600">
                <div className="flex items-center gap-2">
                  Identificador (nome)
                  <Badge variant="secondary" className="font-normal text-zinc-600 bg-zinc-100/80">diagnóstico</Badge>
                </div>
              </TableCell>
              <TableCell className="text-zinc-600">Nome do template</TableCell>
              <TableCell className="text-zinc-600">n/n (n%)</TableCell>
              <TableCell className="text-zinc-600">n%</TableCell>
              <TableCell className="text-zinc-600"></TableCell>
              <TableCell>
                <Switch defaultChecked className="data-[state=checked]:bg-[#F37D5E]" />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-1 justify-end items-center">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-[#F37D5E] hover:text-[#F37D5E]/80 hover:bg-[#F37D5E]/10">
                    <Link className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-600">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>

            {/* Linha 6 */}
            <TableRow className="bg-white hover:bg-zinc-50/50 shadow-sm border border-zinc-100 rounded-lg">
              <TableCell className="font-medium text-zinc-700 py-4">Nome</TableCell>
              <TableCell className="text-zinc-600">Tipo</TableCell>
              <TableCell className="text-zinc-600">Segmento</TableCell>
              <TableCell className="text-zinc-600">Materialidade</TableCell>
              <TableCell className="text-zinc-600">Valor de poio</TableCell>
              <TableCell className="text-zinc-600 max-w-[200px] leading-relaxed">
                Icentivo á leitura, Processamento de dados.
              </TableCell>
              <TableCell>
                <Switch defaultChecked className="data-[state=checked]:bg-[#F37D5E]" />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-1 justify-end">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-600">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            
          </TableBody>
        </Table>

      </div>
    );
  },
};

export const HeadingVariations: StoryObj = {
  render: () => {
    const SortableHead = ({ children, className }: { children: React.ReactNode, className?: string }) => (
      <TableHead className={className}>
        <div className="flex items-center gap-2 w-max cursor-pointer text-zinc-500 hover:text-zinc-800 transition-colors group">
          {children} <ArrowUpDown className="h-3 w-3 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
        </div>
      </TableHead>
    );

    return (
      <div className="w-full max-w-6xl mx-auto flex flex-col p-6 space-y-4 bg-white">
        {/* V1 */}
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50 font-medium border-b-0 shadow-sm rounded-md">
                  <SortableHead className="rounded-l-md font-medium">Projeto</SortableHead>
                  <SortableHead className="font-medium">Investidores</SortableHead>
                  <SortableHead className="font-medium">Frente</SortableHead>
                  <SortableHead className="font-medium">Execução</SortableHead>
                  <SortableHead className="font-medium">Presença</SortableHead>
                  <SortableHead className="font-medium">NPS</SortableHead>
                  <TableHead className="rounded-r-md font-medium text-zinc-500 w-[100px]">Ativo</TableHead>
                </TableRow>
              </TableHeader>
            </Table>

            {/* V2 */}
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50 font-medium border-b-0 shadow-sm rounded-md">
                  <SortableHead className="rounded-l-md font-medium">Participante</SortableHead>
                  <SortableHead className="font-medium">Negócio</SortableHead>
                  <SortableHead className="font-medium">Status</SortableHead>
                  <SortableHead className="font-medium">Satisfação</SortableHead>
                  <SortableHead className="font-medium">Presença</SortableHead>
                  <TableHead className="rounded-r-md font-medium text-zinc-500 w-[100px]">Ativo</TableHead>
                </TableRow>
              </TableHeader>
            </Table>

            {/* V3 */}
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50 font-medium border-b-0 shadow-sm rounded-md">
                  <SortableHead className="rounded-l-md font-medium">Nome</SortableHead>
                  <SortableHead className="font-medium">Participantes</SortableHead>
                  <SortableHead className="font-medium">Programas</SortableHead>
                  <TableHead className="rounded-r-md font-medium text-zinc-500 w-[100px]">Ativo</TableHead>
                </TableRow>
              </TableHeader>
            </Table>

            {/* V4 */}
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50 font-medium border-b-0 shadow-sm rounded-md">
                  <SortableHead className="rounded-l-md font-medium">Data</SortableHead>
                  <SortableHead className="font-medium">Módulo</SortableHead>
                  <SortableHead className="font-medium">Presença</SortableHead>
                  <SortableHead className="font-medium">Link</SortableHead>
                  <SortableHead className="font-medium">NPS</SortableHead>
                  <TableHead className="rounded-r-md font-medium text-zinc-500 w-[100px]">Ativo</TableHead>
                </TableRow>
              </TableHeader>
            </Table>

            {/* V5 */}
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50 font-medium border-b-0 shadow-sm rounded-md">
                  <SortableHead className="rounded-l-md font-medium">Data da Atribuição</SortableHead>
                  <SortableHead className="font-medium">Identificador</SortableHead>
                  <SortableHead className="font-medium">Tipo</SortableHead>
                  <SortableHead className="font-medium">Template</SortableHead>
                  <SortableHead className="font-medium">Respostas</SortableHead>
                  <SortableHead className="font-medium">Performance</SortableHead>
                  <TableHead className="rounded-r-md font-medium text-zinc-500 w-[100px]">Ativo</TableHead>
                </TableRow>
              </TableHeader>
            </Table>

            {/* V6 */}
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50 font-medium border-b-0 shadow-sm rounded-md">
                  <SortableHead className="rounded-l-md font-medium">Empresa</SortableHead>
                  <SortableHead className="font-medium">Tipo</SortableHead>
                  <SortableHead className="font-medium">Segmento</SortableHead>
                  <SortableHead className="font-medium">Materialidade</SortableHead>
                  <SortableHead className="font-medium">Valor de apoio</SortableHead>
                  <SortableHead className="font-medium">Projetos</SortableHead>
                  <TableHead className="rounded-r-md font-medium text-zinc-500 w-[100px]">Ativo</TableHead>
                </TableRow>
              </TableHeader>
            </Table>
            
      </div>
    );
  },
};
