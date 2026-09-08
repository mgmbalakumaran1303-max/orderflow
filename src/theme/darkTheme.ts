import { darkColors } from "./colors";
import { radii, spacing } from "./spacing";
import { typography } from "./typography";

export const darkTheme = {
  name: "dark" as const,
  colors: darkColors,
  typography,
  spacing,
  radii,
  shadow: "0 8px 24px rgba(0, 0, 0, 0.28)",
};
