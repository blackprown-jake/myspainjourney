import React from "react";

/**
 * Wanted Tag (Content Badge) — a small rectangular label for content metadata:
 * employment type (정규직), seniority (신입), deadlines (D-3), highlights (응답률 높음).
 * Solid (tinted-fill) or weak (subtle) tones across the accent palette.
 */

const TONES = {
  neutral: { fg: "var(--wt-text-alt)", bg: "var(--wt-fill)" },
  primary: { fg: "var(--wt-primary)", bg: "var(--wt-primary-bg)" },
  violet: { fg: "var(--wt-accent-violet)", bg: "var(--wt-accent-violet-bg)" },
  cyan: { fg: "var(--wt-accent-cyan)", bg: "var(--wt-accent-cyan-bg)" },
  pink: { fg: "var(--wt-accent-pink)", bg: "var(--wt-accent-pink-bg)" },
  red: { fg: "var(--wt-negative)", bg: "var(--red-95)" },
  green: { fg: "var(--wt-accent-green)", bg: "var(--green-95)" },
  orange: { fg: "var(--wt-accent-orange)", bg: "var(--orange-95)" },
};

const SIZES = {
  large: { h: 28, px: 8, font: 13 },
  normal: { h: 24, px: 7, font: 12 },
  small: { h: 20, px: 6, font: 11 },
};

export function Tag({ children, label, tone = "neutral", size = "normal", solid = false, style, ...rest }) {
  const t = TONES[tone] || TONES.neutral;
  const s = SIZES[size] || SIZES.normal;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: s.h,
        padding: `0 ${s.px}px`,
        borderRadius: 6,
        boxSizing: "border-box",
        fontFamily: "var(--font-sans)",
        fontSize: s.font,
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: "nowrap",
        background: solid ? t.fg : t.bg,
        color: solid ? "var(--wt-static-white)" : t.fg,
        ...style,
      }}
      {...rest}
    >
      {label != null ? label : children}
    </span>
  );
}

export default Tag;
