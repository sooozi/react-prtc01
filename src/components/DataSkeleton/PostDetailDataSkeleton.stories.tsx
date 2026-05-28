import type { Meta, StoryObj } from "@storybook/react-vite";
import PostDetailDataSkeleton from "./PostDetailDataSkeleton.tsx";
import "@/pages/post/detail/Detail.scss";
import * as React from "react";

const meta = {
  title: "Components/DataSkeleton/PostDetailDataSkeleton",
  component: PostDetailDataSkeleton,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="post-detail-page" style={{ maxWidth: "50rem", width: "100%" }}>
        <div className="post-detail-card">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof PostDetailDataSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

