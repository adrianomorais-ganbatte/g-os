import type { Meta, StoryObj } from '@storybook/react';
import { PageHeader } from './page-header';
import { Button } from '@/components/ui/button';
import { 
  Trash2, 
  Pencil, 
  Download, 
  Plus, 
  Handshake, 
  Calendar, 
  ListOrdered, 
  Users,
  Briefcase,
  CheckSquare,
  Search
} from 'lucide-react';

const meta: Meta<typeof PageHeader> = {
  title: 'Layout/PageHeader',
  component: PageHeader,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="max-w-[1200px] border border-dashed border-zinc-300 rounded-lg bg-zinc-50/30 p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  args: {
    title: 'Nome da página',
    description: 'Descrição da página',
    actions: (
      <>
        <Button variant="ghost" size="icon" className="text-destructive hover:bg-transparent hover:text-destructive/80 p-0 h-auto">
          <Trash2 className="size-4" />
        </Button>
        <Button variant="outline" className="gap-2 text-muted-foreground mr-1">
          <Pencil className="size-4" />
          <span>Editar</span>
        </Button>
        <Button variant="outline" className="gap-2 text-[#F37D5E] border-[#F37D5E] hover:text-[#e46d4e] hover:bg-[#F37D5E]/10">
          <Download className="size-4" />
          <span>Exportar</span>
        </Button>
        <Button className="gap-2 bg-[#F37D5E] hover:bg-[#F37D5E]/90 text-white border-0">
          <Plus className="size-4" />
          <span>Novo programa</span>
        </Button>
      </>
    ),
    metadata: [
      { icon: Handshake, label: 'Financiado por: nome 1, nome 2, nome 3...' },
      { icon: Calendar, label: 'De dd/mm/aaaa a dd/mm/aaaa' },
      { icon: ListOrdered, label: 'n vagas' },
      { icon: Users, label: 'n inscritos' },
    ],
    navigation: (
      <div className="flex bg-slate-100/80 p-1.5 rounded-[14px] w-fit items-center gap-1">
        {/* Item Ativo */}
        <Button variant="ghost" className="gap-2 h-9 rounded-[10px] px-3.5 py-1.5 text-sm bg-white text-zinc-900 shadow-sm hover:bg-white hover:text-zinc-900 pointer-events-none">
          <Briefcase className="size-4" />
          <span className="font-medium">Negócios</span>
        </Button>
        {/* Itens Inativos */}
        <Button variant="ghost" className="gap-2 h-9 rounded-[10px] px-3.5 py-1.5 text-sm text-muted-foreground hover:text-zinc-900 hover:bg-slate-200/50">
          <Users className="size-4" />
          <span className="font-medium">Participantes</span>
        </Button>
        <Button variant="ghost" className="gap-2 h-9 rounded-[10px] px-3.5 py-1.5 text-sm text-muted-foreground hover:text-zinc-900 hover:bg-slate-200/50">
          <CheckSquare className="size-4" />
          <span className="font-medium">Oficinas</span>
        </Button>
        <Button variant="ghost" className="gap-2 h-9 rounded-[10px] px-3.5 py-1.5 text-sm text-muted-foreground hover:text-zinc-900 hover:bg-slate-200/50">
          <Search className="size-4" />
          <span className="font-medium">Pesquisas</span>
        </Button>
      </div>
    ),
  },
};
