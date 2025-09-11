import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Button } from "../ui/button";
import { Check, XIcon } from "lucide-react";
import { Input } from "./Fields";
import { cn } from "@/utils/utils";
import { Spinner } from "../Spinner";

interface ReplaceableTextProps {
  text: string;
  defaultInputValue?: string;
  inputType?: "text" | "number";
  isLoading?: boolean;
  onSubmit?: (newText: string) => void;
  className?: string;
}

export type ReplaceableTextHandle = {
  closeInput: () => void;
};

export const ReplaceableText = forwardRef<
  ReplaceableTextHandle,
  ReplaceableTextProps
>(
  (
    {
      text,
      defaultInputValue,
      inputType = "text",
      isLoading = false,
      onSubmit,
      className,
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useImperativeHandle(ref, () => ({
      closeInput: () => setShowForm(false),
    }));

    const [showForm, setShowForm] = useState(false);
    const [inputValue, setInputValue] = useState(defaultInputValue ?? text);
    const [textWidth, setTextWidth] = useState(0);

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        inputRef.current === document.activeElement
      ) {
        setShowForm(false);
      }
    }, []);

    useEffect(() => {
      setTextWidth(buttonRef.current?.offsetWidth ?? 0);
    }, []);

    useEffect(() => {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    if (!showForm) {
      return (
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setShowForm(true)}
          className={cn("w-fit", className)}
        >
          {text}
        </button>
      );
    }

    return (
      <div className={cn("flex flex-row items-center gap-1", className)}>
        <div className="relative">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoFocus
            className="w-fit"
            style={{ width: textWidth ? textWidth + 20 : undefined }}
            type={inputType}
          />
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="absolute right-1 top-1"
          >
            <XIcon className="h-4 w-4 m-auto text-muted-foreground hover:text-muted-foreground/50" />
          </button>
        </div>
        <Button
          size="icon"
          variant="outline"
          onClick={() => onSubmit?.(inputValue)}
          disabled={isLoading}
        >
          {isLoading ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <Check className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  },
);
