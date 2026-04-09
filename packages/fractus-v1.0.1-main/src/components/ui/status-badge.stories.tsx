import type { Meta, StoryObj } from '@storybook/react';
import { StatusBadge } from './status-badge';

const meta: Meta<typeof StatusBadge> = {
  title: 'UI/StatusBadge',
  component: StatusBadge,
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof StatusBadge>;

// Story principal exigida mapeando as 4 variantes exatas de status
export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-8 bg-zinc-50 rounded-xl border border-zinc-200 border-dashed">
      {/* Container flex para replicar exatamente a imagem Horizontalmente */}
      <div className="flex flex-row items-center gap-4">
        <StatusBadge status="cadastrado" />
        <StatusBadge status="inativado" />
        <StatusBadge status="selecionado" />
        <StatusBadge status="ativo" />
      </div>
    </div>
  ),
};
