import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Newborn Night Shift Copilot",
  description:
    "A caregiver-support PWA for logging overnight feeds, diapers, sleep, and soothing — and creating a clear handoff.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b1020",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-night-bg text-night-text">{children}</body>
    </html>
  );
}
