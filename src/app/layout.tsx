import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { OceanBackground } from "@/components/OceanBackground";

const notoKr = Noto_Sans_KR({
  variable: "--font-noto-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: { default: "부캉이 로또", template: "%s | 부캉이 로또" },
  description: "부산 북항 상어 부캉이와 함께 보는 로또 6/45 역대 당첨번호 분석과 이번 주 추천 번호",
  applicationName: "부캉이 로또",
};

export const viewport: Viewport = {
  themeColor: "#c7ebfb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${notoKr.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <OceanBackground />
        <div className="relative z-10 mx-auto w-full max-w-md flex-1 px-4 pb-28 pt-4">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}
