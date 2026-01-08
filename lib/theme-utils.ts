import { type Parent } from "./app-context";

export interface ParentColors {
  bg: string;
  primary: string;
  surface: string;
  border: string;
  accent: string;
}

/**
 * 保護者に応じたテーマカラーを取得
 */
export const getParentColors = (parent: Parent | null): ParentColors => {
  if (parent === "papa") {
    return {
      bg: "#E3F2FD",
      primary: "#90CAF9",
      surface: "#BBDEFB",
      border: "#64B5F6",
      accent: "#1976D2",
    };
  }
  return {
    bg: "#FCE4EC",
    primary: "#F48FB1",
    surface: "#F8BBD9",
    border: "#F06292",
    accent: "#C2185B",
  };
};
