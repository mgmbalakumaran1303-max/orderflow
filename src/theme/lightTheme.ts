import { lightColors } from "./colors";
import { radii, spacing } from "./spacing";
import { typography } from "./typography";

export const lightTheme = {
  name: "light" as const,
  colors: lightColors,
  typography,
  spacing,
  radii,
  shadow: "0 8px 24px rgba(23, 32, 51, 0.06)",
};
