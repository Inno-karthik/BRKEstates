"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Dialog } from "@base-ui/react/dialog";

/** Controlled by mounting/unmounting (callers render it conditionally), now on base-ui's
 *  Dialog: focus trap, Escape + outside-click dismissal, scroll lock and aria wiring. */
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Dialog.Root open onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-150 data-[starting-style]:opacity-0" />
        <Dialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Popup className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl outline-none transition duration-150 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
            <div className="mb-4 flex items-center justify-between">
              <Dialog.Title className="text-base font-semibold text-neutral-900">{title}</Dialog.Title>
              <Dialog.Close aria-label="Close" className="text-neutral-400 hover:text-neutral-700">
                <X size={18} />
              </Dialog.Close>
            </div>
            {children}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-neutral-600">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#9b1c1c]";
