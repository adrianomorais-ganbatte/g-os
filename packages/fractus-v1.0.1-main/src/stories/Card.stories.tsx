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

export const Minimalist: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-8 w-max">
      {/* Variante Com Ícone */}
      <Card className="w-[250px] border border-slate-200 border-t-[6px] border-t-zinc-900 rounded-xl shadow-sm overflow-hidden flex flex-row items-center p-4 gap-4 hover:shadow-md transition-all">
        <div className="flex items-center justify-center w-12 h-12 bg-slate-100 rounded-lg shrink-0">
          <div className="w-5 h-5 border border-dashed border-slate-400 rounded-sm"></div>
        </div>
        <div className="flex flex-col text-left text-start">
          <span className="text-xs font-medium text-slate-600">Título</span>
          <span className="text-2xl font-semibold text-zinc-900 leading-none mt-1">n</span>
        </div>
      </Card>

      {/* Variante Sem Ícone */}
      <Card className="w-[250px] border border-slate-200 border-t-[6px] border-t-zinc-900 rounded-xl shadow-sm overflow-hidden flex flex-col p-4 justify-center hover:shadow-md transition-all text-left text-start">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-600">Título</span>
          <span className="text-2xl font-semibold text-zinc-900 leading-none mt-1">n</span>
        </div>
      </Card>
    </div>
  ),
};

export const Colorful: Story = {
  render: () => (
    <div className="flex gap-4 p-8 w-max flex-wrap max-w-4xl">
      {/* 1. Rosa */}
      <Card className="w-[160px] border border-rose-200 border-t-4 border-t-rose-400 rounded-xl shadow-sm overflow-hidden">
        <CardHeader className="pb-2 text-start">
          <CardTitle className="text-sm font-medium text-slate-700">Título</CardTitle>
        </CardHeader>
        <CardContent className="text-start">
          <div className="text-2xl font-semibold text-slate-900 leading-none">n</div>
        </CardContent>
      </Card>

      {/* 2. Laranja Fractus */}
      <Card className="w-[160px] border border-orange-200 border-t-4 border-t-[#F37D5E] rounded-xl shadow-sm overflow-hidden">
        <CardHeader className="pb-2 text-start">
          <CardTitle className="text-sm font-medium text-slate-700">Título</CardTitle>
        </CardHeader>
        <CardContent className="text-start">
          <div className="text-2xl font-semibold text-slate-900 leading-none">n</div>
        </CardContent>
      </Card>

      {/* 3. Amarelo */}
      <Card className="w-[160px] border border-amber-200 border-t-4 border-t-amber-400 rounded-xl shadow-sm overflow-hidden">
        <CardHeader className="pb-2 text-start">
          <CardTitle className="text-sm font-medium text-slate-700">Título</CardTitle>
        </CardHeader>
        <CardContent className="text-start">
          <div className="text-2xl font-semibold text-slate-900 leading-none">n</div>
        </CardContent>
      </Card>

      {/* 4. Verde */}
      <Card className="w-[160px] border border-emerald-200 border-t-4 border-t-emerald-500 rounded-xl shadow-sm overflow-hidden">
        <CardHeader className="pb-2 text-start">
          <CardTitle className="text-sm font-medium text-slate-700">Título</CardTitle>
        </CardHeader>
        <CardContent className="text-start">
          <div className="text-2xl font-semibold text-slate-900 leading-none">n</div>
        </CardContent>
      </Card>

      {/* 5. Indigo/Azul Escuro */}
      <Card className="w-[160px] border border-indigo-200 border-t-4 border-t-indigo-500 rounded-xl shadow-sm overflow-hidden">
        <CardHeader className="pb-2 text-start">
          <CardTitle className="text-sm font-medium text-slate-700">Título</CardTitle>
        </CardHeader>
        <CardContent className="text-start">
          <div className="text-2xl font-semibold text-slate-900 leading-none">n</div>
        </CardContent>
      </Card>

      {/* 6. Sky/Cyan */}
      <Card className="w-[160px] border border-sky-200 border-t-4 border-t-sky-500 rounded-xl shadow-sm overflow-hidden">
        <CardHeader className="pb-2 text-start">
          <CardTitle className="text-sm font-medium text-slate-700">Título</CardTitle>
        </CardHeader>
        <CardContent className="text-start">
          <div className="text-2xl font-semibold text-slate-900 leading-none">n</div>
        </CardContent>
      </Card>
    </div>
  ),
};
