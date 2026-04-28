import type { Metadata } from "next";
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
      <head>
        <script 
          type="module" 
          src="/model-viewer.min.js"
        ></script>
      </head>
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
