"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Ball } from "./Ball";
import { Bukangi } from "./Bukangi";
import { rng } from "@/lib/generator";

export const DRAW_DURATION_MS = 3000;

const MESSAGES = ["부캉이가 바다 속으로 들어갑니다", "공들이 둥둥 떠다니네요", "부캉이가 번호를 고르는 중", "앗, 물었다!"];

/** 뽑기 연출 오버레이. 지정 시간이 지나면 onDone을 부른다. */
export function DrawOverlay({ seed, onDone }: { seed: number; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [closing, setClosing] = useState(false);

  const balls = useMemo(() => {
    const rand = rng(seed);
    const picked = new Set<number>();
    while (picked.size < 14) picked.add(1 + Math.floor(rand() * 45));
    return [...picked].map((n, i) => ({
      n,
      left: 8 + ((i * 37) % 78),
      top: 10 + ((i * 53) % 70),
      dur: 1.6 + ((i * 7) % 9) / 10,
      delay: -((i * 13) % 17) / 10,
      dx: [((i * 17) % 50) - 25, ((i * 29) % 60) - 30, ((i * 11) % 40) - 20],
      dy: [((i * 23) % 50) - 25, ((i * 31) % 60) - 30, ((i * 19) % 40) - 20],
    }));
  }, [seed]);

  useEffect(() => {
    const perStep = DRAW_DURATION_MS / MESSAGES.length;
    const timers = MESSAGES.map((_, i) => setTimeout(() => setStep(i), i * perStep));
    const close = setTimeout(() => setClosing(true), DRAW_DURATION_MS - 350);
    const done = setTimeout(onDone, DRAW_DURATION_MS);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      [...timers, close, done].forEach(clearTimeout);
      document.body.style.overflow = prevOverflow;
    };
  }, [onDone]);

  const biting = step >= MESSAGES.length - 1;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      aria-label="부캉이가 번호를 뽑는 중"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-sea-700 via-sea-900 to-deep px-6 ${closing ? "overlay-out" : "overlay-in"}`}
    >
      {/* 추첨기(유리 어항) */}
      <div className="relative h-72 w-72 max-w-[80vw] overflow-hidden rounded-full border-4 border-white/40 bg-white/10 shadow-[inset_0_-30px_60px_rgba(255,255,255,0.08),0_0_60px_rgba(127,207,246,0.35)]">
        <div className="absolute left-8 top-6 h-10 w-20 -rotate-12 rounded-full bg-white/25 blur-sm" aria-hidden />
        {balls.map((b) => (
          <div
            key={b.n}
            className={`tumble-ball ${biting ? "animate-chomp" : ""}`}
            style={
              {
                left: `${b.left}%`,
                top: `${b.top}%`,
                "--dur": `${b.dur}s`,
                animationDelay: `${b.delay}s`,
                "--dx1": `${b.dx[0]}px`,
                "--dy1": `${b.dy[0]}px`,
                "--dx2": `${b.dx[1]}px`,
                "--dy2": `${b.dy[1]}px`,
                "--dx3": `${b.dx[2]}px`,
                "--dy3": `${b.dy[2]}px`,
              } as React.CSSProperties
            }
          >
            <Ball n={b.n} size="sm" delay={0} />
          </div>
        ))}

        {/* 헤엄쳐 들어오는 부캉이 */}
        <div className="animate-swim absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center">
          <div className="animate-wag">
            <Bukangi size={170} mood={biting ? "wow" : "happy"} />
          </div>
        </div>
      </div>

      <p className="dots mt-8 text-center text-xl font-black text-white drop-shadow">{MESSAGES[step]}</p>
      <p className="mt-2 text-sm text-sea-200">잠시만 기다려 주세요</p>
    </div>,
    document.body,
  );
}
