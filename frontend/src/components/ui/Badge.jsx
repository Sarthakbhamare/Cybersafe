import React from "react";

const styles = {
  default: "bg-accent-50 text-accent-800 border-accent-200",
  outline: "bg-white text-slate-700 border-slate-200",
  primary: "bg-accent-500 text-slate-950 border-accent-500",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-rose-50 text-rose-700 border-rose-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function Badge({
  children,
  variant = "default",
  className = "",
}) {
  return (
    <span
      className={`inline-flex items-center px-grid-3 py-grid-1 rounded-full text-sm font-medium border tracking-tight ${
        styles[variant] || styles.default
      } ${className}`}
    >
      {children}
    </span>
  );
}
