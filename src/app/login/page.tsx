
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LotusIcon } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { callApi } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await callApi<{ token: string; role: string }>({
        method: 'POST',
        path: '/api/auth/login',
        body: { email, password },
      });
      const { token, role } = response;

      if (role === 'member') {
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        router.push("/member/dashboard");
      } else if (role === 'admin') {
        setError("Admin accounts cannot log in here. Please use the admin login page.");
        toast({
            title: "Access Denied",
            description: "Please use the admin login page.",
            variant: "destructive",
        });
      } else {
        throw new Error("Invalid role received from server.");
      }
    } catch (error: any) {
        const desc = error.message.includes('403') 
            ? "Invalid email or password."
            : "An unexpected error occurred.";
        setError(desc);
        toast({
            title: "Login Failed",
            description: desc,
            variant: "destructive",
        });
        console.error("Login Error:", error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
       <div className="flex items-center gap-2 mb-8">
        <LotusIcon className="h-10 w-10 text-primary" />
        <h1 className="text-2xl font-bold text-primary tracking-tight">
          Lotus Loyalty Hub
        </h1>
      </div>
        <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
            <CardTitle className="text-2xl">Member Login</CardTitle>
            <CardDescription>
            Enter your email below to login to your account
            </CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                />
            </div>
            <div className="grid gap-2">
                <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline">
                    Forgot your password?
                </Link>
                </div>
                <Input id="password" name="password" type="password" required />
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Login
            </Button>
             <div className="mt-4 text-center text-sm">
                Access the admin panel?{" "}
                <Link href="/admin/login" className="underline">
                    Admin Login
                </Link>
            </div>
            </form>
            <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline">
                Sign up
            </Link>
            </div>
        </CardContent>
        </Card>
    </main>
  );
}
