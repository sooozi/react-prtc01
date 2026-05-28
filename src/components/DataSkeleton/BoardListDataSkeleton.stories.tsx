import type { Meta, StoryObj } from "@storybook/react-vite";
import BoardListDataSkeleton from "./BoardListDataSkeleton.tsx";
import "@/pages/post/list/List.scss";
import * as React from "react";

const meta = {
  title: "Components/DataSkeleton/BoardListDataSkeleton",
  component: BoardListDataSkeleton,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  argTypes: {
    rows: { control: { type: "number", min: 1, max: 15, step: 1 } },
  },
  decorators: [
    (Story) => (
      <div className="board-page" style={{ maxWidth: "56rem", width: "100%" }}>
        <div className="board-page__list">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof BoardListDataSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { rows: 8 },
};

export const FewRows: Story = {
  args: { rows: 3 },
};

