import type { CSSProperties, ReactNode } from "react";
import type { PageKey } from "@/lib/types";

/**
 * Wraps a page's content. Site-wide branding is fixed (the brand palette in
 * globals.css); only a property's own color scheme varies (set in its editor),
 * passed in via `style` so it reaches every descendant, including fixed/floating ones.
 */
export function PageTheme({
  page,
  style,
  children,
}: {
  page: PageKey;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div data-page={page} style={style} className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      {children}
    </div>
  );
}
