import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Inter, Poppins } from "next/font/google";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "EarnXact Admin",
  description: "Admin dashboard for managing the EarnXact platform",
  icons: {
    icon: [{ url: "/images/earnxact-logo.png", type: "image/png" }],
    shortcut: [{ url: "/images/earnxact-logo.png", type: "image/png" }],
    apple: [{ url: "/images/earnxact-logo.png", type: "image/png" }]
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`min-h-screen ${poppins.variable} ${inter.variable}`}>
        {children}
      </body>
    </html>
  );
}
