import tokens, {
  spacingScale,
  fontSizeScale,
  accentPalette,
  fontFamilyStack,
} from "../design/tokens.js";

export type SpacingToken = keyof typeof spacingScale;
export type FontSizeToken = keyof typeof fontSizeScale;
export type AccentSwatch = keyof typeof accentPalette;

export const spacing = spacingScale;
export const typeScale = fontSizeScale;
export const accent = accentPalette;
export const fontFamily = fontFamilyStack;
export const designTokens = tokens;

/**
 * Returns a spacing value that adheres to the 4 / 8 / 12pt grid.
 */
export const gridUnit = (steps = 1): string => {
  const normalized = Math.max(0, steps);
  return `${normalized * 0.25}rem`;
};
