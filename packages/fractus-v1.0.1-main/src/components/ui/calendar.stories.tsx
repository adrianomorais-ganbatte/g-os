import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Calendar } from './calendar';
import { ptBR } from 'date-fns/locale';

const meta: Meta<typeof Calendar> = {
    title: 'UI/Calendar',
    component: Calendar,
    parameters: {
        layout: 'centered',
    },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

// Variação 1: Seleção de Dia Único
export const SingleDate: Story = {
    render: () => {
        const [date, setDate] = React.useState<Date | undefined>(new Date());

        return (
            <div className="rounded-md border shadow-sm bg-white">
                {/* @ts-ignore - Ignorando o aviso de união de tipos do react-day-picker no Storybook */}
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    locale={ptBR}
                    className="p-3"
                />
            </div>
        );
    },
};

// Variação 2: Seleção de Período (Range)
export const DateRange: Story = {
    render: () => {
        const [date, setDate] = React.useState<any>({
            from: new Date(),
            to: new Date(new Date().setDate(new Date().getDate() + 5)),
        });

        return (
            <div className="rounded-md border shadow-sm bg-white">
                {/* @ts-ignore - Ignorando o aviso de união de tipos do react-day-picker no Storybook */}
                <Calendar
                    mode="range"
                    selected={date}
                    onSelect={setDate}
                    locale={ptBR}
                    className="p-3"
                />
            </div>
        );
    },
};