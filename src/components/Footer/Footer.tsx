import { cn } from "@/utils/utils";
import { type ComponentProps, forwardRef } from "react";

export const Footer = forwardRef<HTMLElement, ComponentProps<"footer">>(
  ({ className, ...props }, ref) => {
    return (
      <footer
        ref={ref}
        className={cn(
          "w-full flex items-center justify-center border-t mx-auto text-center text-sm gap-8 py-16",
          className,
        )}
        {...props}
      >
        <p>
          Made with ❤️ by{" "}
          <a
            className="text-primary"
            href="https://github.com/terbau"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terbau
          </a>
        </p>
      </footer>
    );
  },
);
Footer.displayName = "Footer";
