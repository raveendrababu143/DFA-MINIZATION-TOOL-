import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { colors: { ink: "#0b1020", panel: "#121a31" }, boxShadow: { glow: "0 0 45px rgba(124,58,237,.18)" } } },
  plugins: []
};
export default config;