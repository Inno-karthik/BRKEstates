type IconProps = { size?: number; className?: string };

// lucide-react dropped brand/trademark icons — minimal inline glyphs instead.
export function FacebookIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

export function InstagramIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function YoutubeIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M22.5 7.2a2.8 2.8 0 0 0-2-2C18.7 4.7 12 4.7 12 4.7s-6.7 0-8.5.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 1 12a29 29 0 0 0 .5 4.8 2.8 2.8 0 0 0 2 2c1.8.5 8.5.5 8.5.5s6.7 0 8.5-.5a2.8 2.8 0 0 0 2-2A29 29 0 0 0 23 12a29 29 0 0 0-.5-4.8ZM9.9 15.4V8.6l6 3.4-6 3.4Z" />
    </svg>
  );
}

export function TwitterIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.9 2H22l-7.6 8.7L23.3 22h-7.2l-5.6-7.3L4 22H1l8.2-9.3L1 2h7.4l5.1 6.7L18.9 2Zm-1.3 18h2L7.5 4H5.3l12.3 16Z" />
    </svg>
  );
}

export function WhatsappIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.04 2a9.95 9.95 0 0 0-8.52 15.06L2 22l5.1-1.47A9.95 9.95 0 1 0 12.04 2Zm5.8 14.2c-.24.7-1.4 1.33-1.95 1.4-.5.07-1.14.1-1.84-.12a16.9 16.9 0 0 1-2.4-.9 11.6 11.6 0 0 1-4.6-4.3c-.5-.8-.9-1.7-.9-2.7 0-1 .5-1.5.7-1.7.2-.2.5-.27.65-.27h.47c.15 0 .35-.05.55.42.2.5.68 1.68.74 1.8.06.13.1.28.02.45-.08.17-.12.28-.25.42-.13.15-.27.33-.38.45-.13.13-.26.27-.12.5.15.25.65 1.07 1.4 1.74.96.86 1.76 1.13 2.02 1.26.26.13.4.1.56-.06.15-.17.65-.75.82-1 .17-.25.33-.2.56-.12.23.08 1.45.68 1.7.8.25.13.42.2.48.3.06.13.06.7-.18 1.4Z" />
    </svg>
  );
}
