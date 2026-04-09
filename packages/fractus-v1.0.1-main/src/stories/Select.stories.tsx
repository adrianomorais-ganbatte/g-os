import type { Meta, StoryObj } from '@storybook/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const meta = {
  title: 'UI/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">Ativo</SelectItem>
        <SelectItem value="dark">Inativo</SelectItem>
        <SelectItem value="system">Pendente</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const ProgramSelection: Story = {
  render: () => (
    <div className="w-[300px] space-y-2">
      <label className="text-sm font-medium">Selecione o Programa</label>
      <Select defaultValue="p1">
        <SelectTrigger>
          <SelectValue placeholder="Selecione..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="p1">Lideranças 2026</SelectItem>
          <SelectItem value="p2">Impacto Tech</SelectItem>
          <SelectItem value="p3">Socio-ambiental</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};
