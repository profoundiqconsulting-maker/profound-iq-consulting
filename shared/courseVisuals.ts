/* Profound IQ Consulting — Branded visual asset generation for course lessons.
 *
 * Produces unique, deterministic SVG visual assets (flowcharts, diagrams,
 * illustrations, infographics) for every lesson. Each asset is generated
 * from lesson parameters (course, module, lesson index, theme) so no two
 * lessons share the same visual, while maintaining a consistent PIQ brand
 * identity adapted to each subject domain.
 */

import type { CourseCategory } from "./courseCatalog";

/* ============================================================================
 * Brand system
 * ============================================================================ */

export const PIQ_BRAND = {
  primary: "#16243d",
  secondary: "#c9a34e",
  accent: "#7d5e1e",
  bg: "#f7f3e8",
  surface: "#ffffff",
  text: "#16243d",
  muted: "#5d4613",
  line: "#d7deea",
} as const;

export type VisualPalette = {
  primary: string;
  secondary: string;
  accent: string;
  light: string;
  dark: string;
  surface: string;
  text: string;
  muted: string;
  line: string;
};

export const DOMAIN_PALETTES: Record<string, VisualPalette> = {
  "AI & Digital": {
    primary: "#1e3a5f",
    secondary: "#3b82f6",
    accent: "#1d4ed8",
    light: "#eff6ff",
    dark: "#1e3a5f",
    surface: "#ffffff",
    text: "#0f172a",
    muted: "#64748b",
    line: "#e2e8f0",
  },
  "Business & Analytics": {
    primary: "#16243d",
    secondary: "#c9a34e",
    accent: "#7d5e1e",
    light: "#fbf7ec",
    dark: "#16243d",
    surface: "#ffffff",
    text: "#16243d",
    muted: "#5d4613",
    line: "#d7deea",
  },
  "Education & Research": {
    primary: "#0f5132",
    secondary: "#84cc16",
    accent: "#15803d",
    light: "#f0fdf4",
    dark: "#0f5132",
    surface: "#ffffff",
    text: "#0f5132",
    muted: "#3f6212",
    line: "#dcfce7",
  },
  "Communication & Career": {
    primary: "#5b21b6",
    secondary: "#a855f7",
    accent: "#7c3aed",
    light: "#faf5ff",
    dark: "#5b21b6",
    surface: "#ffffff",
    text: "#5b21b6",
    muted: "#7e22ce",
    line: "#ede9fe",
  },
  "Leadership & Workplace": {
    primary: "#16243d",
    secondary: "#c9a34e",
    accent: "#7d5e1e",
    light: "#fbf7ec",
    dark: "#16243d",
    surface: "#ffffff",
    text: "#16243d",
    muted: "#5d4613",
    line: "#d7deea",
  },
  "Personal Development": {
    primary: "#7c2d12",
    secondary: "#ea580c",
    accent: "#c2410c",
    light: "#fff7ed",
    dark: "#7c2d12",
    surface: "#ffffff",
    text: "#7c2d12",
    muted: "#9a3412",
    line: "#fed7aa",
  },
} as const;

export function paletteForCategory(category: CourseCategory): VisualPalette {
  return DOMAIN_PALETTES[category] ?? DOMAIN_PALETTES["Business & Analytics"];
}

export type VisualAssetType =
  "flowchart" | "diagram" | "illustration" | "infographic";

export type GeneratedVisualAsset = {
  type: VisualAssetType;
  svg: string;
  alt: string;
  caption: string;
  label: string;
};

/* ============================================================================
 * Deterministic hashing (no external deps)
 * ============================================================================ */

function djb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}

export function lessonVisualSeed(
  courseSlug: string,
  moduleIndex: number,
  lessonIndex: number,
  kind: string
): number {
  return djb2(`${courseSlug}:${moduleIndex}:${lessonIndex}:${kind}`);
}

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

function pickFrom<T>(items: T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length)];
}

function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

/* ============================================================================
 * SVG helpers
 * ============================================================================ */

