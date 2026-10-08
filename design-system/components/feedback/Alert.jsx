import React from "react";
import { Icon } from "../../assets/icons/Icon.jsx";

/**
 * Wanted Alert — an inline banner conveying status with a leading icon,
 * message and optional action. Tones: info (primary), positive, cautionary,
 * negative. Subtle tinted surface with a matching icon color.
 */

const TONES = {
  info: { fg: "var(--wt-primary)", bg: "var(--wt-primary-bg)", icon: "circle-info" },
  positive: { fg: "var(--wt-positive)", bg: "var(--green-95)", icon: "circle-check" },
  cautionary: { fg: "var(--wt-cautionary)", bg: "var(--orange-95)", icon: "triangle-exclamation" },
  negative: { fg: "var(--wt-negative)", bg: "var(--red-95)", icon: "circle-exclamation" },
};

export function Alert({ tone = "info", title, children, action, onAction, icon, style, ...rest }) {
  const t = TONES[tone] || TONES.info;
  return (
    <div
      role="status"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "14px 16px",
        borderRadius: 12,
        background: t.bg,
        fontFamily: "var(--font-sans)",
        boxSizing: "border-box",
        ...style,
      }}
      {...rest}
    >
      <span style={{ color: t.fg, display: "inline-flex", flexShrink: 0, marginTop: 1 }}>
        <Icon name={icon || t.icon} size={20} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title != null && (
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--wt-text)", marginBottom: children ? 2 : 0 }}>{title}</div>
        )}
        {children != null && (
          <div style={{ fontSize: 14, lineHeight: 1.5, color: "var(--wt-text-alt)" }}>{children}</div>
        )}
      </div>
      {action != null && (
        <button
          type="button"
          onClick={onAction}
          style={{
            flexShrink: 0,
            border: "none",
            background: "transparent",
            color: t.fg,
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            padding: "2px 4px",
          }}
        >
          {action}
        </button>
      )}
    </div>
  );
}

export default Alert;
