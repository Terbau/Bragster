import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ComponentProps } from "react";

interface BackArrowProps extends ComponentProps<typeof Link> {
  label: string;
}

export const BackArrow = ({ label, ...props }: BackArrowProps) => (
  <Link
    {...props}
    className="flex flex-row items-center gap-1 text-sm text-foreground hover:text-muted-foreground"
  >
    <ArrowLeft />
    {label}
  </Link>
);
