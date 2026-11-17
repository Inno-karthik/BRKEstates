"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      setError("Invalid email or password.");
      return;
    }

    const { data: profile } = await supabase.from("profiles").select("role, sections").eq("id", data.user.id).single();
    setLoading(false);

    // Staff with exactly one granted section skip the chooser and land there directly.
    if (profile?.role === "staff" && profile.sections?.length === 1) {
      const dest = { cms: "/admin", crm: "/crm", vault: "/vault-admin" }[profile.sections[0] as "cms" | "crm" | "vault"];
      router.replace(dest ?? "/admin/choose");
    } else {
      router.replace("/admin/choose");
    }
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#3b0b10] px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center">
          <Image src="/brand/logo.png" alt="BKR Estates" width={220} height={70} className="h-auto w-52" priority />
          <h1 className="mt-3 text-lg font-semibold text-neutral-900">Admin Sign In</h1>
          <p className="text-xs text-neutral-500">BKR Estates management console</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-[#7f1d1d]"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-[#7f1d1d]"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#7f1d1d] py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Lock size={14} />}
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
