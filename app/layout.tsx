import type { Metadata } from "next";
import "@arco-design/web-react/dist/css/arco.css";
import "@fontsource/dela-gothic-one/400.css";
import "@fontsource/nunito-sans/600.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "LongBridge — Sourcing from China",
  description:
    "Construction machinery and commercial vehicle sourcing, verification and export coordination from China.",
  other: { "codex-preview": "development" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
