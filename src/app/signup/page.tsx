"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { callApi } from "@/lib/api-client";
import { Logo } from "@/components/logo";
import { FieldLabel } from "@/components/admin/FieldLabel";

/** ====== Address model (VN API) ====== */
type Province = { code: number; name: string; codename: string };
type District = { code: number; name: string; codename: string; province_code: number };
type Ward = { code: number; name: string; codename: string; district_code: number };
const digitsOnly = (s: string) => s.replace(/[()\s-]/g, "");
/** ====== Validation schema ====== */
const passRule =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,72}$/; // 8-72, hoa, thường, số, ký tự đặc biệt

const SignupSchema = z
  .object({
    email: z.string().email("Email không hợp lệ"),
    password: z.string().regex(passRule, "Mật khẩu tối thiểu 8 ký tự, có hoa, thường, số và ký tự đặc biệt"),
    confirmPassword: z.string(),
    first_name: z.string().min(2, "Nhập tên (ít nhất 2 ký tự)"),
    last_name: z.string().min(1, "Nhập họ"),
    gender: z.enum(["m", "f", "o"]).default("m"), // m: male, f: female, o: other
    dob: z.string().refine((s) => {
      const d = new Date(s);
      if (Number.isNaN(+d)) return false;
      const now = new Date();
      const age =
        now.getFullYear() - d.getFullYear() - (now < new Date(d.getFullYear() + (now.getFullYear() - d.getFullYear()), d.getMonth(), d.getDate()) ? 1 : 0);
      return age >= 16; // ≥16 tuổi
    }, "Bạn cần từ 16 tuổi"),
    phone_numbers: z.string().min(1, "Nhập số điện thoại"),
    address: z.string().min(5, "Địa chỉ quá ngắn"),
    country: z.string().min(2, "Chọn quốc gia"),
    zip: z
      .string()
      .min(3, "ZIP quá ngắn")
      .max(12, "ZIP quá dài")
      .regex(/^[A-Za-z0-9\- ]+$/, "ZIP không hợp lệ"),
    /** Các trường điều khiển cho VN */
    provinceCode: z.union([z.number(), z.literal("")]).optional(),
    districtCode: z.union([z.number(), z.literal("")]).optional(),
    wardCode: z.union([z.number(), z.literal("")]).optional(),
    /** Các trường text cho quốc gia khác */
    cityText: z.string().optional(),
    stateText: z.string().optional(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu xác nhận không khớp",
  })
  .superRefine((v, ctx) => {
    const isVN = (v.country || "").toLowerCase().includes("viet");
    if (isVN) {
      if (!v.provinceCode) ctx.addIssue({ code: "custom", path: ["provinceCode"], message: "Chọn Tỉnh/Thành" });
      if (!v.districtCode) ctx.addIssue({ code: "custom", path: ["districtCode"], message: "Chọn Quận/Huyện" });
      if (!v.wardCode) ctx.addIssue({ code: "custom", path: ["wardCode"], message: "Chọn Phường/Xã" });
    } else {
      if (!v.cityText) ctx.addIssue({ code: "custom", path: ["cityText"], message: "Nhập City/Province" });
      if (!v.stateText) ctx.addIssue({ code: "custom", path: ["stateText"], message: "Nhập State" });
    }
    const raw = v.phone_numbers?.trim() || "";
    const compact = digitsOnly(raw);

    if (isVN) {
      // Hợp lệ: 0 + 9 số  OR  +84 + 9 số
      const ok = /^0\d{9}$/.test(compact) || /^\+84\d{9}$/.test(raw);
      if (!ok) {
        ctx.addIssue({
          code: "custom",
          path: ["phone_numbers"],
          message: "Số điện thoại VN phải là 0xxxxxxxxx (10 số) hoặc +84xxxxxxxxx (9 số sau +84)",
        });
      }
    } else {
      // Cho quốc gia khác: 8–20 chữ số (cho phép +, khoảng trắng, (), -)
      const ok = /^\+?[0-9][0-9()\-\s]{7,19}$/.test(raw);
      if (!ok) {
        ctx.addIssue({
          code: "custom",
          path: ["phone_numbers"],
          message: "Số điện thoại không hợp lệ",
        });
      }
    }
  });

type SignupValues = z.infer<typeof SignupSchema>;

type ApiSignupResp = {
  success: boolean;
  message?: string;
  data?: {
    user_id: string;
    account_id: string;
    user: { id: string; user_name: string; user_email: string; user_type: string; created_at: string };
    access_token?: string;
  };
};

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();

  /** ====== React Hook Form ====== */
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<SignupValues>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      country: "Vietnam",
      gender: "m",
    },
  });

  /** ====== Địa chỉ VN (cascading) ====== */
  const country = watch("country");
  const isVN = (country || "").toLowerCase().includes("viet");

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const provinceCode = watch("provinceCode");
  const districtCode = watch("districtCode");

  useEffect(() => {
    if (!isVN) return;
    (async () => {
      try {
        const res = await fetch("https://provinces.open-api.vn/api/?depth=1");
        const data: Province[] = await res.json();
        setProvinces(data);
      } catch {
        // ignore
      }
    })();
  }, [isVN]);

  useEffect(() => {
    if (!isVN || !provinceCode) {
      setDistricts([]); setValue("districtCode", ""); setWards([]); setValue("wardCode", "");
      return;
    }
    (async () => {
      try {
        const res = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
        const data = await res.json();
        setDistricts((data?.districts || []).map((d: any) => ({
          code: d.code, name: d.name, codename: d.codename, province_code: d.province_code,
        })));
      } catch { }
    })();
  }, [isVN, provinceCode, setValue]);

  useEffect(() => {
    if (!isVN || !districtCode) {
      setWards([]); setValue("wardCode", "");
      return;
    }
    (async () => {
      try {
        const res = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
        const data = await res.json();
        setWards((data?.wards || []).map((w: any) => ({
          code: w.code, name: w.name, codename: w.codename, district_code: w.district_code,
        })));
      } catch { }
    })();
  }, [isVN, districtCode, setValue]);

  const selectedProvince = useMemo(
    () => provinces.find(p => p.code === provinceCode),
    [provinces, provinceCode]
  );
  const selectedDistrict = useMemo(
    () => districts.find(d => d.code === districtCode),
    [districts, districtCode]
  );
  const selectedWard = useMemo(
    () => wards.find(w => w.code === watch("wardCode")),
    [wards, watch]
  );

  /** ====== Submit ====== */
  const onSubmit = async (values: SignupValues) => {
    const isVNAddr = (values.country || "").toLowerCase().includes("viet");

    // map dữ liệu địa chỉ cho API
    const city = isVNAddr ? (selectedProvince?.name || "") : (values.cityText || "");
    const state = isVNAddr ? (selectedDistrict?.name || "") : (values.stateText || "");
    let phone = values.phone_numbers.trim();
    if (isVNAddr) {
      const compact = phone.replace(/[()\s-]/g, "");
      if (/^0\d{9}$/.test(compact)) {
        phone = "+84" + compact.slice(1); // 0xxxxxxxxx -> +84xxxxxxxxx
      }
      // Trường hợp đã là +84xxxxxxxxx thì giữ nguyên
    }
    const payload = {
      email: values.email,
      password: values.password,
      confirm_password: values.confirmPassword,
      first_name: values.first_name.trim(),
      last_name: values.last_name.trim(),
      gender: values.gender, // "m" | "f" | "o"
      dob: values.dob,
      address: values.address.trim(),
      city,
      state,
      zip: values.zip.trim(),
      country: values.country.trim(),
      phone_numbers: phone,
    };

    try {
      const res = await callApi<ApiSignupResp>({
        method: "POST",
        path: "/ms-auth/member-portal/sign-up",
        body: payload,
      });

      if (!res.success) throw new Error(res.message || "Sign up failed.");

      const token = res.data?.access_token;
      const user_id = res.data?.user_id;

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("role", "member");
        if (user_id) localStorage.setItem("user_id", user_id);
        toast({ title: "Account created", description: "Welcome to LotusMiles!" });
        router.push("/member/dashboard");
      } else {
        toast({ title: "Account created", description: "Please sign in to continue." });
        router.push("/login");
      }
    } catch (e: any) {
      toast({
        title: "Sign up failed",
        description: e?.message || "An error occurred during sign up. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
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
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div className="space-y-2 md:col-span-2">
                <FieldLabel required htmlFor="email">Email</FieldLabel>
                <Input id="email" type="email" {...register("email")} className="border-teal-200 focus-visible:ring-teal-600" />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              {/* First/Last name */}
              <div className="space-y-2">
                <FieldLabel required htmlFor="first_name">First name</FieldLabel>
                <Input id="first_name" {...register("first_name")} className="border-teal-200 focus-visible:ring-teal-600" />
                {errors.first_name && <p className="text-sm text-destructive">{errors.first_name.message}</p>}
              </div>
              <div className="space-y-2">
                <FieldLabel required htmlFor="last_name">Last name</FieldLabel>
                <Input id="last_name" {...register("last_name")} className="border-teal-200 focus-visible:ring-teal-600" />
                {errors.last_name && <p className="text-sm text-destructive">{errors.last_name.message}</p>}
              </div>

              {/* Gender / DOB */}
              <div className="space-y-2">
                <FieldLabel required htmlFor="gender">Gender</FieldLabel>
                <select id="gender" {...register("gender")} className="w-full rounded-md border border-teal-200 p-2">
                  <option value="m">Male</option>
                  <option value="f">Female</option>
                  <option value="o">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <FieldLabel required htmlFor="dob">Date of birth</FieldLabel>
                <Input id="dob" type="date" {...register("dob")} className="border-teal-200 focus-visible:ring-teal-600" />
                {errors.dob && <p className="text-sm text-destructive">{errors.dob.message}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-2 md:col-span-2">
                <FieldLabel required htmlFor="phone_numbers">Phone number</FieldLabel>
                <Input id="phone_numbers" {...register("phone_numbers")} placeholder="+84901234567" className="border-teal-200 focus-visible:ring-teal-600" />
                {errors.phone_numbers && <p className="text-sm text-destructive">{errors.phone_numbers.message}</p>}
              </div>

              {/* Address line */}
              <div className="space-y-2 md:col-span-2">
                <FieldLabel required htmlFor="address">Address</FieldLabel>
                <Input id="address" {...register("address")} placeholder="e.g. 14 Dương Apollo" className="border-teal-200 focus-visible:ring-teal-600" />
                {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
              </div>

              {/* Country / ZIP */}
              <div className="space-y-2">
                <FieldLabel required htmlFor="country">Country</FieldLabel>
                <Input id="country" {...register("country")} className="border-teal-200 focus-visible:ring-teal-600" />
                {errors.country && <p className="text-sm text-destructive">{errors.country.message}</p>}
              </div>
              <div className="space-y-2">
                <FieldLabel required htmlFor="zip">ZIP</FieldLabel>
                <Input id="zip" {...register("zip")} className="border-teal-200 focus-visible:ring-teal-600" />
                {errors.zip && <p className="text-sm text-destructive">{errors.zip.message}</p>}
              </div>

              {/* VN address (Province / District / Ward) OR text city/state */}
              {isVN ? (
                <>
                  <div className="space-y-2">
                    <FieldLabel required >City / Province</FieldLabel>
                    <select
                      className="w-full rounded-md border border-teal-200 p-2"
                      {...register("provinceCode")}
                      onChange={(e) => setValue("provinceCode", e.target.value ? Number(e.target.value) : "")}
                    >
                      <option value="">Chọn Tỉnh/Thành</option>
                      {provinces.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    {errors.provinceCode && <p className="text-sm text-destructive">{String(errors.provinceCode.message)}</p>}
                  </div>
                  <div className="space-y-2">
                    <FieldLabel required>District</FieldLabel>
                    <select
                      className="w-full rounded-md border border-teal-200 p-2"
                      {...register("districtCode")}
                      onChange={(e) => setValue("districtCode", e.target.value ? Number(e.target.value) : "")}
                      disabled={!provinceCode}
                    >
                      <option value="">Chọn Quận/Huyện</option>
                      {districts.map((d) => (
                        <option key={d.code} value={d.code}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    {errors.districtCode && <p className="text-sm text-destructive">{String(errors.districtCode.message)}</p>}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <FieldLabel required>Ward</FieldLabel>
                    <select
                      className="w-full rounded-md border border-teal-200 p-2"
                      {...register("wardCode")}
                      onChange={(e) => setValue("wardCode", e.target.value ? Number(e.target.value) : "")}
                      disabled={!districtCode}
                    >
                      <option value="">Chọn Phường/Xã</option>
                      {wards.map((w) => (
                        <option key={w.code} value={w.code}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                    {errors.wardCode && <p className="text-sm text-destructive">{String(errors.wardCode.message)}</p>}
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <FieldLabel required htmlFor="cityText">City / Province</FieldLabel>
                    <Input id="cityText" {...register("cityText")} className="border-teal-200 focus-visible:ring-teal-600" />
                    {errors.cityText && <p className="text-sm text-destructive">{String(errors.cityText.message)}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stateText">State</Label>
                    <Input id="stateText" {...register("stateText")} className="border-teal-200 focus-visible:ring-teal-600" />
                    {errors.stateText && <p className="text-sm text-destructive">{String(errors.stateText.message)}</p>}
                  </div>
                </>
              )}

              {/* Passwords */}
              <div className="space-y-2">
                <FieldLabel required htmlFor="password">Password</FieldLabel>
                <Input id="password" type="password" {...register("password")} className="border-teal-200 focus-visible:ring-teal-600" />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <FieldLabel required htmlFor="confirmPassword">Confirm Password</FieldLabel>
                <Input id="confirmPassword" type="password" {...register("confirmPassword")} className="border-teal-200 focus-visible:ring-teal-600" />
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
              </div>

              {/* Submit */}
              <div className="md:col-span-2 space-y-3">
                <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create an account
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="underline">
                    Login
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
