export const themeColors: {
  primary: { light: string; dark: string };
  background: { light: string; dark: string };
  surface: { light: string; dark: string };
  foreground: { light: string; dark: string };
  muted: { light: string; dark: string };
  border: { light: string; dark: string };
  success: { light: string; dark: string };
  warning: { light: string; dark: string };
  error: { light: string; dark: string };
  papa: { light: string; dark: string };
  papaBg: { light: string; dark: string };
  papaSurface: { light: string; dark: string };
  mama: { light: string; dark: string };
  mamaBg: { light: string; dark: string };
  mamaSurface: { light: string; dark: string };
};

declare const themeConfig: {
  themeColors: typeof themeColors;
};

export default themeConfig;
