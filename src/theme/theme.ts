import { darkTheme } from "./darkTheme";
import { lightTheme } from "./lightTheme";
import type { ThemeMode } from "@/types";

export { lightColors, darkColors } from "./colors";
export { typography } from "./typography";
export { spacing, radii } from "./spacing";
export { lightTheme } from "./lightTheme";
export { darkTheme } from "./darkTheme";

export function getTheme(mode: ThemeMode) {
  return mode === "dark" ? darkTheme : lightTheme;
}
