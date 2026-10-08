import React from "react";
import { Icon } from "../../assets/icons/Icon.jsx";

/**
 * Wanted Checkbox — rounded-square selection control with an optional label.
 * Checked state fills with the primary blue and shows a white check.
 * Supports indeterminate and disabled.
 */

const SIZES = { medium: 22, small: 18 };

export function Checkbox({
  checked = false,
  indeterminate = false,
  disabled = false,
  label,
  size = "medium",
  onChange,
  style,
  ...rest
}) {
  const box = SIZES[size] || SIZES.medium;
  const on = checked || indeterminate;
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
        onClick={() => !disabled && onChange && onChange(!checked)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: box,
          height: box,
          borderRadius: 6,
          boxSizing: "border-box",
          background: on ? "var(--wt-primary)" : "var(--wt-static-white)",
          border: on ? "none" : "1.5px solid var(--wt-border-solid)",
          color: "var(--wt-static-white)",
          transition: "background var(--duration-fast) var(--ease-standard)",
        }}
      >
        {indeterminate ? (
          <Icon name="minus" size={box - 4} />
        ) : checked ? (
          <Icon name="check" size={box - 4} />
        ) : null}
      </span>
      {label != null && (
        <span style={{ fontSize: size === "small" ? 14 : 15, color: "var(--wt-text)", lineHeight: 1.4 }}>{label}</span>
      )}
    </label>
  );
}

export default Checkbox;
