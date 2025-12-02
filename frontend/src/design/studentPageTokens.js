/**
 * Design tokens for StudentPage
 * Following enterprise design system standards
 */

export const COLORS = {
  primary: {
    gradient: "from-indigo-600 via-blue-700 to-purple-800",
    solid: "indigo-600",
    hover: "indigo-700",
  },
  surface: {
    gradient: "from-white to-indigo-50/30",
    card: "from-white to-gray-50/50",
    elevated: "from-indigo-50 via-purple-50 to-pink-50",
  },
  accent: {
    success: "from-green-50 to-emerald-50",
    warning: "from-yellow-50 to-amber-50",
    danger: "from-red-50 to-orange-50",
  },
};

export const TYPOGRAPHY = {
  hero: {
    title: "text-[clamp(2.5rem,5vw,3.5rem)] font-bold leading-tight",
    subtitle: "text-lg text-white/90 leading-relaxed",
  },
  section: {
    title: "text-[clamp(1.75rem,3vw,2.25rem)] font-bold text-gray-900",
    subtitle: "text-gray-600 max-w-2xl mx-auto",
  },
  card: {
    title: "text-lg font-bold text-gray-900 leading-tight",
    body: "text-sm text-gray-600 leading-relaxed",
  },
};

export const SHADOWS = {
  card: "shadow-lg hover:shadow-xl",
  elevated: "shadow-xl",
  float: "shadow-[0_12px_32px_rgba(99,70,229,0.15)]",
  heavy: "shadow-[0_24px_60px_rgba(12,19,34,0.35)]",
};

export const BORDERS = {
  card: "border border-gray-200/60",
  elevated: "border border-indigo-200",
  subtle: "border border-white/20",
};

export const TRANSITIONS = {
  default: "transition-all duration-300",
  fast: "transition-all duration-200",
  slow: "transition-all duration-500",
  hover: "hover:-translate-y-1",
};

export const SPACING = {
  section: "py-16",
  card: "p-6",
  cardLg: "p-8",
  gap: "gap-6",
};

export const BADGE_VARIANTS = {
  destructive: "bg-red-100 text-red-800 border-red-200",
  default: "bg-blue-100 text-blue-800 border-blue-200",
  secondary: "bg-gray-100 text-gray-800 border-gray-200",
  success: "bg-green-100 text-green-800 border-green-200",
  warning: "bg-amber-100 text-amber-800 border-amber-200",
};

export const SURFACE_CLASSES = {
  card: `rounded-xl ${BORDERS.card} ${SHADOWS.card} ${TRANSITIONS.default} ${TRANSITIONS.hover} backdrop-blur-sm`,
  cardElevated: `rounded-3xl ${BORDERS.elevated} ${SHADOWS.heavy} backdrop-blur-2xl`,
  hero: "rounded-2xl shadow-2xl border backdrop-blur-sm",
};
