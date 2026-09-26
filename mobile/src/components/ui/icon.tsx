import type { LucideIcon, LucideProps } from "lucide-react-native";
import { cssInterop } from "nativewind";
import { cn } from "@/lib/utils";

type IconProps = LucideProps & {
  as: LucideIcon;
  className?: string;
};

function IconImpl({ as: IconComponent, ...props }: IconProps) {
  return <IconComponent {...props} />;
}

// Lets icons be colored with text-* classes, like on the website
cssInterop(IconImpl, {
  className: {
    target: "style",
    nativeStyleToProp: {
      height: "size",
      width: "size",
      color: true,
      opacity: true,
    },
  },
});

export function Icon({ as, className, size = 16, ...props }: IconProps) {
  return (
    <IconImpl
      as={as}
      className={cn("text-foreground", className)}
      size={size}
      {...props}
    />
  );
}
