import type { ComponentProps, ElementType } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/utils/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type TranslatedTextProps<T extends ElementType> = {
  language: string;
  originalText: string;
  as?: T;
} & ComponentProps<T>;

export const TranslatedText = <T extends ElementType = "p">({
  language,
  originalText,
  as,
  children,
  className,
  ...props
}: TranslatedTextProps<T>) => {
  const Component = as || "p";

  const comp = (
    <Component
      className={cn(
        "border-b border-dotted border-muted-foreground/40 cursor-default",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );

  return (
    <Popover>
      <PopoverTrigger asChild>{comp}</PopoverTrigger>
      <PopoverContent className="w-auto max-w-xs p-3 flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            Translated by AI
          </span>
          <span className="ml-auto text-[10px] font-mono font-medium bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
            {language.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-muted-foreground">{originalText}</span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
          <span className="font-medium">{children}</span>
        </div>
      </PopoverContent>
    </Popover>
  );
};
