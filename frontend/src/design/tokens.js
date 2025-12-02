export const spacingScale = {
  0: "0px",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  14: "3.5rem",
  16: "4rem",
  18: "4.5rem",
  20: "5rem",
  24: "6rem",
  28: "7rem",
  32: "8rem",
  36: "9rem",
  40: "10rem",
  48: "12rem",
  56: "14rem",
  64: "16rem",
  "grid-1": "0.25rem",
  "grid-2": "0.5rem",
  "grid-3": "0.75rem",
  "grid-4": "1rem",
  "grid-5": "1.25rem",
  "grid-6": "1.5rem",
  "grid-8": "2rem",
  "grid-10": "2.5rem",
  "grid-12": "3rem",
  "grid-16": "4rem",
  "grid-20": "5rem",
  "grid-24": "6rem",
};

export const fontSizeScale = {
  xs: ["0.75rem", { lineHeight: "1.25rem", letterSpacing: "0" }],
  sm: ["0.875rem", { lineHeight: "1.4rem", letterSpacing: "0" }],
  base: ["1rem", { lineHeight: "1.6rem", letterSpacing: "0" }],
  lg: ["1.125rem", { lineHeight: "1.7rem", letterSpacing: "-0.01em" }],
  xl: ["1.25rem", { lineHeight: "1.8rem", letterSpacing: "-0.015em" }],
  "2xl": ["1.5rem", { lineHeight: "1.95rem", letterSpacing: "-0.02em" }],
  "3xl": ["1.875rem", { lineHeight: "2.2rem", letterSpacing: "-0.025em" }],
  "4xl": ["2.25rem", { lineHeight: "2.4rem", letterSpacing: "-0.03em" }],
  "5xl": ["3rem", { lineHeight: "1", letterSpacing: "-0.04em" }],
};

export const accentPalette = {
  25: "#ECFEFF",
  50: "#CFF9FE",
  100: "#A3ECF8",
  200: "#6ED7F0",
  300: "#3CC0E4",
  400: "#15A8D5",
  500: "#0090BF",
  600: "#007AA8",
  700: "#00648D",
  800: "#004D6F",
  900: "#013750",
};

export const fontFamilyStack = {
  sans: ["'Inter Variable'", "'Inter'", "'SF Pro Text'", "system-ui", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "sans-serif"],
  mono: ["'IBM Plex Mono'", "'SFMono-Regular'", "ui-monospace", "Menlo", "monospace"],
};

export const tokens = Object.freeze({
  spacing: spacingScale,
  fontSize: fontSizeScale,
  colors: {
    accent: accentPalette,
  },
  fontFamily: fontFamilyStack,
});

export default tokens;
