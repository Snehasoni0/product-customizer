import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "3D Product Customizer",
  description: "A premium 3D product customization platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Script 
          type="module" 
          src="/model-viewer.min.js"
          strategy="lazyOnload"
        />
        {children}
      </body>
    </html>
  );
}
