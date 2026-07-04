import type { Metadata } from "next";
import "./globals.css";

import "@/styles/bootstrap.min.css";
import "@/styles/common.css";
import "@/styles/main.css";
import "@/styles/responsive.css";

import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100","300","400","500","600","700","800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Buddy Script",
  description: "Social Feed App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        {children}
      </body>
    </html>
  );
}
