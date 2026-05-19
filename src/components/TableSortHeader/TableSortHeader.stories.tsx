import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { fn } from 'storybook/test';
import {
  TableSortIconActiveAsc,
  TableSortIconActiveDesc,
  TableSortIconNeutral,
  TableSortTh,
} from './TableSortHeader';

const meta = {
  title: 'Components/TableSortHeader',
  component: TableSortTh,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof TableSortTh>;

export default meta;
type Story = StoryObj<typeof meta>;

function SortThInTable(props: ComponentProps<typeof TableSortTh>) {
  return (
    <table className="table" style={{ width: '100%', maxWidth: 480 }}>
      <thead>
        <tr>
          <th scope="col">
            <TableSortTh {...props} />
          </th>
        </tr>
      </thead>
    </table>
  );
}

export const Neutral: Story = {
  render: () => (
    <SortThInTable align="start" active={false}>
      제목
    </SortThInTable>
  ),
};

export const ActiveDesc: Story = {
  render: () => (
    <SortThInTable align="start" active sortDirection="DESC">
      등록일
    </SortThInTable>
  ),
};

export const ActiveAsc: Story = {
  render: () => (
    <SortThInTable align="center" active sortDirection="ASC">
      조회수
    </SortThInTable>
  ),
};

export const WithIconButton: Story = {
  render: () => (
    <SortThInTable
      align="start"
      active={false}
      onIconClick={fn()}
      iconButtonAriaLabel="제목 정렬"
    >
      제목
    </SortThInTable>
  ),
};

export const Icons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <TableSortIconNeutral />
      <TableSortIconActiveDesc />
      <TableSortIconActiveAsc />
    </div>
  ),
};
