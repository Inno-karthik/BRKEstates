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
      <div className="pointer-events-auto mr-[4.5rem] flex items-center gap-3 rounded-2xl border border-black/5 bg-white/95 p-3 shadow-2xl backdrop-blur sm:mr-0 sm:p-4">
        <Cookie size={22} className="hidden shrink-0 sm:block text-[var(--color-primary,#7f1d1d)]" />
        <p className="flex-1 text-[11px] leading-snug text-neutral-600 sm:text-xs">
          We use cookies to remember your recently viewed properties and improve your experience.
        </p>
        <button
          onClick={accept}
          className="shrink-0 rounded-full bg-[var(--color-primary,#7f1d1d)] px-4 py-2 text-xs font-semibold text-white"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
