import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Virtual Tours Studio | Real Estate Photography & 3D Virtual Tours",
  description:
    "Professional real estate photography, photo editing, 360-degree photos, and immersive 3D virtual tours. Elevating property marketing through visual excellence.",
  keywords: [
    "real estate photography",
    "photo editing",
    "360 photos",
    "3D virtual tours",
    "property marketing",
    "virtual tour",
  ],
  openGraph: {
    title: "Virtual Tours Studio",
    description: "Professional real estate photography & 3D virtual tours",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable}`}>
        {children}
      </body>
    </html>
  );
}
