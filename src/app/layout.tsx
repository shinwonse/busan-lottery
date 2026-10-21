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

const SITE_URL = "https://busan-lottery.vercel.app";
const DESCRIPTION = "부산 북항 상어 부캉이와 함께 보는 로또 6/45 역대 당첨번호 분석과 이번 주 추천 번호";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "부캉이 로또", template: "%s | 부캉이 로또" },
  description: DESCRIPTION,
  applicationName: "부캉이 로또",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: "부캉이 로또",
    title: "부캉이 로또",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "부캉이 로또",
    description: DESCRIPTION,
  },
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
        <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-28 pt-4">
          <div className="flex-1">{children}</div>
          <footer className="mt-10 text-center text-sm text-muted">
            Developed by{" "}
            <a href="https://github.com/shinwonse" target="_blank" rel="noopener noreferrer" className="font-bold text-sea-700 underline underline-offset-4">
              @wonse
            </a>
          </footer>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
