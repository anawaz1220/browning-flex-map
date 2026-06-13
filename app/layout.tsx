import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Browning Flex Business Park | PeakFLX",
  description: "Interactive site map for Browning Flex Business Park – 6650 Browning Dr, North Richland Hills, TX. Shallow bay flex units available for sale and lease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
