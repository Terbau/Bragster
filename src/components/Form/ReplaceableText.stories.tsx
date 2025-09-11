import type { Meta, StoryObj } from "@storybook/react";
import { ReplaceableText } from "./ReplaceableText";

const meta = {
  component: ReplaceableText,
  title: "Components/ReplaceableText",
} satisfies Meta<typeof ReplaceableText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    text: "10 euro",
  },
};

export const Multiple = {
  render: () => (
    <div className="flex flex-col">
      <ReplaceableText text="10 euro" />
      <ReplaceableText text="20 euro" />
      <ReplaceableText text="30 euro" />
    </div>
  ),
};
