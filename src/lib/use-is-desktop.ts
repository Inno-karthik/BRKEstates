"use client";

import { useEffect, useState } from "react";

export function useIsDesktop(minWidth = 1024) {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${minWidth}px)`);
    // window.matchMedia isn't available on the server, so the initial read has to happen here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDesktop(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [minWidth]);
  return isDesktop;
}
