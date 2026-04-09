import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Iniciativa Social</CardTitle>
        <CardDescription>Gerenciamento de impacto direto.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Este é um cartão de conteúdo do ecossistema Fractus.</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancelar</Button>
        <Button>Salvar</Button>
      </CardFooter>
    </Card>
  ),
};

export const Statistics: Story = {
  render: () => (
    <div className="flex gap-4">
      
      {/* Variante Rosa */}
      <Card className="w-[200px] border border-slate-200 border-t-4 border-t-rose-400 rounded-xl shadow-sm overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Título</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">n</div>
        </CardContent>
      </Card>

      {/* Variante Laranja Fractus */}
      <Card className="w-[200px] border border-slate-200 border-t-4 border-t-[#F37D5E] rounded-xl shadow-sm overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Título</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">n</div>
        </CardContent>
      </Card>

      {/* Variante Verde */}
      <Card className="w-[200px] border border-slate-200 border-t-4 border-t-emerald-500 rounded-xl shadow-sm overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Título</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">n</div>
        </CardContent>
      </Card>

    </div>
  ),
};
