import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Healthy Together — Systems that deliver outcomes for government",
  description:
    "Deploy faster, deliver the best experience for residents and workers, and grow with long-term ROI positive deployments.",
  openGraph: {
    title: "Healthy Together — Systems that deliver outcomes for government",
    description:
      "Deploy faster, deliver the best experience for residents and workers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
