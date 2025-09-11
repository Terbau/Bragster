import type { Meta, StoryObj } from "@storybook/react";
import { AvatarGroup } from "./AvatarGroup";

const meta = {
  component: AvatarGroup,
  title: "Components/Avatar/AvatarGroup",
} satisfies Meta<typeof AvatarGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    users: [
      {
        id: "1",
        email: "user1@example.com",
        createdAt: new Date("2023-01-01T00:00:00Z"),
      },
      {
        id: "2",
        email: "user2@example.com",
        createdAt: new Date("2023-01-02T00:00:00Z"),
      },
      {
        id: "3",
        email: "user3@example.com",
        createdAt: new Date("2023-01-03T00:00:00Z"),
      },
      {
        id: "4",
        email: "user4@example.com",
        createdAt: new Date("2023-01-04T00:00:00Z"),
      },
    ],
  },
};
