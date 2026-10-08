import React from "react";
import { Icon } from "../../assets/icons/Icon.jsx";

/**
 * Wanted TextField — labelled text input with optional leading/trailing icon,
 * helper text and error state. Focus draws a primary-blue ring; error draws red.
 */

const SIZES = { large: 48, medium: 40 };

export function TextField({
  label,
  value,
  placeholder,
  helper,
  error,
  size = "large",
  leadingIcon,
  trailingIcon,
  disabled = false,
  type = "text",
  onChange,
  style,
  inputStyle,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const h = SIZES[size] || SIZES.large;
  const borderColor = error
    ? "var(--wt-negative)"
    : focus
    ? "var(--wt-primary)"
    : "var(--wt-border-solid)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, fontFamily: "var(--font-sans)", ...style }}>
      {label != null && (
        <label style={{ fontSize: 14, fontWeight: 600, color: "var(--wt-text)" }}>{label}</label>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          height: h,
          padding: "0 14px",
          borderRadius: 12,
          boxSizing: "border-box",
          background: disabled ? "var(--wt-bg-alt)" : "var(--wt-static-white)",
          border: `1.5px solid ${borderColor}`,
          transition: "border-color var(--duration-fast) var(--ease-standard)",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {leadingIcon && (
          <span style={{ color: "var(--wt-text-assistive)", display: "inline-flex" }}><Icon name={leadingIcon} size={20} /></span>
        )}
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={onChange}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            flex: 1,
            minWidth: 0,
            border: "none",
            outline: "none",
            background: "transparent",
            fontFamily: "var(--font-sans)",
            fontSize: 15,
            color: "var(--wt-text)",
            ...inputStyle,
          }}
          {...rest}
        />
        {trailingIcon && (
          <span style={{ color: "var(--wt-text-assistive)", display: "inline-flex" }}><Icon name={trailingIcon} size={20} /></span>
        )}
      </div>
      {(error || helper) != null && (
        <span style={{ fontSize: 13, color: error ? "var(--wt-negative)" : "var(--wt-text-assistive)" }}>
          {error || helper}
        </span>
      )}
    </div>
  );
}

export default TextField;
