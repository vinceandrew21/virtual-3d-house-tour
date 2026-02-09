import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Virtual 3D House Tour | Immersive 360° Experience",
  description:
    "Explore beautiful living spaces in stunning 360° panoramic virtual tours. Navigate between rooms with interactive hotspots, view details, and immerse yourself in modern interior design.",
  keywords: ["virtual tour", "360 panorama", "3D house tour", "interior design", "WebGL"],
  openGraph: {
    title: "Virtual 3D House Tour",
    description: "Immersive 360° virtual house tour experience",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
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
