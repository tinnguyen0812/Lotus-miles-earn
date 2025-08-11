// src/app/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LotusIcon } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { callApi } from "@/lib/api-client";
import { Logo } from "@/components/logo";
type SignInResp = {
  success: boolean
  data?: {
    access_token: string
    refresh_token?: string
    user_id: string
  }
  message?: string
}
export default function MemberLoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      // Gọi thẳng API thật thông qua callApi như hiện tại
      const res = await callApi<SignInResp>({
        method: "POST",
        path: "/ms-auth/member-portal/sign-in",
        body: { email, password },
      });

      if (!res?.success || !res.data?.access_token) {
        throw new Error(res?.message || "Invalid email or password.");
      }

      // Lưu token/refresh-token/user_id, role mặc định là member
      localStorage.setItem("token", res.data.access_token);
      if (res.data.refresh_token) {
        localStorage.setItem("refresh_token", res.data.refresh_token);
      }
      localStorage.setItem("user_id", res.data.user_id);
      localStorage.setItem("role", "member");

      toast({ title: "Signed in", description: "Welcome back!" });
      router.push("/member/dashboard");
    } catch (err: any) {
      const msg =
        err?.message?.includes("Invalid")
          ? "Invalid email or password."
          : (err?.message || "Unexpected error. Please try again.");
      setErrorMsg(msg);
      toast({ title: "Login failed", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header theo mock */}
        <div className="text-center mb-8">
          <div className="mb-8 flex flex-col items-center text-center gap-2">
            <Logo size="lg" />
            <p className="text-gray-500 -mt-1">Sign in to access your account</p>
          </div>
        </div>

        <Card className="relative z-10 mt-6 shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-teal-700">Member Login</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-teal-200 focus-visible:ring-teal-600"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="#"
                    className="ml-auto text-sm underline text-teal-700 hover:text-teal-800"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-teal-200 focus-visible:ring-teal-600"
                />
              </div>

              {errorMsg && (
                <p className="text-sm font-medium text-destructive">{errorMsg}</p>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Login
              </Button>
            </form>

            <div className="mt-6 space-y-2 text-center text-sm">
              <p className="text-muted-foreground">
                Access the admin panel?{" "}
                <Link href="/admin/login" className="underline text-teal-700 hover:text-teal-800">
                  Admin Login
                </Link>
              </p>
              <p className="text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="underline text-teal-700 hover:text-teal-800">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
