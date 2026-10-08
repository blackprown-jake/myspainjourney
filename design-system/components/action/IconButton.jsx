import React from "react";
import { Icon } from "../../assets/icons/Icon.jsx";

/**
 * Wanted IconButton — a square, icon-only tap target.
 * Variants: normal (bare), background (filled grey circle/square), outlined.
 * Use for toolbar actions, close/more affordances, bookmark toggles, etc.
 */

const SIZES = {
  large: { box: 48, icon: 24, r: 12 },
  medium: { box: 40, icon: 24, r: 10 },
  small: { box: 32, icon: 20, r: 8 },
  xsmall: { box: 24, icon: 18, r: 6 },
};

export function IconButton({
  icon,
  variant = "normal",
  size = "medium",
  shape = "rounded",
  color,
  disabled = false,
  ariaLabel,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const s = SIZES[size] || SIZES.medium;
  const radius = shape === "circle" ? "50%" : s.r;

  const base =
    variant === "background"
      ? { background: "var(--wt-fill)", border: "none" }
      : variant === "outlined"
      ? { background: "transparent", border: "1px solid var(--wt-border-solid)" }
      : { background: "transparent", border: "none" };

  let overlay = "transparent";
  if (!disabled) {
    if (press) overlay = "rgba(112,115,124,0.16)";
    else if (hover) overlay = "rgba(112,115,124,0.08)";
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: s.box,
        height: s.box,
        borderRadius: radius,
        color: disabled ? "var(--wt-text-disabled)" : color || "var(--wt-text)",
        cursor: disabled ? "not-allowed" : "pointer",
        boxSizing: "border-box",
        transition: "background var(--duration-fast) var(--ease-standard)",
        outline: "none",
        WebkitTapHighlightColor: "transparent",
        ...base,
        ...style,
      }}
      {...rest}
    >
      <Icon name={icon} size={s.icon} />
      <span aria-hidden="true" style={{ position: "absolute", inset: 0, borderRadius: radius, background: overlay, pointerEvents: "none" }} />
    </button>
  );
}

export default IconButton;
