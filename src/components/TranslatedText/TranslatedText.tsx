import type { ComponentProps, ElementType } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { ArrowRight, Bot } from "lucide-react";
import { cn } from "@/utils/utils";

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
        // "px-1 py-0.5 rounded-sm bg-gradient-to-r from-blue-100/80 to-purple-100/80 dark:from-blue-900/80 dark:to-purple-900/80",
        "border-b-2 border-dotted border-slate-400",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{comp}</TooltipTrigger>
        <TooltipContent className="flex flex-col gap-1">
          <span className="flex flex-row items-center gap-1">
            Translated by AI
            <Bot className="inline h-4 w-4" />
            <span className="text-xs ml-auto border px-2 py-0.5 rounded-sm bg-blue-200 dark:bg-blue-700">
              {language.toUpperCase()}
            </span>
          </span>
          <p className="flex flex-row items-center gap-0.5">
            <span className="px-1 py-0.5 border rounded-sm">
              {originalText}
            </span>
            <ArrowRight className="inline h-4 w-4" />
            <span className="px-1 py-0.5 border rounded-sm">{children}</span>
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
