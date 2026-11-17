"use client";

import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  name?: string | null;
  url?: string | null;
  className?: string;
  size?: number;
  fallback?: IconName;
};

/** Renders an admin-chosen icon: a custom uploaded image if set, otherwise a lucide icon by name. */
export function Icon({ name, url, className, size = 20, fallback = "circle-dot" }: Props) {
  if (url) {
    return (
      <Image
        src={url}
        alt=""
        width={size}
        height={size}
        className={cn("inline-block object-contain", className)}
      />
    );
  }

  return (
    <DynamicIcon
      name={(name as IconName) || fallback}
      size={size}
      className={cn("inline-block", className)}
    />
  );
}
