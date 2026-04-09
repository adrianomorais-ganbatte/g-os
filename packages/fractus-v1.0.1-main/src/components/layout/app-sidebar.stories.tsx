import type { Meta, StoryObj } from '@storybook/react';
import { AppSidebar } from './app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

const meta: Meta<typeof AppSidebar> = {
  title: 'Layout/AppSidebar',
  component: AppSidebar,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-slate-50 min-h-screen w-full flex">
        <SidebarProvider>
          <Story />
          {/* Placeholder for the main content area so we can ver o comportamento ao abrir e fechar a sidebardo layout */}
        <main className="flex-1 p-6 bg-zinc-50 overflow-auto h-screen w-full">
          <div className="max-w-[1200px] gap-4 flex flex-col mx-auto">
            <h1 className="text-2xl font-bold">Conteúdo Principal</h1>
            <p className="text-muted-foreground max-w-lg">
              Esta área simula a porção principal (main) da aplicação ao lado da barra lateral (AppSidebar). Utilize o ícone de Hamburger no topo da barra lateral para experienciar o comportamento <i>collapsible</i> e os Tooltips sobre os ícones.
            </p>
          </div>
        </main>
        </SidebarProvider>
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof AppSidebar>;

export const Default: Story = {};
