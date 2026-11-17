"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type UnlockState = { unlocked: boolean; unlock: () => void };

const UnlockContext = createContext<UnlockState | null>(null);

function storageKey(propertyId: string) {
  return `bhk_unlocked_${propertyId}`;
}

/** Wraps a property page so unlocking the brochure or the layout images unlocks both,
 *  and remembers it in localStorage — so a refresh (or coming back later) doesn't ask
 *  the visitor to hand over their details again for content they already unlocked. */
export function UnlockProvider({ propertyId, children }: { propertyId: string; children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    try {
      // localStorage isn't available on the server, so this has to run post-mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (localStorage.getItem(storageKey(propertyId)) === "1") setUnlocked(true);
    } catch {
      // ignore — private browsing / storage disabled just means no persistence
    }
  }, [propertyId]);

  function unlock() {
    setUnlocked(true);
    try {
      localStorage.setItem(storageKey(propertyId), "1");
    } catch {
      // ignore
    }
  }

  return <UnlockContext.Provider value={{ unlocked, unlock }}>{children}</UnlockContext.Provider>;
}

export function useUnlock() {
  const ctx = useContext(UnlockContext);
  if (!ctx) throw new Error("useUnlock must be used within UnlockProvider");
  return ctx;
}
