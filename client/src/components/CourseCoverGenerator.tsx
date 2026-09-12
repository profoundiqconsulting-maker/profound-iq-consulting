/* Profound IQ Consulting — dynamic lightweight course cover generator. */
type CourseCoverGeneratorProps = {
  slug: string;
  title?: string;
  className?: string;
};

const BRAND = {
  navy: "#16243d",
  navyDeep: "#0a1426",
  gold: "#c9a34e",
  goldLight: "#d4b35c",
  cream: "#f7f3e8",
  slate: "#c1cad7",
  slateDeep: "#657084",
} as const;

const PALETTES = [
  { bg: "#16243d", fg: "#c9a34e", accent: "#f7f3e8", muted: "#c1cad7" },
  { bg: "#0a1426", fg: "#d4b35c", accent: "#f7f3e8", muted: "#8f9db3" },
  { bg: "#16243d", fg: "#f7f3e8", accent: "#c9a34e", muted: "#657084" },
  { bg: "#101d35", fg: "#c9a34e", accent: "#f7f3e8", muted: "#c1cad7" },
  { bg: "#0f1c32", fg: "#d4b35c", accent: "#f7f3e8", muted: "#8f9db3" },
  { bg: "#16243d", fg: "#c9a34e", accent: "#f7f3e8", muted: "#a27e2e" },
] as const;

const PATTERNS = [
  "grid",
  "diagonal",
  "circles",
  "blocks",
  "lines",
  "overlap",
] as const;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function pickFromArray<T>(arr: readonly T[], seed: number): T {
  return arr[seed % arr.length];
}

function generatePattern(pattern: string, palette: (typeof PALETTES)[number], seed: number) {
  const shapes: React.ReactNode[] = [];
  const rng = (max: number) => seed % max;

  if (pattern === "grid") {
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 3; j++) {
        const opacity = 0.08 + (rng(40) / 100);
        shapes.push(
          <rect
            key={`${i}-${j}`}
            x={20 + i * 60}
            y={20 + j * 80}
            width={40}
            height={50}
            fill={palette.accent}
            opacity={opacity}
            rx={4}
          />
        );
      }
    }
  } else if (pattern === "diagonal") {
    for (let i = 0; i < 6; i++) {
      shapes.push(
        <line
          key={i}
          x1={0}
          y1={40 + i * 50}
          x2={640}
          y2={40 + i * 50}
          stroke={palette.fg}
          strokeWidth={1.5}
          opacity={0.2 + (rng(30) / 100)}
        />
      );
    }
  } else if (pattern === "circles") {
    for (let i = 0; i < 4; i++) {
      shapes.push(
        <circle
          key={i}
          cx={160 + rng(320)}
          cy={100 + rng(160)}
          r={30 + rng(80)}
          fill="none"
          stroke={palette.fg}
          strokeWidth={2}
          opacity={0.25 + (rng(30) / 100)}
        />
      );
    }
  } else if (pattern === "blocks") {
    for (let i = 0; i < 3; i++) {
      shapes.push(
        <rect
          key={i}
          x={40 + rng(400)}
          y={40 + rng(200)}
          width={80 + rng(120)}
          height={60 + rng(100)}
          fill={palette.fg}
          opacity={0.15 + (rng(25) / 100)}
          rx={6}
        />
      );
    }
  } else if (pattern === "lines") {
    for (let i = 0; i < 8; i++) {
      shapes.push(
        <line
          key={i}
          x1={0}
          y1={20 + i * 40}
          x2={640}
          y2={20 + i * 40}
          stroke={palette.accent}
          strokeWidth={1}
          opacity={0.1 + (rng(25) / 100)}
        />
      );
    }
  } else if (pattern === "overlap") {
    shapes.push(
      <circle
        key="c1"
        cx={200}
        cy={180}
        r={140}
        fill={palette.fg}
        opacity={0.12}
      />,
      <rect
        key="r1"
        x={280}
        y={80}
        width={220}
        height={200}
        fill={palette.accent}
        opacity={0.08}
        rx={12}
      />,
      <circle
        key="c2"
        cx={440}
        cy={200}
        r={100}
        fill={palette.fg}
        opacity={0.1}
      />
    );
  }

  return shapes;
}

export function CourseCoverGenerator({
  slug,
  title,
  className,
}: CourseCoverGeneratorProps) {
  const seed = hashString(slug);
  const palette = pickFromArray(PALETTES, seed);
  const pattern = pickFromArray(PATTERNS, seed + 1);
  const patternShapes = generatePattern(pattern, palette, seed + 2);
  const displayTitle =
    title || slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());

  const titleFontSize = displayTitle.length > 45 ? 18 : displayTitle.length > 32 ? 22 : 26;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 640 360"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-label={displayTitle}
      role="img"
    >
      <rect width="640" height="360" fill={palette.bg} rx="8" />
      {patternShapes}
      <rect
        x="0"
        y="0"
        width="640"
        height="360"
        fill={`url(#grad-${slug.replace(/[^a-z0-9]/g, "")})`}
        opacity="0.4"
        rx="8"
      />
      <defs>
        <linearGradient id={`grad-${slug.replace(/[^a-z0-9]/g, "")}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={palette.fg} stopOpacity="0.3" />
          <stop offset="100%" stopColor={palette.accent} stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <rect x="40" y="40" width="560" height="280" fill={palette.accent} opacity="0.06" rx="4" />
      <text
        x="320"
        y="160"
        dominantBaseline="middle"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial, sans-serif"
        fontSize={titleFontSize}
        fontWeight="700"
        fill={palette.fg}
      >
        {displayTitle}
      </text>
      <text
        x="320"
        y="200"
        dominantBaseline="middle"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial, sans-serif"
        fontSize="14"
        fontWeight="400"
        fill={palette.muted}
      >
        {palette.fg === "#c9a34e" || palette.fg === "#d4b35c" ? "Executive pathway" : "Professional course"}
      </text>
      <rect x="40" y="290" width="120" height="4" fill={palette.fg} opacity="0.7" rx="2" />
      <rect x="40" y="298" width="80" height="4" fill={palette.fg} opacity="0.4" rx="2" />
    </svg>
  );
}
