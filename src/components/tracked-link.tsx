"use client";

import type { ReactNode } from "react";
import { trackClick } from "@/lib/track-event";
import type { LeadEventType } from "@/lib/types";

export function TrackedLink({
  href,
  event,
  propertyId,
  className,
  children,
}: {
  href: string;
  event: LeadEventType;
  propertyId?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      data-tracked="1"
      onClick={() => trackClick(event, propertyId)}
      className={className}
    >
      {children}
    </a>
  );
}
