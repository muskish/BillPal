import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "BillPal | Cash-Flow Autopilot for Solo Businesses",
  description: "Predictive cash flow and PayPal payment milestone autopilot for solo service businesses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col selection:bg-sky-300 selection:text-sky-900">
        <Navbar />
        <div className="flex-1 relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
