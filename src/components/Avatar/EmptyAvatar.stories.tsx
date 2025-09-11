import type { Meta, StoryObj } from "@storybook/react";
import { EmptyAvatar } from "./EmptyAvatar";

const meta = {
  component: EmptyAvatar,
  title: "Components/Avatar/EmptyAvatar",
} satisfies Meta<typeof EmptyAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {},
};
