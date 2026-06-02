import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PO-Resi-Invoice Dashboard",
  description: "Purchase Order, Shipping Receipt, and Invoice Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