function svgAttrs(width: number, height: number, viewBox: string): string {
  return `width="${width}" height="${height}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg"`;
}

function rect(
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  rx?: number,
  stroke?: string,
  strokeWidth?: number
): string {
  const rxAttr = rx !== undefined ? ` rx="${rx}"` : "";
  const strokeAttr =
    stroke !== undefined
      ? ` stroke="${stroke}" stroke-width="${strokeWidth ?? 1}"`
      : "";
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rxAttr}${strokeAttr} />`;
}

function circle(
  cx: number,
  cy: number,
  r: number,
  fill: string,
  stroke?: string,
  strokeWidth?: number
): string {
  const strokeAttr =
    stroke !== undefined
      ? ` stroke="${stroke}" stroke-width="${strokeWidth ?? 1}"`
      : "";
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${strokeAttr} />`;
}

function line(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  stroke: string,
  strokeWidth: number = 2
): string {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" />`;
}

function path(
  d: string,
  fill: string = "none",
  stroke: string,
  strokeWidth: number = 2
): string {
  return `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />`;
}

function text(
  x: number,
  y: number,
  content: string,
  fill: string,
  size: number = 12,
  weight: string = "normal",
  anchor: string = "start",
  fontFamily: string = "system-ui, -apple-system, sans-serif"
): string {
  const escaped = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" font-family="${fontFamily}">${escaped}</text>`;
}

function polyline(
  points: string,
  stroke: string,
  strokeWidth: number = 2
): string {
  return `<polyline points="${points}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />`;
}

/* ============================================================================
 * Visual generators
 * ============================================================================ */

export function generateFlowchartSvg(
  seed: number,
  palette: VisualPalette,
  title: string,
  steps: string[]
): string {
  const rng = seededRandom(seed);
  const w = 640;
  const h = 420;
  const cx = w / 2;
  const startY = 60;
  const stepH = 56;
  const gap = 24;

  const lines: string[] = [];
  lines.push(`<svg ${svgAttrs(w, h, `0 0 ${w} ${h}`)}>`);
  lines.push(rect(0, 0, w, h, palette.light));
  lines.push(rect(20, 20, w - 40, 40, palette.primary, 8));
  lines.push(text(cx, 44, title, "#ffffff", 16, "bold", "middle"));

  let currentY = startY;
  for (let i = 0; i < steps.length; i++) {
    const boxY = currentY;
    const boxX = 60;
    const boxW = w - 120;
    const accentColor = pickFrom(
      [palette.secondary, palette.accent, palette.primary],
      rng
    );

    lines.push(
      rect(boxX, boxY, boxW, stepH, palette.surface, 10, accentColor, 2)
    );
    lines.push(
      text(boxX + 24, boxY + 30, `${i + 1}.`, accentColor, 14, "bold", "start")
    );
    lines.push(
      text(boxX + 48, boxY + 30, steps[i], palette.text, 13, "normal", "start")
    );

    if (i < steps.length - 1) {
      const arrowY = boxY + stepH + gap / 2;
      lines.push(line(cx, boxY + stepH, cx, arrowY, accentColor, 2));
      lines.push(
        path(
          `M ${cx - 6} ${arrowY - 6} L ${cx} ${arrowY} L ${cx + 6} ${arrowY - 6}`,
          "none",
          accentColor,
          2
        )
      );
    }

    currentY += stepH + gap;
  }

  lines.push(`</svg>`);
  return lines.join("\n");
}

