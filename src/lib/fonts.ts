import { Inter as InterLoader, Geist as GeistLoader } from "next/font/google";

const Inter = InterLoader({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const Geist = GeistLoader({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export { Inter, Geist };
