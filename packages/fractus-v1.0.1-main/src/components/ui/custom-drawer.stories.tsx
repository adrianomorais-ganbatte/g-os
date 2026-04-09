import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CustomDrawer } from './custom-drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { DateBadge } from '@/components/ui/data-badge';

const meta: Meta<typeof CustomDrawer> = {
  title: 'UI/CustomDrawer',
  component: CustomDrawer,
  parameters: {
    layout: 'centered',
  },
};

export default meta;

export const Default: StoryObj<typeof CustomDrawer> = {
  render: () => {
    const [open, setOpen] = React.useState(false);

    return (
      <div>
        <Button onClick={() => setOpen(true)} className="bg-[#F37D5E] hover:bg-[#F37D5E]/90 text-white">
          Abrir Drawer
        </Button>
        
        <CustomDrawer
          open={open}
          onOpenChange={setOpen}
          title="Negócio"
          description="Preencha os dados para cadastrar um novo participante"
          onCancel={() => setOpen(false)}
          onSave={() => alert('Salvo com sucesso!')}
        >
          {/* Slot simulando o bloco cinza do figma */}
          <div className="bg-slate-100 w-full h-[600px] flex items-center justify-center rounded-md font-medium text-lg text-slate-800">
            Conteúdo do drawer
          </div>
        </CustomDrawer>
      </div>
    );
  },
};

export const WithFormContent: StoryObj<typeof CustomDrawer> = {
  render: () => {
    const [open, setOpen] = React.useState(false);

    return (
      <div>
        <Button onClick={() => setOpen(true)} className="bg-[#F37D5E] hover:bg-[#F37D5E]/90 text-white">
          Abrir Drawer de Cadastro
        </Button>
        
        <CustomDrawer
          open={open}
          onOpenChange={setOpen}
          title="Negócio"
          description="Preencha os dados para cadastrar um novo participante"
          onCancel={() => setOpen(false)}
          onSave={() => alert('Salvo com sucesso!')}
        >
          <div className="space-y-6">
            {/* Seção 1 */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Informações pessoais</h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-8">
                  <label className="text-sm font-medium text-slate-800 mb-1 block">Nome completo *</label>
                  <Input placeholder="Ex: Maria Silva Santos" />
                </div>
                <div className="col-span-4">
                  <label className="text-sm font-medium text-slate-800 mb-1 block">Nascimento *</label>
                  <DateBadge date={null} />
                </div>
                <div className="col-span-6">
                  <label className="text-sm font-medium text-slate-800 mb-1 block">Email *</label>
                  <Input placeholder="Ex: maria@email.com" />
                </div>
                <div className="col-span-6">
                  <label className="text-sm font-medium text-slate-800 mb-1 block">Telefone *</label>
                  <Input placeholder="(11) 98765-4321" />
                </div>
                <div className="col-span-6">
                  <label className="text-sm font-medium text-slate-800 mb-1 block">Raça *</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="branca">Branca</SelectItem>
                      <SelectItem value="parda">Parda</SelectItem>
                      <SelectItem value="preta">Preta</SelectItem>
                      <SelectItem value="amarela">Amarela</SelectItem>
                      <SelectItem value="indigena">Indígena</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-6">
                  <label className="text-sm font-medium text-slate-800 mb-1 block">Gênero</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Seção 2 */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Negócio</h3>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-slate-800 mb-1 block">Selecione um negócio</label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione ou crie um negócio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="negocio1">Negócio 1</SelectItem>
                    <SelectItem value="negocio2">Negócio 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Seção 3 */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Endereço</h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12">
                  <label className="text-sm font-medium text-slate-800 mb-1 block">CEP</label>
                  <Input placeholder="00000-000" />
                </div>
                <div className="col-span-8">
                  <label className="text-sm font-medium text-slate-800 mb-1 block">Endereço</label>
                  <Input placeholder="Rua, Avenida, etc." />
                </div>
                <div className="col-span-4">
                  <label className="text-sm font-medium text-slate-800 mb-1 block">Número</label>
                  <Input placeholder="123" />
                </div>
                <div className="col-span-6">
                  <label className="text-sm font-medium text-slate-800 mb-1 block">Complemento</label>
                  <Input placeholder="Apto, Bloco, etc." />
                </div>
                <div className="col-span-6">
                  <label className="text-sm font-medium text-slate-800 mb-1 block">Bairro</label>
                  <Input placeholder="Centro" />
                </div>
                <div className="col-span-6">
                  <label className="text-sm font-medium text-slate-800 mb-1 block">Cidade</label>
                  <Input placeholder="São Paulo" />
                </div>
                <div className="col-span-6">
                  <label className="text-sm font-medium text-slate-800 mb-1 block">UF</label>
                  <Input placeholder="SP" />
                </div>
              </div>
            </div>

            {/* Seção 4 */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Status do participante</h3>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-slate-800 mb-1 block">Status *</label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pré-selecionado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pre-selecionado">Pré-selecionado</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="reprovado">Reprovado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

          </div>
        </CustomDrawer>
      </div>
    );
  },
};
