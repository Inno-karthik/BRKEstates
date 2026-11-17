"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { ConfirmProvider } from "@/components/ui/confirm";

export function UIProviders({ children }: { children: ReactNode }) {
  return (
    <ConfirmProvider>
      {children}
      <Toaster position="top-center" richColors closeButton toastOptions={{ style: { fontFamily: "inherit" } }} />
    </ConfirmProvider>
  );
}
