import type { Meta, StoryObj } from '@storybook/react';
import { DeleteDialog } from './delete-dialog';

const meta: Meta<typeof DeleteDialog> = {
  title: 'UI/DeleteDialog',
  component: DeleteDialog,
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof DeleteDialog>;

export const Default: Story = {
  args: {
    open: true,
    title: 'Excluir financiador?',
    description: 'Você está prestes a exclui-lo permanentemente o',
    warningContext: 'Esse investidor está apoiando os seguintes programas:',
    affectedItems: ['Direito para Todos', 'PUC-Rio para Todos', 'PUC-Rio para Todos'],
  },
  render: (args) => {
    return (
      <div className="w-[800px] h-[600px] bg-slate-100 flex items-center justify-center relative">
        <DeleteDialog 
          {...args} 
          onOpenChange={() => {}} 
          onCancel={() => alert('Cancelado')}
          onConfirm={() => alert('Item Excluído')}
        />
        <p className="text-muted-foreground absolute bottom-4">
          Modo Aberto Ativado no Storybook (Render Portal)
        </p>
      </div>
    );
  },
};
