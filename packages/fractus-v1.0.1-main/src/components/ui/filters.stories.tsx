import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MultiSelectFilter } from './multi-select-filter';
import { FilterClearButton } from './filter-clear-button';

const meta: Meta = {
  title: 'UI/Filters',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

const DUMMY_OPTIONS = [
  { label: 'Todos', value: 'todos' },
  { label: 'Item 1', value: 'item-1' },
  { label: 'Item 2', value: 'item-2' },
  { label: 'Item 3', value: 'item-3' },
];

export const InteractiveShowcase = () => {
  const [selected, setSelected] = React.useState<string[]>(['item-1', 'item-2']);

  return (
    <div className="flex flex-row items-end gap-16 p-12 bg-white rounded-xl border border-zinc-200">
      
      {/* Dropdown Variants */}
      <div className="flex flex-col gap-8">
        <div>
          <p className="text-sm text-zinc-500 mb-2">Vazio / Default</p>
          <MultiSelectFilter 
            label="Label"
            options={DUMMY_OPTIONS}
            selectedValues={[]}
            onChange={() => {}}
          />
        </div>
        
        <div>
          <p className="text-sm text-zinc-500 mb-2">Preenchido</p>
          <MultiSelectFilter 
            label="Label"
            options={DUMMY_OPTIONS}
            selectedValues={selected}
            onChange={setSelected}
            onApply={() => alert(`Aplicado: ${selected.join(', ')}`)}
          />
        </div>
      </div>

      {/* Clear Button Variants */}
      <div className="flex flex-col gap-8 items-start">
        <div>
          <p className="text-sm text-zinc-500 mb-2">Inativo (Count: 0)</p>
          <FilterClearButton activeCount={0} />
        </div>
        
        <div>
          <p className="text-sm text-zinc-500 mb-2">Ativo (Count: n)</p>
          <FilterClearButton activeCount={selected.length} onClick={() => setSelected([])} />
        </div>
      </div>

    </div>
  );
};
