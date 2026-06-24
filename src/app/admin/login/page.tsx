"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Lock, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin/products";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Login gagal");
        return;
      }

      router.push(redirect);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Username */}
      <div className="relative">
        <User
          size={15}
          className="absolute left-3 top-[38px] text-[#64748B] pointer-events-none"
        />
        <Input
          id="username"
          name="username"
          type="text"
          label="Username"
          placeholder="admin"
          autoComplete="username"
          required
          className="pl-9"
        />
      </div>

      {/* Password */}
      <div className="relative">
        <Lock
          size={15}
          className="absolute left-3 top-[38px] text-[#64748B] pointer-events-none"
        />
        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="••••••••"
          autoComplete="current-password"
          required
          className="pl-9"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <Button type="submit" loading={loading} className="w-full mt-1">
        Masuk
      </Button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#EFF6FF] mb-4">
            <Image
              src="/logo.png"
              alt="Logo AYP Affiliate"
              width={24}
              height={24}
              className="w-6 h-6 object-contain"
            />
          </div>
          <h1 className="text-xl font-bold text-[#0F172A]">AYP Affiliate</h1>
          <p className="text-sm text-[#64748B] mt-1">Admin Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
          <h2 className="text-base font-semibold text-[#0F172A] mb-5">
            Masuk
          </h2>
          <Suspense fallback={<div className="h-40 animate-pulse bg-[#F8FAFC] rounded-lg" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
