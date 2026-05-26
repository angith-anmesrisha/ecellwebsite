import type { Metadata } from "next";
import "./globals.css"; 

export const metadata: Metadata = {
  title: "BIMTECH E-Cell",
  description: "Where Aspiration Meets Opportunity",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}