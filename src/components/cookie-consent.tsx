"use client";

import { useEffect, useState } from "react";
import { Cookie } from "lucide-react";

const KEY = "bhk_cookie_consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      // localStorage isn't available on the server, so this has to run post-mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch {
      // ignore — storage unavailable
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(KEY, "accepted");
    } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-16 z-50 mx-auto max-w-xl px-4 pb-[env(safe-area-inset-bottom)] md:bottom-4">
      <div className="pointer-events-auto flex flex-col items-start gap-3 rounded-2xl border border-black/5 bg-white/95 p-4 shadow-2xl backdrop-blur sm:flex-row sm:items-center">
        <Cookie size={22} className="shrink-0 text-[var(--color-primary,#9b1c1c)]" />
        <p className="flex-1 text-xs text-neutral-600">
          We use cookies to remember your recently viewed properties and improve your experience. By continuing,
          you agree to our use of cookies.
        </p>
        <button
          onClick={accept}
          className="w-full shrink-0 rounded-full bg-[var(--color-primary,#9b1c1c)] px-5 py-2 text-xs font-semibold text-white sm:w-auto"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
