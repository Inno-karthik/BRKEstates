"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Button } from "@/components/ui/button";

type ConfirmOptions = { title?: string; description?: string; confirmLabel?: string; danger?: boolean };
type ConfirmFn = (message: string | ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/** Promise-based replacement for window.confirm(): `if (!(await confirm("Delete X?"))) return;` */
export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used inside <ConfirmProvider>");
  return ctx;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const [open, setOpen] = useState(false);
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((message) => {
    setOpts(typeof message === "string" ? { title: message } : message);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const settle = (value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setOpen(false);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog.Root open={open} onOpenChange={(o) => !o && settle(false)}>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="fixed inset-0 z-[100] bg-black/40 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
          <AlertDialog.Viewport className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <AlertDialog.Popup className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl outline-none transition duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
              <AlertDialog.Title className="text-base font-semibold text-neutral-900">
                {opts?.title ?? "Are you sure?"}
              </AlertDialog.Title>
              <AlertDialog.Description className="mt-1.5 text-sm text-neutral-500">
                {opts?.description ?? "This action can't be undone."}
              </AlertDialog.Description>
              <div className="mt-5 flex justify-end gap-2">
                <Button intent="outline" size="sm" onClick={() => settle(false)}>
                  Cancel
                </Button>
                <Button intent={opts?.danger === false ? "primary" : "danger"} size="sm" onClick={() => settle(true)}>
                  {opts?.confirmLabel ?? "Delete"}
                </Button>
              </div>
            </AlertDialog.Popup>
          </AlertDialog.Viewport>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </ConfirmContext.Provider>
  );
}
