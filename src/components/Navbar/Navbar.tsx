"use client";

import { cn } from "@/utils/utils";
import { type ComponentProps, forwardRef, useEffect, useState } from "react";
import Link from "next/link";
import { ProfileDropdown } from "../ProfileDropdown/ProfileDropdown";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Smart Receipt", href: "/smart-receipt" },
];

interface NavbarProps extends ComponentProps<"nav"> {
  user?: User | null;
}

export const Navbar = forwardRef<HTMLElement, NavbarProps>(
  ({ className, user, ...props }, ref) => {
    const [open, setOpen] = useState(false);

    // Close mobile menu when screen size changes to desktop
    useEffect(() => {
      const handleResize = () => {
        if (window.innerWidth >= 768) {
          setOpen(false);
        }
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
      <nav
        ref={ref}
        className={cn(
          "w-full flex flex-row justify-between border-b border-b-foreground/10 h-16 items-center px-4",
          className,
        )}
        {...props}
      >
        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Bragster</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-8">
                {/* Navigation Links */}
                <div className="flex flex-col gap-2">
                  {navLinks.map(({ label, href }) => (
                    <Link
                      key={label}
                      href={href}
                      onClick={() => setOpen(false)}
                      className="flex items-center py-2 px-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      {label}
                    </Link>
                  ))}
                </div>

                {/* Auth Buttons for non-authenticated users */}
                {!user && (
                  <div className="flex flex-col gap-2 pt-4 border-t">
                    <Button
                      asChild
                      variant="outline"
                      onClick={() => setOpen(false)}
                    >
                      <Link href="/sign-in">Sign in</Link>
                    </Button>
                    <Button asChild onClick={() => setOpen(false)}>
                      <Link href="/sign-up">Sign up</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex flex-row items-center">
          <Link href="/" className="text-3xl font-medium">
            Bragster
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="flex flex-row items-center gap-2 h-full">
          <ul className="hidden md:flex flex-row items-center gap-4 h-full mr-4">
            {navLinks.map(({ label, href }) => (
              <li key={label} className="h-full">
                <Link
                  href={href}
                  className="border-b h-full flex items-center border-transparent hover:border-foreground"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {user ? (
            <ProfileDropdown user={user} />
          ) : (
            <div className="flex gap-2">
              <Button asChild size="sm" variant={"outline"}>
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild size="sm" variant={"default"}>
                <Link href="/sign-up">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </nav>
    );
  },
);
Navbar.displayName = "Navbar";
