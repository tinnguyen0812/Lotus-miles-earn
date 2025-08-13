"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { callApi } from "@/lib/api-client";
import { Logo } from "@/components/logo"; // dùng Logo mới cho đồng bộ Figma

type ApiSignupResp = {
  success: boolean;
  message?: string;
  data?: {
    user_id: string;
    account_id: string;
    user: {
      id: string;
      user_name: string;
      user_email: string;
      user_type: string;
      created_at: string;
    };
    access_token?: string;
  };
};

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.target as HTMLFormElement);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirm-password") || "");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      // endpoint thật
      const res = await callApi<ApiSignupResp>({
        method: "POST",
        path: "/ms-auth/member-portal/sign-up",
        body: {
          email,
          password,
          confirm_password: confirmPassword,
        },
      });

      if (!res.success) {
        throw new Error(res.message || "Sign up failed.");
      }

      const token = res.data?.access_token;

      if (token) {
        // auto-login với token và role member
        localStorage.setItem("token", token);
        localStorage.setItem("role", "member");
        toast({ title: "Account created", description: "Welcome to LotusMiles!" });
        // chuyển sang dashboard member
        router.push("/member/dashboard");
      } else {
        // fallback: tạo xong nhưng không có token -> đưa về login
        toast({
          title: "Account created",
          description: "Please sign in to continue.",
        });
        router.push("/login");
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred during sign up. Please try again.");
      console.error("Signup Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header theo Figma */}
        <div className="mb-8 flex flex-col items-center text-center gap-2">
          <Logo size="lg" />
          <p className="text-gray-500 -mt-1">Create your account</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-teal-600 text-2xl">Sign Up</CardTitle>
            <CardDescription>Enter your information to create an account</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  className="border-teal-200 focus-visible:ring-teal-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="border-teal-200 focus-visible:ring-teal-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                  className="border-teal-200 focus-visible:ring-teal-600"
                />
              </div>

              {error && <p className="text-sm font-medium text-destructive">{error}</p>}

              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create an account
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="underline">
                  Login
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
