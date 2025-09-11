import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "./Avatar";

const meta = {
  component: Avatar,
  title: "Components/Avatar/Avatar",
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    src: "https://example.com/avatar.jpg",
    email: "user@example.com",
  },
};
