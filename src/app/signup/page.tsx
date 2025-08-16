"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { callApi } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";

type ApiSignupResp = {
  success: boolean;
  message?: string;
  data: {
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

// Types from provinces.open-api.vn
type Province = { code: number; name: string; codename: string; division_type: string; phone_code: string };
type District = { code: number; name: string; codename: string; province_code: number };
type Ward = { code: number; name: string; codename: string; district_code: number };

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Address states
  const [country, setCountry] = useState("Vietnam");

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [provinceCode, setProvinceCode] = useState<number | "">("");
  const [districtCode, setDistrictCode] = useState<number | "">("");
  const [wardCode, setWardCode] = useState<number | "">("");

  const [zip, setZip] = useState("");

  const selectedProvince = useMemo(
    () => provinces.find((p) => p.code === provinceCode),
    [provinces, provinceCode]
  );
  const selectedDistrict = useMemo(
    () => districts.find((d) => d.code === districtCode),
    [districts, districtCode]
  );
  const selectedWard = useMemo(
    () => wards.find((w) => w.code === wardCode),
    [wards, wardCode]
  );

  // Load provinces on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("https://provinces.open-api.vn/api/?depth=1");
        const data: Province[] = await res.json();
        if (!cancelled) setProvinces(data);
      } catch (e) {
        console.error("Load provinces failed", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (!provinceCode) {
      setDistricts([]);
      setDistrictCode("");
      setWards([]);
      setWardCode("");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
        const data = await res.json();
        const ds: District[] = (data?.districts || []).map((d: any) => ({
          code: d.code,
          name: d.name,
          codename: d.codename,
          province_code: d.province_code,
        }));
        if (!cancelled) {
          setDistricts(ds);
          setDistrictCode("");
          setWards([]);
          setWardCode("");
        }
      } catch (e) {
        console.error("Load districts failed", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [provinceCode]);

  // Load wards when district changes
  useEffect(() => {
    if (!districtCode) {
      setWards([]);
      setWardCode("");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
        const data = await res.json();
        const ws: Ward[] = (data?.wards || []).map((w: any) => ({
          code: w.code,
          name: w.name,
          codename: w.codename,
          district_code: w.district_code,
        }));
        if (!cancelled) {
          setWards(ws);
          setWardCode("");
        }
      } catch (e) {
        console.error("Load wards failed", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [districtCode]);

  async function handleSignup(e: React.FormEvent) {
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

    const address = String(form.get("address") || "");
    const phone_numbers = String(form.get("phone_numbers") || "");

    const first_name = String(form.get("first_name") || "");
    const last_name = String(form.get("last_name") || "");
    const gender = String(form.get("gender") || "");
    const dob = String(form.get("dob") || "");

    // Map theo yêu cầu mới: city / country / zip (vẫn gửi state = district cho an toàn)
    const city = selectedProvince?.name || "";
    const state = selectedDistrict?.name || ""; // optional với backend mới
    const wardName = selectedWard?.name || "";

    // Đính thêm ward + district + province vào address nếu người dùng đã chọn
    const fullAddress =
      [address, wardName, state, city].filter(Boolean).join(", ");

    const payload = {
      email,
      password,
      first_name,
      last_name,
      gender,
      dob, // yyyy-MM-dd
      address: fullAddress,
      city,            // Province/City name
      state,           // District name (có thể bị backend bỏ qua)
      zip,             // User nhập tay
      country,         // "Vietnam"
      phone_numbers,
    };

    try {
      const res = await callApi<ApiSignupResp>({
        method: "POST",
        path: "/ms-auth/member-portal/sign-up",
        body: payload,
      });

      if (!res.success) {
        throw new Error(res.message || "Sign up failed.");
      }

      const token = res.data?.access_token;
      const user_id: string = res.data?.user_id;
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("role", "member");
        localStorage.setItem("user_id", user_id );
        toast({ title: "Account created", description: "Welcome to LotusMiles!" });
        router.push("/member/dashboard");
      } else {
        toast({ title: "Account created", description: "Please sign in to continue." });
        router.push("/login");
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred during sign up. Please try again.");
      console.error("Signup Error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
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
          <form onSubmit={handleSignup} className="space-y-5">
            {/* Email + Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="m@example.com" required
                       className="border-teal-200 focus-visible:ring-teal-600" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone_numbers">Phone number</Label>
                <Input id="phone_numbers" name="phone_numbers" placeholder="0866666666" required
                       className="border-teal-200 focus-visible:ring-teal-600" />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required
                       className="border-teal-200 focus-visible:ring-teal-600" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" name="confirm-password" type="password" required
                       className="border-teal-200 focus-visible:ring-teal-600" />
              </div>
            </div>

            {/* Names + Gender */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First name</Label>
                <Input id="first_name" name="first_name" required
                       className="border-teal-200 focus-visible:ring-teal-600" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last name</Label>
                <Input id="last_name" name="last_name" required
                       className="border-teal-200 focus-visible:ring-teal-600" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  name="gender"
                  required
                  className="h-10 w-full rounded-md border border-teal-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  defaultValue=""
                >
                  <option value="" disabled>Select gender</option>
                  <option value="m">Male</option>
                  <option value="f">Female</option>
                  <option value="o">Other</option>
                </select>
              </div>
            </div>

            {/* DOB */}
            <div className="space-y-2">
              <Label htmlFor="dob">Date of birth</Label>
              <Input id="dob" name="dob" type="date" required
                     className="border-teal-200 focus-visible:ring-teal-600" />
            </div>

            {/* Address (free text) */}
            <div className="space-y-2">
              <Label htmlFor="address">Address (street / building)</Label>
              <Input id="address" name="address" placeholder="Apartment, street, building…"
                     className="border-teal-200 focus-visible:ring-teal-600" />
            </div>

            {/* Country + Province + District + Ward + ZIP */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Country</Label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="h-10 w-full rounded-md border border-teal-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                >
                  <option value="Vietnam">Vietnam</option>
                  {/* Bạn có thể thêm các quốc gia khác nếu cần */}
                </select>
              </div>

              <div className="space-y-2 md:col-span-3">
                <Label>Province / City</Label>
                <select
                  value={String(provinceCode)}
                  onChange={(e) => setProvinceCode(e.target.value ? Number(e.target.value) : "")}
                  className="h-10 w-full rounded-md border border-teal-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                >
                  <option value="">Select a province</option>
                  {provinces.map((p) => (
                    <option key={p.code} value={p.code}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>District</Label>
                <select
                  value={String(districtCode)}
                  onChange={(e) => setDistrictCode(e.target.value ? Number(e.target.value) : "")}
                  disabled={!provinceCode}
                  className="h-10 w-full rounded-md border border-teal-200 bg-white px-3 text-sm disabled:bg-gray-100 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-600"
                >
                  <option value="">{provinceCode ? "Select a district" : "Select a province first"}</option>
                  {districts.map((d) => (
                    <option key={d.code} value={d.code}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Ward</Label>
                <select
                  value={String(wardCode)}
                  onChange={(e) => setWardCode(e.target.value ? Number(e.target.value) : "")}
                  disabled={!districtCode}
                  className="h-10 w-full rounded-md border border-teal-200 bg-white px-3 text-sm disabled:bg-gray-100 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-600"
                >
                  <option value="">{districtCode ? "Select a ward" : "Select a district first"}</option>
                  {wards.map((w) => (
                    <option key={w.code} value={w.code}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip">ZIP / Postal code</Label>
                <Input id="zip" value={zip} onChange={(e) => setZip(e.target.value)}
                       placeholder="e.g. 100000" className="border-teal-200 focus-visible:ring-teal-600" />
              </div>
            </div>

            {error && <p className="text-sm font-medium text-destructive">{error}</p>}

            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create an account
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="underline">Login</Link>
            </p>
          </form>
        </CardContent>
        </Card>
      </div>
    </main>
  );
}