export function generateDiagramSvg(
  seed: number,
  palette: VisualPalette,
  title: string,
  concept: string,
  nodes: string[]
): string {
  const rng = seededRandom(seed);
  const w = 640;
  const h = 420;
  const cx = w / 2;
  const cy = h / 2 + 20;

  const lines: string[] = [];
  lines.push(`<svg ${svgAttrs(w, h, `0 0 ${w} ${h}`)}>`);
  lines.push(rect(0, 0, w, h, palette.light));
  lines.push(rect(20, 20, w - 40, 40, palette.primary, 8));
  lines.push(text(cx, 44, title, "#ffffff", 16, "bold", "middle"));

  // Central concept node
  const nodeR = 50;
  lines.push(circle(cx, cy, nodeR, palette.primary));
  lines.push(text(cx, cy + 4, concept, "#ffffff", 14, "bold", "middle"));

  // Peripheral nodes in a circle
  const orbitR = 150;
  const nodeCount = nodes.length;
  for (let i = 0; i < nodeCount; i++) {
    const angle = -Math.PI / 2 + (i * (2 * Math.PI)) / nodeCount;
    const nx = cx + orbitR * Math.cos(angle);
    const ny = cy + orbitR * Math.sin(angle);
    const nodeColor = pickFrom(
      [palette.secondary, palette.accent, palette.primary],
      rng
    );

    // Connection line
    lines.push(
      line(
        cx + nodeR * Math.cos(angle),
        cy + nodeR * Math.sin(angle),
        nx - nodeR * 0.5 * Math.cos(angle),
        ny - nodeR * 0.5 * Math.sin(angle),
        palette.muted,
        2
      )
    );

    lines.push(circle(nx, ny, 26, nodeColor));
    lines.push(
      text(
        nx,
        ny + 5,
        nodes[i].length > 12 ? nodes[i].slice(0, 12) + "…" : nodes[i],
        "#ffffff",
        10,
        "bold",
        "middle"
      )
    );
  }

  lines.push(
    text(cx, cy + nodeR + 28, concept, palette.text, 13, "bold", "middle")
  );
  lines.push(`</svg>`);
  return lines.join("\n");
}

export function generateIllustrationSvg(
  seed: number,
  palette: VisualPalette,
  title: string,
  metaphor: string
): string {
  const rng = seededRandom(seed);
  const w = 640;
  const h = 420;

  const lines: string[] = [];
  lines.push(`<svg ${svgAttrs(w, h, `0 0 ${w} ${h}`)}>`);
  lines.push(rect(0, 0, w, h, palette.light));
  lines.push(rect(20, 20, w - 40, 40, palette.primary, 8));
  lines.push(text(w / 2, 44, title, "#ffffff", 16, "bold", "middle"));

  // PIQ logo brand mark (bottom-right)
  lines.push(
    `<image href="/assets/logo/piq-logo.png" x="${w - 130}" y="${h - 70}" width="110" height="50" preserveAspectRatio="xMidYMid meet" opacity="0.9" />`
  );
  lines.push(text(w - 70, h - 24, "PIQ", palette.muted, 10, "bold", "end"));

  // Abstract illustrative composition
  const accentColor = pickFrom(
    [palette.secondary, palette.accent, palette.primary],
    rng
  );

  // Background shapes
  for (let i = 0; i < 6; i++) {
    const rx = rng() * (w - 100) + 50;
    const ry = rng() * (h - 140) + 140;
    const rs = rng() * 40 + 20;
    const ro = 0.15 + rng() * 0.25;
    const rcolor = pickFrom(
      [palette.primary, palette.secondary, palette.accent],
      rng
    );
    lines.push(circle(rx, ry, rs, rcolor, "none", 0));
    // opacity via fill-opacity attribute
    lines[lines.length - 1] = lines[lines.length - 1].replace(
      ` fill="${rcolor}"`,
      ` fill="${rcolor}" fill-opacity="${ro}"`
    );
  }

  // Central motif: an open book / document with a path
  const bookX = w * 0.35;
  const bookY = h * 0.55;
  lines.push(rect(bookX, bookY, 140, 100, palette.surface, 10, accentColor, 2));
  lines.push(rect(bookX + 10, bookY + 15, 60, 20, accentColor, 4));
  lines.push(rect(bookX + 10, bookY + 45, 90, 18, palette.primary, 4));
  lines.push(rect(bookX + 10, bookY + 72, 50, 14, palette.secondary, 4));

  // Path arrows leading to the book
  const pathColor = palette.accent;
  lines.push(
    path(
      `M ${w * 0.15} ${h * 0.8} Q ${w * 0.35} ${h * 0.85} ${bookX} ${bookY}`,
      "none",
      pathColor,
      3
    )
  );
  lines.push(
    path(
      `M ${w * 0.85} ${h * 0.75} Q ${w * 0.65} ${h * 0.8} ${bookX + 140} ${bookY + 50}`,
      "none",
      pathColor,
      3
    )
  );

  lines.push(
    text(w / 2, h - 100, metaphor, palette.muted, 12, "normal", "middle")
  );
  lines.push(text(w / 2, h - 84, title, palette.text, 13, "bold", "middle"));

  lines.push(`</svg>`);
  return lines.join("\n");
}

