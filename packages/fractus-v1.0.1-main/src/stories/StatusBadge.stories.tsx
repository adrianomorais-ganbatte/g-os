import type { Meta, StoryObj } from '@storybook/react';
import { StatusBadge } from '../components/ui/status-badge';

const meta = {
  title: 'UI/StatusBadge',
  component: StatusBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: [
        'ativo', 'inativo', 'selecionado', 'concluinte', 'desistente', 
        'publicado', 'rascunho', 'pendente', 'aprovado', 'rejeitado'
      ],
    },
    withIcon: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ativo: Story = {
  args: {
    status: 'ativo',
    withIcon: true,
  },
};

export const Selecionado: Story = {
  args: {
    status: 'selecionado',
    withIcon: true,
  },
};

export const Pendente: Story = {
  args: {
    status: 'pendente',
    withIcon: true,
  },
};

export const Rejeitado: Story = {
  args: {
    status: 'rejeitado',
    withIcon: true,
  },
};

export const Rascunho: Story = {
  args: {
    status: 'rascunho',
    withIcon: true,
  },
};
