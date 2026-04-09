import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '../components/ui/badge';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Novo',
    variant: 'default',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Programa Ativo',
    variant: 'secondary',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Atrasado',
    variant: 'destructive',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Draft',
    variant: 'ghost',
  },
};
