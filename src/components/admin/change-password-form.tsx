"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { FormField, inputClass } from "@/components/admin/modal";
import { createClient } from "@/lib/supabase/client";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation don't match.");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("Not signed in.");

      // Re-authenticate with the current password first, so changing it requires
      // actually knowing it rather than just having an open session.
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (signInError) {
        setError("Current password is incorrect.");
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw new Error(updateError.message);

      setSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to change password");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-black/5 bg-white p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">Change Password</h2>
      <div className="space-y-3">
        <FormField label="Current Password">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={inputClass}
            required
          />
        </FormField>
        <FormField label="New Password">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputClass}
            placeholder="At least 8 characters"
            required
          />
        </FormField>
        <FormField label="Confirm New Password">
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
            required
          />
        </FormField>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving || !currentPassword || !newPassword || !confirmPassword}
          className="flex items-center gap-1.5 rounded-full bg-[#1b5e3a] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : null}
          {saved ? "Password Changed" : "Change Password"}
        </button>
      </div>
    </form>
  );
}
