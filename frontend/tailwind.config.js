import { spacingScale, fontSizeScale, accentPalette, fontFamilyStack } from "./src/design/tokens.js";

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      spacing: spacingScale,
      fontSize: fontSizeScale,
      colors: {
        accent: accentPalette,
        brand: accentPalette,
      },
      fontFamily: fontFamilyStack,
    },
  },
  plugins: [],
};
