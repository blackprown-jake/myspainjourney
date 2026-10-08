import React from "react";

/** Wanted Radio — single-choice circular control with an optional label. */

const SIZES = { medium: 22, small: 18 };

export function Radio({ checked = false, disabled = false, label, size = "medium", name, value, onChange, style, ...rest }) {
  const box = SIZES[size] || SIZES.medium;
  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        fontFamily: "var(--font-sans)",
        ...style,
      }}
      {...rest}
    >
      <span
        onClick={() => !disabled && onChange && onChange(value ?? true)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: box,
          height: box,
          borderRadius: "50%",
          boxSizing: "border-box",
          background: "var(--wt-static-white)",
          border: checked ? `${box / 3}px solid var(--wt-primary)` : "1.5px solid var(--wt-border-solid)",
          transition: "border-width var(--duration-fast) var(--ease-standard)",
        }}
      />
      {label != null && (
        <span style={{ fontSize: size === "small" ? 14 : 15, color: "var(--wt-text)", lineHeight: 1.4 }}>{label}</span>
      )}
    </label>
  );
}

export default Radio;
