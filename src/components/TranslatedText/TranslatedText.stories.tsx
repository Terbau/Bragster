import type { Meta, StoryObj } from "@storybook/react";
import { TranslatedText } from "./TranslatedText";

const meta = {
  component: TranslatedText,
  title: "Components/TranslatedText",
} satisfies Meta<typeof TranslatedText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    originalText: "Hello, world!",
    language: "en",
    children: "Hallo, verden!",
  },
};
