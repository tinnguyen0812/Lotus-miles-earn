"use client";

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
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { callApi } from '@/lib/api-client'
type SignupResp = {
  ok?: boolean
  token?: string
  role?: 'member' | 'admin'
  message?: string
}
export default function SignupPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError('')

  const form = new FormData(e.target as HTMLFormElement)
  const email = String(form.get('email') || '')
  const password = String(form.get('password') || '')
  const confirmPassword = String(form.get('confirm-password') || '')

  if (password !== confirmPassword) {
    setError('Passwords do not match.')
    setLoading(false)
    return
  }

  try {
    // ⚠️ chỉnh path cho đúng API backend của bạn (ví dụ: '/auth/signup' hoặc '/api/auth/signup')
    const res = await callApi<SignupResp>({
      method: 'POST',
      path: '/auth/signup',
      body: { email, password }
    })

    // 2 hướng: backend có trả token ngay (auto login) hoặc chỉ báo ok rồi yêu cầu login
    if (res?.token) {
      // Auto login
      localStorage.setItem('token', res.token)
      if (res.role) localStorage.setItem('role', res.role)
      toast({ title: 'Account created', description: 'Welcome!' })
      router.push(res.role === 'admin' ? '/admin/claims' : '/member/dashboard')
    } else {
      // Chỉ signup thành công -> chuyển qua trang login
      toast({ title: 'Account created', description: 'Please sign in to continue.' })
      router.push('/login')
    }
  } catch (err: any) {
    // callApi đã throw Error(message) nếu API trả lỗi
    setError(err?.message || 'An error occurred during sign up. Please try again.')
    console.error('Signup Error:', err)
  } finally {
    setLoading(false)
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
