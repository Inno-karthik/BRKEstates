/** Original SVG skyline illustration for the hero — no external image dependency. */
export function HeroScenicBg() {
  return (
    <svg
      viewBox="0 0 1440 560"
      preserveAspectRatio="xMidYMax slice"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-90"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="sunGlow" cx="50%" cy="100%" r="75%">
          <stop offset="0%" stopColor="var(--color-accent, #d4af37)" stopOpacity="0.55" />
          <stop offset="55%" stopColor="var(--color-accent, #d4af37)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="var(--color-accent, #d4af37)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hillFar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary, #1b5e3a)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--color-primary, #1b5e3a)" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="hillNear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-secondary, #0f3d26)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--color-secondary, #0f3d26)" stopOpacity="1" />
        </linearGradient>
      </defs>

      <circle cx="720" cy="520" r="340" fill="url(#sunGlow)" />

      {/* stars */}
      <g fill="white" opacity="0.5">
        <circle cx="120" cy="70" r="1.6" />
        <circle cx="260" cy="40" r="1.2" />
        <circle cx="420" cy="90" r="1.8" />
        <circle cx="610" cy="35" r="1.3" />
        <circle cx="820" cy="60" r="1.6" />
        <circle cx="1010" cy="30" r="1.2" />
        <circle cx="1180" cy="75" r="1.8" />
        <circle cx="1320" cy="45" r="1.3" />
      </g>

      {/* far hills */}
      <path
        d="M0,340 C180,290 320,310 480,300 C640,290 760,250 940,270 C1120,290 1260,320 1440,300 L1440,560 L0,560 Z"
        fill="url(#hillFar)"
      />

      {/* near hills with a simple skyline silhouette suggesting rooftops/buildings */}
      <path
        d="M0,420 L0,400 L40,400 L40,370 L80,370 L80,410 L130,410 L130,360 L150,360 L150,330 L170,330 L170,360 L190,360 L190,410
           C260,395 330,420 400,405 L400,350 L430,350 L430,320 L450,320 L450,350 L480,350 L480,405
           C560,420 640,390 720,400 L720,360 L760,360 L760,330 L780,330 L780,360 L820,360 L820,400
           C900,415 980,395 1060,405 L1060,340 L1090,340 L1090,300 L1115,300 L1115,340 L1150,340 L1150,405
           C1230,420 1320,400 1440,410 L1440,560 L0,560 Z"
        fill="url(#hillNear)"
      />
    </svg>
  );
}
