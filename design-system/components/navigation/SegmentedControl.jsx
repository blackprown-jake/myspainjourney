import React from "react";

/**
 * Wanted SegmentedControl — a pill toggle group. The selected segment is a white
 * pill floating on a translucent grey track. Use for 2–4 short, mutually
 * exclusive options.
 */

export function SegmentedControl({ items = [], value, onChange, size = "medium", fullWidth = false, style }) {
  const h = size === "small" ? 32 : size === "large" ? 44 : 38;
  return (
    <div
      style={{
        display: "inline-flex",
        gap: 2,
        padding: 3,
        height: h,
        borderRadius: 999,
        background: "var(--wt-fill)",
        boxSizing: "border-box",
        fontFamily: "var(--font-sans)",
        width: fullWidth ? "100%" : undefined,
        ...style,
      }}
    >
      {items.map((it) => {
        const v = it.value ?? it.label;
        const active = v === value;
        return (
          <button
            key={v}
            onClick={() => onChange && onChange(v)}
            style={{
              flex: fullWidth ? 1 : "0 0 auto",
              border: "none",
              borderRadius: 999,
              padding: "0 16px",
              background: active ? "var(--wt-static-white)" : "transparent",
              color: active ? "var(--wt-text-strong)" : "var(--wt-text-alt)",
              fontFamily: "var(--font-sans)",
              fontSize: size === "small" ? 13 : 14,
              fontWeight: active ? 700 : 500,
              cursor: "pointer",
              boxShadow: active ? "var(--elevation-sm)" : "none",
              transition: "all var(--duration-fast) var(--ease-standard)",
              whiteSpace: "nowrap",
            }}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
