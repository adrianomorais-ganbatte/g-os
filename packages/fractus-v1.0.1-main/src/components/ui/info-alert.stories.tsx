import type { Meta, StoryObj } from '@storybook/react';
import { InfoAlert } from './info-alert';

const meta: Meta<typeof InfoAlert> = {
  title: 'UI/InfoAlert',
  component: InfoAlert,
  parameters: {
    layout: 'centered',
  },
};

export default meta;

export const Default: StoryObj<typeof InfoAlert> = {
  args: {
    title: "ddasddsd",
    children: 'Ao criar a sessão, um link único será gerado contendo formulário de presença (obrigatório). Se selecionado, será acrescido do formulário satisfação (opcional) no mesmo link.',
  },
  render: (args) => (
    <div className="max-w-[500px] w-full">
      <InfoAlert {...args} />
    </div>
  )
};
