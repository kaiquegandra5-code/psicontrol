import { Inter as InterLoader } from "next/font/google";
import { GeistSans } from "geist/font/sans";

const Inter = InterLoader({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// GeistSans uses variable "--font-geist-sans" (from geist package)
export const Geist = GeistSans;
export { Inter };
