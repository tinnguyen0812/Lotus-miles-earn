"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
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
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.target as HTMLFormElement);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirm-password") as string;

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            // On successful signup, Firebase automatically signs the user in.
            // The useAuth hook will detect this and redirect.
            toast({
              title: "Account Created",
              description: "You have been successfully signed up and logged in.",
            });
            router.push("/member/dashboard");
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                setError("This email address is already in use.");
            } else {
                setError("An error occurred during sign up. Please try again.");
            }
            console.error("Signup Error:", error);
        } finally {
            setLoading(false);
        }
    }

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
            <CardTitle className="text-xl">Sign Up</CardTitle>
            <CardDescription>
            Enter your information to create an account
            </CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSignup} className="grid gap-4">
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
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" name="confirm-password" type="password" required />
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create an account
            </Button>
            </form>
            <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
                Login
            </Link>
            </div>
        </CardContent>
        </Card>
    </main>
  );
}
