import type { ComponentProps, MouseEventHandler } from "react";
import { Button } from "../ui/button";
import { Copy } from "lucide-react";

interface CopyButtonProps
  extends Omit<ComponentProps<typeof Button>, "children"> {
  textToCopy: string;
}

export const CopyButton = ({
  textToCopy,
  onClick,
  ...props
}: CopyButtonProps) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      // Optionally, you can add some feedback to the user here
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    try {
      handleCopy();
    } finally {
      onClick?.(e);
    }
  };

  return (
    <Button variant="outline" size="icon" onClick={handleClick} {...props}>
      <Copy className="h-5 w-5" />
    </Button>
  );
};
