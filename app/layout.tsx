import "./globals.css";
import type { ReactNode } from "react";

export const metadata = { title: "릴스 분석 대시보드" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-neutral-50 text-neutral-900">{children}</body>
    </html>
  );
}
