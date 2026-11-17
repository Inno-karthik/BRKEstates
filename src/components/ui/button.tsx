import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary,#7f1d1d)]",
  {
    variants: {
      intent: {
        primary: "bg-[var(--color-primary,#7f1d1d)] text-white hover:bg-[var(--color-secondary,#3b0b10)]",
        gold: "bg-[var(--color-accent,#d4af37)] text-[var(--color-secondary,#3b0b10)] hover:brightness-95",
        outline: "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50",
        danger: "bg-red-600 text-white hover:bg-red-700",
        ghost: "text-neutral-600 hover:bg-neutral-100",
      },
      size: {
        sm: "px-3.5 py-1.5 text-xs",
        md: "px-5 py-2.5 text-sm",
        lg: "px-7 py-3 text-sm",
      },
    },
    defaultVariants: { intent: "primary", size: "md" },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

export function Button({
  intent,
  size,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & ButtonVariants) {
  return <button className={cn(buttonVariants({ intent, size }), className)} {...props} />;
}
