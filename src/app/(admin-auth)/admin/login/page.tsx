"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { callApi } from "@/lib/api-client";
import { LotusIcon } from "@/components/icons";
import {
  Mail, Lock, Eye, EyeOff, LogIn, ShieldCheck,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function AdminLoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string>("");
  const [showPw, setShowPw] = React.useState(false);
  const [remember, setRemember] = React.useState(true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.target as HTMLFormElement;
    const email = (new FormData(form).get("email") as string)?.trim();
    const password = (new FormData(form).get("password") as string) ?? "";

    try {
      const resp = await callApi<{ token: string; role: "admin" | "member" }>(
        { method: "POST", path: "/api/auth/login", body: { email, password } }
      );

      if (resp.role !== "admin") {
        setError(t("admin.login.noPermission") || "This account is not allowed to access Admin Portal.");
        toast({
          title: t("admin.login.failed") || "Login failed",
          description: t("admin.login.noPermission") || "This account is not allowed to access Admin Portal.",
          variant: "destructive",
        });
        return;
      }

      // Lưu token: nhớ đăng nhập -> localStorage, còn không -> sessionStorage
      const store = remember ? localStorage : sessionStorage;
      store.setItem("token", resp.token);
      store.setItem("role", resp.role);

      toast({
        title: t("admin.login.successTitle") || "Welcome",
        description: t("admin.login.successDesc") || "You are now signed in as admin.",
      });

      router.push("/admin/claims");
    } catch (err: any) {
      const msg =
        err?.message?.includes("403")
          ? (t("admin.login.invalid") || "Invalid email or password.")
          : (t("admin.login.error") || "Unexpected error. Please try again.");
      setError(msg);
      toast({ title: t("admin.login.failed") || "Login failed", description: msg, variant: "destructive" });
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {t("admin.login.title") || "Admin Portal"}
          </CardTitle>
          <CardDescription>
            {t("admin.login.subtitle") || "Đăng nhập để truy cập hệ thống quản trị"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">{t("admin.login.email") || "Email"}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email" name="email" type="email" required
                  placeholder="admin@lotus.dev"
                  className="pl-9"
                />
              </div>
            </div>

            {/* Password */}
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">{t("admin.login.password") || "Mật khẩu"}</Label>
                <Link href="#" className="ml-auto text-sm underline">
                  {t("admin.login.forgot") || "Quên mật khẩu?"}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password" name="password"
                  type={showPw ? "text" : "password"} required className="pl-9 pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <Checkbox id="remember" checked={remember} onCheckedChange={(v) => setRemember(Boolean(v))} />
              <Label htmlFor="remember" className="text-sm">
                {t("admin.login.remember") || "Ghi nhớ đăng nhập"}
              </Label>
            </div>

            {/* Error */}
            {!!error && <p className="text-sm font-medium text-destructive">{error}</p>}

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={loading}>
              <LogIn className="mr-2 h-4 w-4" />
              {loading ? (t("admin.login.signingIn") || "Đang đăng nhập…") : (t("admin.login.cta") || "Đăng nhập")}
            </Button>

            {/* Support */}
            <div className="pt-4 text-center text-sm text-muted-foreground">
              {t("admin.login.needHelp") || "Cần hỗ trợ?"}{" "}
              <Link href="#" className="underline">
                {t("admin.login.contactIT") || "Liên hệ IT Support"}
              </Link>
            </div>
          </form>

          {/* Security note */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            {t("admin.login.secured") || "Hệ thống được bảo mật bởi LotusMiles Security"}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
