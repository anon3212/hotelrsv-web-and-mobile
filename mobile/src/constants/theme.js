import Constants from "expo-constants";

export const COLORS = {
  background: "#121B22", // Modern Deep Teal/Slate
  card: "#1C2730",
  primary: "#004D40", // Deep Teal
  accent: "#00C853", // Modern Green
  text: "#FFFFFF",
  textSecondary: "#888",
};

const expoExtra =
  Constants.expoConfig?.extra || Constants.manifest?.extra || {};
const DEFAULT_BASE_URL =
  "http://https://hotelrsv-web-and-mobile-tl3x.onrender.com/";

export const BASE_URL = expoExtra.API_URL ?? DEFAULT_BASE_URL;
export const APP_ENV = expoExtra.APP_ENV ?? "development";
