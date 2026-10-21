import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { latestDraw } from "@/lib/draws";

export const alt = "부캉이 로또: 로또 6/45 역대 당첨번호 분석과 이번 주 추천";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BALL: Record<string, string> = { yellow: "#fbc400", blue: "#69c8f2", red: "#ff7272", gray: "#aaaaaa", green: "#b0d840" };
const colorOf = (n: number) => (n <= 10 ? BALL.yellow : n <= 20 ? BALL.blue : n <= 30 ? BALL.red : n <= 40 ? BALL.gray : BALL.green);

function Shark() {
  return (
    <svg width="360" height="260" viewBox="0 0 200 144">
      <path d="M26 72 L2 46 L10 74 L2 100 Z" fill="#5f8fb0" />
      <path d="M88 44 L104 12 L116 46 Z" fill="#5f8fb0" />
      <ellipse cx="104" cy="82" rx="78" ry="44" fill="#6f9fc0" />
      <path d="M46 94 q60 40 128 6 q-30 32 -78 30 q-36 -4 -50 -36 Z" fill="#f4f9fc" />
      <path d="M92 110 L76 136 L110 122 Z" fill="#5f8fb0" />
      <circle cx="142" cy="96" r="6" fill="#ffb3a7" />
      <circle cx="126" cy="78" r="11" fill="#fff" />
      <circle cx="128" cy="79" r="6" fill="#0b3d5c" />
      <circle cx="130" cy="76" r="2.2" fill="#fff" />
      <path d="M108 100 q16 16 34 0" stroke="#0b3d5c" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default async function Image() {
  const font = await readFile(join(process.cwd(), "src/app/_fonts/NotoSansKR-Black-subset.woff"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(180deg, #e6f6ff 0%, #a9def7 55%, #1e9bd7 100%)",
          fontFamily: "Noto Sans KR",
          color: "#0b3d5c",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 34, color: "#0f6ea3" }}>부산 북항에서 온</div>
            <div style={{ fontSize: 112, lineHeight: 1.05, letterSpacing: -2 }}>부캉이 로또</div>
            <div style={{ fontSize: 38, color: "#0f6ea3", marginTop: 12 }}>역대 번호 분석 · 이번 주 추천</div>
          </div>
          <Shark />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            background: "rgba(255,255,255,0.85)",
            borderRadius: 32,
            padding: "26px 36px",
          }}
        >
          <div style={{ fontSize: 40, marginRight: 12 }}>{`${latestDraw.round}회`}</div>
          {latestDraw.numbers.map((n) => (
            <div
              key={n}
              style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                background: colorOf(n),
                color: "#fff",
                fontSize: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "inset -4px -6px 8px rgba(0,0,0,0.18), 0 4px 8px rgba(11,61,92,0.2)",
              }}
            >
              {n}
            </div>
          ))}
          <div style={{ fontSize: 40, margin: "0 4px" }}>+</div>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              background: colorOf(latestDraw.bonus),
              color: "#fff",
              fontSize: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "5px dashed #0f6ea3",
            }}
          >
            {latestDraw.bonus}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Noto Sans KR", data: font, weight: 900, style: "normal" }] },
  );
}
