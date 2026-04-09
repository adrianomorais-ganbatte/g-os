import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DateBadge } from '../components/ui/data-badge';

const meta = {
  title: 'Forms/DateInput',
  component: DateBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    date: { control: 'date' },
  },
} satisfies Meta<typeof DateBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultVazio: Story = {
  args: {
    date: null,
  },
  render: (args) => (
    <div className="w-[300px]">
      <DateBadge {...args} />
    </div>
  ),
};

export const Preenchido: Story = {
  args: {
    date: new Date('2024-12-30T12:00:00') as unknown as string,
  },
  render: (args) => (
    <div className="w-[300px]">
      <DateBadge {...args} />
    </div>
  ),
};
