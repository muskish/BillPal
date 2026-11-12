import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CashPilot | Cash-Flow Autopilot for Solo Businesses",
  description: "Predictive cash flow and PayPal payment milestone autopilot for solo service businesses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

