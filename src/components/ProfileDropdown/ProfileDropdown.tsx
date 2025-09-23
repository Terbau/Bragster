"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "../Avatar/Avatar";
import {
  User as UserIcon,
  Receipt,
  LogOut,
  Palette,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";

const profileMenuItems = [
  { label: "My Profile", href: "/profile", icon: UserIcon },
  { label: "My Receipts", href: "/receipt", icon: Receipt },
];

interface ProfileDropdownProps {
  user: Session["user"];
}

export const ProfileDropdown = ({ user }: ProfileDropdownProps) => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const ICON_SIZE = 16;

  const getThemeIcon = () => {
    if (!mounted) return <Palette size={ICON_SIZE} className="mr-2 h-4 w-4" />;

    switch (theme) {
      case "light":
        return <Sun size={ICON_SIZE} className="mr-2 h-4 w-4" />;
      case "dark":
        return <Moon size={ICON_SIZE} className="mr-2 h-4 w-4" />;
      default:
        return <Laptop size={ICON_SIZE} className="mr-2 h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar
            src={user.avatarUrl}
            email={user.email}
            className="h-10 w-10"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Profile</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {profileMenuItems.map(({ label, href, icon: Icon }) => (
          <DropdownMenuItem key={label} asChild>
            <Link href={href} className="cursor-pointer">
              <Icon className="mr-2 h-4 w-4" />
              <span>{label}</span>
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {getThemeIcon()}
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={mounted ? theme : "system"}
              onValueChange={(value) => setTheme(value)}
            >
              <DropdownMenuRadioItem value="light" className="flex gap-2">
                <Sun size={ICON_SIZE} className="text-muted-foreground" />
                <span>Light</span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark" className="flex gap-2">
                <Moon size={ICON_SIZE} className="text-muted-foreground" />
                <span>Dark</span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system" className="flex gap-2">
                <Laptop size={ICON_SIZE} className="text-muted-foreground" />
                <span>System</span>
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          {/* <form action={signOutAction} className="w-full"> */}
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start p-0 h-auto font-normal text-destructive hover:text-destructive"
            onClick={() => signOut()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </Button>
          {/* </form> */}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
