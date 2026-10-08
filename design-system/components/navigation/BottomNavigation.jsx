import React from "react";
import { Icon } from "../../assets/icons/Icon.jsx";

/**
 * Wanted BottomNavigation — mobile tab bar. Each item has an icon (outline when
 * inactive, filled when active) and a label; the active item is primary blue.
 * Pass items as { value, label, icon, activeIcon, badge }.
 */

export function BottomNavigation({ items = [], value, onChange, style }) {
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "stretch",
        height: 58,
        background: "var(--wt-bg-elevated)",
        borderTop: "1px solid var(--wt-border)",
        fontFamily: "var(--font-sans)",
        ...style,
      }}
    >
      {items.map((it) => {
        const active = (it.value ?? it.label) === value;
        const iconName = active ? it.activeIcon || it.icon : it.icon;
        return (
          <button
            key={it.value ?? it.label}
            onClick={() => onChange && onChange(it.value ?? it.label)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              border: "none",
              background: "transparent",
              color: active ? "var(--wt-primary)" : "var(--wt-text-assistive)",
              cursor: "pointer",
              position: "relative",
            }}
          >
            <span style={{ position: "relative", display: "inline-flex" }}>
              <Icon name={iconName} size={24} />
              {it.badge && (
                <span style={{ position: "absolute", top: -2, right: -4, width: 6, height: 6, borderRadius: "50%", background: "var(--wt-negative)" }} />
              )}
            </span>
            <span style={{ fontSize: 11, fontWeight: active ? 700 : 500 }}>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNavigation;
