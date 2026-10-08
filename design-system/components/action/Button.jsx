import React from "react";
import { Icon } from "../../assets/icons/Icon.jsx";

/**
 * Wanted Button — the primary action control.
 * Solid / outlined / text variants in primary, assistive (neutral) and negative
 * colors, across large(48) / medium(40) / small(32) heights. Interaction states
 * are painted with a translucent overlay, matching the source "Interaction" layer.
 */

const SIZES = {
  large: { h: 48, r: 12, px: 28, font: 16, gap: 6, icon: 20 },
  medium: { h: 40, r: 12, px: 20, font: 15, gap: 4, icon: 20 },
  small: { h: 32, r: 8, px: 14, font: 14, gap: 4, icon: 16 },
};

function fills(variant, color) {
  // returns { bg, fg, border }
  if (variant === "solid") {
    if (color === "primary") return { bg: "var(--wt-primary)", fg: "var(--wt-on-primary)" };
    if (color === "negative") return { bg: "var(--wt-negative)", fg: "var(--wt-on-primary)" };
    return { bg: "var(--wt-fill)", fg: "var(--wt-text)" }; // assistive
  }
  if (variant === "outlined") {
    if (color === "primary") return { bg: "transparent", fg: "var(--wt-primary)", border: "var(--wt-primary)" };
    if (color === "negative") return { bg: "transparent", fg: "var(--wt-negative)", border: "var(--wt-negative)" };
    return { bg: "transparent", fg: "var(--wt-text)", border: "var(--wt-border-solid)" }; // assistive
  }
  // text
  if (color === "primary") return { bg: "transparent", fg: "var(--wt-primary)" };
  if (color === "negative") return { bg: "transparent", fg: "var(--wt-negative)" };
  return { bg: "transparent", fg: "var(--wt-text-alt)" };
}

export function Button({
  children,
  variant = "solid",
  color = "primary",
  size = "medium",
  iconLeft,
  iconRight,
  iconOnly = false,
  fullWidth = false,
  disabled = false,
  type = "button",
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const s = SIZES[size] || SIZES.medium;
  const f = fills(variant, color);
  const solid = variant === "solid" && (color === "primary" || color === "negative");

  // interaction overlay opacity
  let overlay = "transparent";
  if (!disabled) {
    const tone = solid ? "0,0,0" : "112,115,124";
    if (press) overlay = `rgba(${tone},0.12)`;
    else if (hover) overlay = `rgba(${tone},0.06)`;
  }

  const disabledStyle = disabled
    ? variant === "solid"
      ? { background: "var(--interaction-disable)", color: "var(--wt-text-disabled)" }
      : { color: "var(--wt-text-disabled)", borderColor: "var(--line-normal-alternative)" }
    : {};

  const renderIcon = (ic) =>
    ic == null ? null : typeof ic === "string" ? <Icon name={ic} size={s.icon} /> : ic;

  return (
    <button
      type={type}
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
        gap: s.gap,
        height: s.h,
        minWidth: iconOnly ? s.h : undefined,
        width: iconOnly ? s.h : fullWidth ? "100%" : undefined,
        padding: iconOnly ? 0 : `0 ${s.px}px`,
        borderRadius: s.r,
        border: f.border ? `1px solid ${f.border}` : "none",
        background: f.bg,
        color: f.fg,
        fontFamily: "var(--font-sans)",
        fontSize: s.font,
        fontWeight: 600,
        lineHeight: 1.5,
        letterSpacing: "0.006em",
        whiteSpace: "nowrap",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background var(--duration-fast) var(--ease-standard)",
        boxSizing: "border-box",
        outline: "none",
        WebkitTapHighlightColor: "transparent",
        ...disabledStyle,
        ...style,
      }}
      {...rest}
    >
      {renderIcon(iconLeft)}
      {!iconOnly && children != null && <span>{children}</span>}
      {iconOnly && renderIcon(children)}
      {renderIcon(iconRight)}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: s.r,
          background: overlay,
          pointerEvents: "none",
          transition: "background var(--duration-fast) var(--ease-standard)",
        }}
      />
    </button>
  );
}

export default Button;