export function generateInfographicSvg(
  seed: number,
  palette: VisualPalette,
  title: string,
  stat1: { label: string; value: string },
  stat2: { label: string; value: string },
  stat3: { label: string; value: string }
): string {
  const rng = seededRandom(seed);
  const w = 640;
  const h = 420;
  const cx = w / 2;

  const lines: string[] = [];
  lines.push(`<svg ${svgAttrs(w, h, `0 0 ${w} ${h}`)}>`);
  lines.push(rect(0, 0, w, h, palette.light));
  lines.push(rect(20, 20, w - 40, 40, palette.primary, 8));
  lines.push(text(cx, 44, title, "#ffffff", 16, "bold", "middle"));

  const cardW = 150;
  const cardH = 160;
  const gap = 30;
  const startX = (w - (cardW * 3 + gap * 2)) / 2;
  const cardY = 110;

  const cards = [stat1, stat2, stat3];
  for (let i = 0; i < cards.length; i++) {
    const x = startX + i * (cardW + gap);
    const cardColor = pickFrom(
      [palette.surface, palette.light, palette.surface],
      rng
    );
    const accentColor = pickFrom(
      [palette.secondary, palette.accent, palette.primary],
      rng
    );

    lines.push(rect(x, cardY, cardW, cardH, cardColor, 12, accentColor, 2));
    lines.push(rect(x + 24, cardY + 24, 48, 48, accentColor, 10));
    lines.push(
      text(
        x + cardW / 2,
        cardY + 52,
        cards[i].value,
        accentColor,
        22,
        "bold",
        "middle"
      )
    );
    lines.push(
      text(
        x + cardW / 2,
        cardY + 86,
        cards[i].label,
        palette.text,
        11,
        "bold",
        "middle"
      )
    );
    lines.push(
      text(
        x + cardW / 2,
        cardY + cardH - 30,
        "PIQ",
        palette.muted,
        10,
        "bold",
        "middle"
      )
    );

    if (i < cards.length - 1) {
      lines.push(
        line(
          x + cardW,
          cardY + cardH / 2,
          x + cardW + gap,
          cardY + cardH / 2,
          palette.muted,
          2
        )
      );
      lines.push(
        path(
          `M ${x + cardW + gap - 6} ${cardY + cardH / 2 - 6} L ${x + cardW + gap} ${cardY + cardH / 2} L ${x + cardW + gap - 6} ${cardY + cardH / 2 + 6}`,
          "none",
          palette.muted,
          2
        )
      );
    }
  }

  lines.push(
    text(
      cx,
      h - 30,
      "Profound IQ Consulting · Branded insight",
      palette.muted,
      11,
      "normal",
      "middle"
    )
  );
  lines.push(`</svg>`);
  return lines.join("\n");
}

/* ============================================================================
 * Master generator
 * ============================================================================ */

