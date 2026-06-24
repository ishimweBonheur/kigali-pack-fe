"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Search, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DASHBOARD_ROUTES } from "@/constants";
import { authService } from "@/services/auth.service";
import { setAuthTokens } from "@/services/api";

export function TopNav() {
  const router = useRouter();
  const { data: session } = useSession();
  const email = session?.user?.email ?? "";
  const initials = email.slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    const refreshToken = session?.user?.refreshToken;
    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch {
        // proceed with sign out even if API call fails
      }
    }
    setAuthTokens(null);
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <header className="flex h-16 items-center gap-4 border-b border-border px-4 lg:px-6 glass-panel">
      <div className="relative hidden md:block flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search…"
          className="pl-9 bg-secondary/30 border-border h-9"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Button variant="ghost" size="icon-sm" className="hidden sm:flex">
          <Command className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon-sm">
          <Bell className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex h-9 items-center gap-2 rounded-lg px-2 hover:bg-hover"
          >
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs bg-secondary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline text-small">{email}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => router.push(DASHBOARD_ROUTES.profile)}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(DASHBOARD_ROUTES.settings)}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
