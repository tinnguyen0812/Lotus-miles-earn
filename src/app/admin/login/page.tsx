
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { api } from "@/lib/api";


export default function AdminLoginPage() {
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
            const response = await api.post('/api/auth/login', { email, password });
            const { token, role } = response.data;

            if (role === 'admin') {
                localStorage.setItem('token', token);
                localStorage.setItem('role', role);
                router.push('/admin/claims');
            } else {
                setError("This account does not have admin privileges.");
                toast({
                    title: "Access Denied",
                    description: "This account does not have admin privileges.",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
             const desc = error.response?.status === 403 
                ? "Invalid email or password."
                : "An unexpected error occurred.";
            setError(desc);
            toast({
                title: "Login Failed",
                description: desc,
                variant: "destructive",
            });
            console.error("Admin Login Error:", error);
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
                    <CardTitle className="text-2xl">Admin Login</CardTitle>
                    <CardDescription>
                        Enter admin credentials to access the management panel.
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
                            placeholder="admin@example.com"
                            required
                            defaultValue="admin@lotus.dev"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" required />
                    </div>
                    {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Login as Admin
                    </Button>
                    <div className="mt-4 text-center text-sm">
                        Not an admin?{" "}
                        <Link href="/login" className="underline">
                            Member Login
                        </Link>
                    </div>
                    </form>
                </Content>
            </Card>
        </main>
    );
}
