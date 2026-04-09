import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SearchInput } from './search-input';

const meta: Meta<typeof SearchInput> = {
  title: 'UI/SearchInput',
  component: SearchInput,
  parameters: {
    layout: 'centered',
  },
};

export default meta;

export const Default: StoryObj<typeof SearchInput> = {
  args: {
    placeholder: 'Pesquisar...',
  },
  render: (args) => (
    <div className="w-[300px]">
      <SearchInput {...args} />
    </div>
  ),
};
