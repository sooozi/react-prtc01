import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { fn } from 'storybook/test';
import {
  TableSortIconActiveAsc,
  TableSortIconActiveDesc,
  TableSortIconNeutral,
  TableSortTh,
} from './TableSortHeader';

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

const meta = {
  title: 'Components/TableSortHeader',
  component: TableSortTh,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  render: (args) => <SortThInTable {...args} />,
} satisfies Meta<typeof TableSortTh>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {
  args: {
    align: 'start',
    active: false,
    children: '제목',
  },
};

export const ActiveDesc: Story = {
  args: {
    align: 'start',
    active: true,
    sortDirection: 'DESC',
    children: '등록일',
  },
};

export const ActiveAsc: Story = {
  args: {
    align: 'center',
    active: true,
    sortDirection: 'ASC',
    children: '조회수',
  },
};

export const WithIconButton: Story = {
  args: {
    align: 'start',
    active: false,
    children: '제목',
    onIconClick: fn(),
    iconButtonAriaLabel: '제목 정렬',
  },
};

export const Icons: Story = {
  args: {
    align: 'start',
    children: '',
  },
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <TableSortIconNeutral />
      <TableSortIconActiveDesc />
      <TableSortIconActiveAsc />
    </div>
  ),
};
