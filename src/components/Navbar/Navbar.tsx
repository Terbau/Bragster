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
import { Menu, Receipt } from "lucide-react";
import { signIn } from "next-auth/react";
import type { Session } from "next-auth";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Smart Receipt", href: "/receipt" },
];

interface NavbarProps extends ComponentProps<"nav"> {
  user?: Session["user"] | null;
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

        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-black dark:text-white">
            Bragster
          </span>
        </Link>

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
            <Button size="sm" variant="outline" onClick={() => signIn("auth0")}>
              Sign in
            </Button>
            // <div className="flex gap-2">
            //   <Button asChild size="sm" variant={"outline"}>
            //     <Link href="/sign-in">Sign in</Link>
            //   </Button>
            //   <Button asChild size="sm" variant={"default"}>
            //     <Link href="/sign-up">Sign up</Link>
            //   </Button>
            // </div>
          )}
        </div>
      </nav>
    );
  },
);
Navbar.displayName = "Navbar";
