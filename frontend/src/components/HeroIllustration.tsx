'use client'

export function HeroIllustration() {
  return (
    <div
      className="relative w-full max-w-[500px] aspect-[5/4] mx-auto flex items-center justify-center select-none"
      aria-hidden="true"
    >
      {/* Background radial glow */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
        <div className="w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] rounded-full bg-gradient-to-tr from-brand-blue/20 via-brand-violet/20 to-transparent blur-3xl opacity-75 dark:opacity-90 dark:from-brand-blue/30 dark:via-brand-violet/30" />
      </div>

      {/* Orbital glowing curved rings */}
      <svg
        className="absolute w-[115%] h-[115%] pointer-events-none text-brand-blue/20 dark:text-brand-blue/30"
        viewBox="0 0 500 400"
        fill="none"
      >
        <ellipse
          cx="250"
          cy="200"
          rx="220"
          ry="150"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="6 8"
          transform="rotate(-15 250 200)"
          className="opacity-60 dark:opacity-80"
        />
        <ellipse
          cx="250"
          cy="200"
          rx="180"
          ry="110"
          stroke="currentColor"
          strokeWidth="1"
          transform="rotate(20 250 200)"
          className="opacity-40 dark:opacity-60"
        />
      </svg>

      {/* Illustrative prompt badge; not an analysis result. */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-status-success-bg border border-status-success-border text-status-success text-xs font-bold tracking-wide shadow-soft">
        <span className="w-4 h-4 rounded-full bg-status-success text-white flex items-center justify-center text-[10px] leading-none">
          ✓
        </span>
        <span>Source?</span>
      </div>

      {/* Stacked Newspaper Cards */}
      <div className="relative w-[78%] h-[82%]">
        {/* Back Newspaper Card (Tilted right/back) */}
        <div className="absolute inset-0 bg-surface-secondary/90 dark:bg-[#151B2E] border border-border rounded-2xl sm:rounded-3xl shadow-card transform rotate-6 translate-x-4 translate-y-3 opacity-70" />

        {/* Middle Newspaper Card */}
        <div className="absolute inset-0 bg-surface-secondary dark:bg-[#13192B] border border-border rounded-2xl sm:rounded-3xl shadow-card transform -rotate-3 -translate-x-2 translate-y-1 opacity-85" />

        {/* Front Newspaper Card (Hero focus) */}
        <div className="relative w-full h-full bg-surface border border-border rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-card flex flex-col justify-between overflow-hidden">
          {/* Card Top Header */}
          <div>
            <div className="flex items-center justify-between border-b border-border/80 pb-3 sm:pb-4 mb-3 sm:mb-4">
              <span className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-content-primary">
                NEWS
              </span>
              <div className="flex flex-col gap-1 w-16 sm:w-20">
                <div className="h-1 bg-border rounded-full w-full" />
                <div className="h-1 bg-border rounded-full w-3/4" />
                <div className="h-1 bg-border rounded-full w-1/2" />
              </div>
            </div>

            {/* Thumbnail graphic representing news photograph */}
            <div className="w-full h-20 sm:h-24 rounded-lg bg-surface-secondary border border-border/60 p-2 relative overflow-hidden flex items-end justify-between mb-3.5">
              <div className="w-full h-full absolute inset-0 bg-gradient-to-t from-brand-blue/10 to-transparent" />
              {/* Graphic silhouette: mountains and sun */}
              <div className="w-6 h-6 rounded-full bg-brand-violet/20 border border-brand-violet/30 absolute top-2 right-3" />
              <div className="w-12 h-8 bg-brand-blue/20 rounded-t-md transform rotate-6 translate-y-2" />
              <div className="w-16 h-10 bg-brand-blue/30 rounded-t-md -translate-x-2 translate-y-1" />
              <div className="w-14 h-7 bg-brand-violet/25 rounded-t-md translate-y-1" />
            </div>

            {/* Simulated news paragraph lines */}
            <div className="space-y-2">
              <div className="h-2 bg-border/90 rounded-full w-full" />
              <div className="h-2 bg-border/80 rounded-full w-[94%]" />
              <div className="h-2 bg-border/70 rounded-full w-[88%]" />
              <div className="h-2 bg-border/60 rounded-full w-[55%]" />
            </div>
          </div>

          {/* Micro footer metadata */}
          <div className="flex items-center justify-between text-[10px] text-content-secondary font-mono pt-2 border-t border-border/50">
            <span>VOL. 26 · ISSUE 04</span>
            <span>RESEARCH PREVIEW</span>
          </div>
        </div>

        {/* Magnifying Glass with Checkmark Motif */}
        <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 z-20 w-32 h-32 sm:w-40 sm:h-40 pointer-events-none">
          <svg className="w-full h-full drop-shadow-xl" viewBox="0 0 160 160" fill="none">
            {/* Lens Rim Outer Shadow & Metallic Border */}
            <circle
              cx="68"
              cy="68"
              r="46"
              className="fill-brand-blue/15 dark:fill-brand-blue/25 stroke-slate-300 dark:stroke-slate-600"
              strokeWidth="7"
            />
            {/* Glass Lens reflection */}
            <circle
              cx="68"
              cy="68"
              r="42.5"
              className="fill-transparent stroke-brand-blue/30"
              strokeWidth="2"
            />
            {/* Lens inner shine */}
            <path
              d="M 40 45 A 36 36 0 0 1 85 36"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              className="opacity-70 dark:opacity-50"
            />
            {/* Centered Checkmark motif inside magnifying lens */}
            <path
              d="M 50 68 L 62 80 L 88 54"
              className="stroke-brand-blue dark:stroke-brand-blue"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Magnifier Handle */}
            <line
              x1="102"
              y1="102"
              x2="145"
              y2="145"
              className="stroke-[#2A314A] dark:stroke-[#111525]"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <line
              x1="102"
              y1="102"
              x2="145"
              y2="145"
              className="stroke-[#4A5578] dark:stroke-[#3D4766]"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Handle collar metallic band */}
            <line
              x1="98"
              y1="98"
              x2="108"
              y2="108"
              className="stroke-brand-blue"
              strokeWidth="11"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Illustrative prompt badge; not an analysis result. */}
      <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-status-danger-bg border border-status-danger-border text-status-danger text-xs font-bold tracking-wide shadow-soft">
        <span className="w-4 h-4 rounded-full bg-status-danger text-white flex items-center justify-center text-[10px] leading-none">
          ✕
        </span>
        <span>Context?</span>
      </div>
    </div>
  )
}