export function generateLessonVisuals(
  courseSlug: string,
  courseTitle: string,
  category: CourseCategory,
  theme: string,
  lessonTitle: string,
  moduleIndex: number,
  lessonIndex: number
): GeneratedVisualAsset[] {
  const palette = paletteForCategory(category);
  const seedFlow = lessonVisualSeed(
    courseSlug,
    moduleIndex,
    lessonIndex,
    "flowchart"
  );
  const seedDiag = lessonVisualSeed(
    courseSlug,
    moduleIndex,
    lessonIndex,
    "diagram"
  );
  const seedIll = lessonVisualSeed(
    courseSlug,
    moduleIndex,
    lessonIndex,
    "illustration"
  );
  const seedInfo = lessonVisualSeed(
    courseSlug,
    moduleIndex,
    lessonIndex,
    "infographic"
  );

  const practiceVerbs = [
    "frame",
    "test",
    "review",
    "apply",
    "reflect",
    "adjust",
    "connect",
  ];
  const practice = practiceVerbs[lessonIndex % practiceVerbs.length];

  const flowchartSteps = [
    "Situation",
    "Observe the signal",
    `Choose ${practice}`,
    "Act deliberately",
    "Review the evidence",
  ];

  const diagramNodes = ["Input", theme, "Decision", "Action", "Outcome"];

  const illustrationMetaphor = lessonMetaphor(lessonTitle, theme, practice);

  const stats = [
    { label: "Modules", value: String(moduleIndex + 1) },
    { label: "Lesson", value: String(lessonIndex + 1) },
    { label: "Practice", value: practice },
  ];

  return [
    {
      type: "flowchart",
      svg: generateFlowchartSvg(seedFlow, palette, lessonTitle, flowchartSteps),
      alt: `Flowchart for ${lessonTitle}`,
      caption: `How ${lessonTitle.toLowerCase()} moves from situation to outcome.`,
      label: `Signal ${String(moduleIndex + 1).padStart(2, "0")}.${lessonIndex + 1} · Flow`,
    },
    {
      type: "diagram",
      svg: generateDiagramSvg(
        seedDiag,
        palette,
        lessonTitle,
        theme,
        diagramNodes
      ),
      alt: `Concept diagram for ${lessonTitle}`,
      caption: `The working parts of ${lessonTitle.toLowerCase()} within ${theme}.`,
      label: `Signal ${String(moduleIndex + 1).padStart(2, "0")}.${lessonIndex + 1} · Map`,
    },
    {
      type: "illustration",
      svg: generateIllustrationSvg(
        seedIll,
        palette,
        lessonTitle,
        illustrationMetaphor
      ),
      alt: `Illustration for ${lessonTitle}`,
      caption: `${lessonTitle} — from ${theme} to an observable move.`,
      label: `Signal ${String(moduleIndex + 1).padStart(2, "0")}.${lessonIndex + 1} · View`,
    },
    {
      type: "infographic",
      svg: generateInfographicSvg(
        seedInfo,
        palette,
        lessonTitle,
        stats[0],
        stats[1],
        stats[2]
      ),
      alt: `Infographic for ${lessonTitle}`,
      caption: `Key signals for ${lessonTitle.toLowerCase()}.`,
      label: `Signal ${String(moduleIndex + 1).padStart(2, "0")}.${lessonIndex + 1} · Insight`,
    },
  ];
}

function lessonMetaphor(
  lessonTitle: string,
  theme: string,
  practice: string
): string {
  const lower = lessonTitle.toLowerCase();
  const themeLower = theme.toLowerCase();

  const metaphors: Record<string, string> = {
    frame: `Frame ${lessonTitle} inside ${theme}: set the boundary, name the signal, then decide what counts as evidence.`,
    test: `Test ${lessonTitle} against ${theme}: run one small check, observe what changes, and adjust before the next move.`,
    review: `Review ${lessonTitle} within ${theme}: gather the evidence, compare against the intended outcome, and name the next adjustment.`,
    apply: `Apply ${lessonTitle} to ${theme}: make one observable teaching decision, capture the learner response, and repeat.`,
    reflect: `Reflect on ${lessonTitle} in ${theme}: pause on the decision, name what the evidence shows, and choose the responsible next step.`,
    adjust: `Adjust ${lessonTitle} for ${theme}: revise one assumption based on learner evidence, then test whether the change holds.`,
    connect: `Connect ${lessonTitle} to ${theme}: link the intended outcome to one visible learner action, and review the result.`,
  };

  return (
    metaphors[practice] ??
    `One ${lessonTitle} decision inside ${theme}, tested against evidence and adjusted for the next move.`
  );
}
