import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  applicationName: "Mahato Net Cafe",
  title: {
    default: "Mahato Net Cafe, Baliapur Dhanbad | PAN, Aadhaar, Voter ID aur online seva",
    template: "%s | Mahato Net Cafe",
  },
  description:
    "Baliapur, Dhanbad ka cyber cafe. Ghar baithe PAN card, Voter ID, certificate aur online form ka kaam. Document upload karein, payment karein, receiving download karein.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi" className={roboto.variable}>
      <body className="min-h-dvh flex flex-col">{children}</body>
    </html>
  );
}
