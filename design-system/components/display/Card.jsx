import React from "react";

/**
 * Wanted Card — a surface container. Elevated (soft shadow) or outlined
 * (hairline border). Optional interactive hover-lift for clickable cards.
 */

export function Card({ variant = "elevated", interactive = false, padding = 20, radius = 16, onClick, children, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const base =
    variant === "outlined"
      ? { background: "var(--wt-bg-elevated)", border: "1px solid var(--wt-border)", boxShadow: "none" }
      : { background: "var(--wt-bg-elevated)", border: "1px solid transparent", boxShadow: "var(--elevation-normal)" };
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => interactive && setHover(true)}
      onMouseLeave={() => interactive && setHover(false)}
      style={{
        boxSizing: "border-box",
        borderRadius: radius,
        padding,
        transition: "box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard)",
        cursor: interactive ? "pointer" : "default",
        ...base,
        ...(interactive && hover
          ? { boxShadow: "var(--elevation-strong)", transform: "translateY(-2px)" }
          : {}),
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Card;
