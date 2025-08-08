"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/lib/i18n";
import { LogOut, User, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function UserNav() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleLogout = () => {
    // Placeholder for Firebase logout logic
    console.log("Logging out...");
    router.push("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://placehold.co/100x100.png" alt="@shadcn" data-ai-hint="avatar man" />
            <AvatarFallback>VA</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {t("user_nav.name")}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {t("user_nav.email")}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="#">
              <User className="mr-2 h-4 w-4" />
              <span>{t("user_nav.profile")}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="#">
              <Settings className="mr-2 h-4 w-4" />
              <span>{t("user_nav.settings")}</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t("user_nav.logout")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
