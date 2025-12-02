import React from "react";

// Visual variants aligned to brand tokens and enterprise hierarchy
const variants = {
  gradient: "text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 hover:brightness-110 shadow-[0_10px_30px_rgba(99,102,241,0.25)]",
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  secondary: "bg-slate-900 text-white hover:bg-slate-800",
  outline: "border border-slate-300 text-slate-900 hover:bg-slate-100",
  quiet: "text-slate-700 hover:bg-slate-100",
  danger: "bg-rose-500 text-white hover:bg-rose-600",
  info: "bg-blue-600/90 text-white hover:bg-blue-600",
  link: "text-brand-700 hover:underline",
};

const sizes = {
  xs: "px-2.5 py-1.5 text-xs",
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  loading = false,
  fullWidth = false,
  type = "button",
  onClick,
  leftIcon = null,
  rightIcon = null,
  ariaLabel,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-tight transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const content = (
    <>
      {leftIcon && <span aria-hidden className="-ml-0.5 h-5 w-5 shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span aria-hidden className="-mr-0.5 h-5 w-5 shrink-0">{rightIcon}</span>}
    </>
  );

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" aria-hidden />
          <span>Processing…</span>
        </span>
      ) : (
        content
      )}
    </button>
  );
}
