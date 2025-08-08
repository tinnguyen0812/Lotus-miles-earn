
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
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

export function UserNav() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isAuthenticated, role: authRole } = useAuth();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

   useEffect(() => {
    if (isAuthenticated) {
      const role = localStorage.getItem('role');
      setUserName(role === 'admin' ? 'Admin' : 'Member');
      // In a real app, you'd get the email from the token or another API call
      setUserEmail(role === 'admin' ? 'admin@lotus.dev' : 'member@vietnamair.com');
    }
  }, [isAuthenticated]);


  const handleLogout = () => {
    const role = localStorage.getItem('role');
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    // Redirect to the correct login page after logout
    if (role === 'admin') {
        router.push("/admin/login");
    } else {
        router.push("/login");
    }
    router.refresh(); // To ensure state is cleared
  };

  if (!isAuthenticated) {
    return (
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
           <Button variant="outline">Login</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
             <DropdownMenuItem asChild>
                <Link href="/login">
                Member Login
                </Link>
            </DropdownMenuItem>
             <DropdownMenuItem asChild>
                <Link href="/admin/login">
                Admin Login
                </Link>
            </DropdownMenuItem>
        </DropdownMenuContent>
       </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://placehold.co/100x100.png" alt="@shadcn" data-ai-hint="avatar man" />
            <AvatarFallback>{authRole === 'admin' ? 'A' : 'M'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {userName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
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
