"use client";

import { useMemo, useState } from "react";
import { Bukangi } from "@/components/Bukangi";
import { Ball, BallRow } from "@/components/Ball";
import { Card, SectionTitle } from "@/components/ui";
import { NUMBERS, rankOf } from "@/lib/analysis";
import { fromCompact } from "@/lib/draws";
import { ballColor, formatShortDate } from "@/lib/format";
import type { CompactDraw } from "@/lib/types";

export function CheckClient({ past }: { past: CompactDraw[] }) {
  const [sel, setSel] = useState<number[]>([]);
  const [checked, setChecked] = useState<number[] | null>(null);
  const latest = past[past.length - 1];

  function toggle(n: number) {
    setChecked(null);
    setSel((s) => (s.includes(n) ? s.filter((x) => x !== n) : s.length < 6 ? [...s, n].sort((a, b) => a - b) : s));
  }

  function auto() {
    const pool = [...NUMBERS];
    const out: number[] = [];
    while (out.length < 6) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    setSel(out.sort((a, b) => a - b));
    setChecked(null);
  }

  const result = useMemo(() => {
    if (!checked) return null;
    const counts = [0, 0, 0, 0, 0, 0];
    const hits: { round: number; date: string; numbers: number[]; bonus: number; rank: number }[] = [];
    for (const c of past) {
      const d = fromCompact(c);
      const r = rankOf(checked, d.numbers, d.bonus);
      if (r) {
        counts[r]++;
        if (r <= 4) hits.push({ ...d, rank: r });
      }
    }
    hits.sort((a, b) => a.rank - b.rank || b.round - a.round);
    const latestD = fromCompact(latest);
    return { counts, hits, latestRank: rankOf(checked, latestD.numbers, latestD.bonus), latestD };
  }, [checked, past, latest]);

  const mood = !result ? "think" : result.counts[1] > 0 ? "wow" : result.counts[2] + result.counts[3] > 0 ? "happy" : "sleep";

  return (
    <main className="flex flex-col gap-4">
      <header className="flex items-end justify-between pt-2">
        <div>
          <h1 className="text-3xl font-black text-sea-900">내 번호 확인</h1>
          <p className="mt-1 text-sm text-muted">이 번호로 샀다면 역대 몇 등 했을까?</p>
        </div>
        <Bukangi size={100} mood={mood} className="-mb-2" />
      </header>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <SectionTitle sub={`${sel.length}/6개 선택`}>번호 6개를 골라 주세요</SectionTitle>
          <button type="button" onClick={auto} className="rounded-xl bg-sea-100 px-3 py-2 text-sm font-black text-sea-900">
            자동
          </button>
        </div>
        <div className="mb-3 min-h-11">
          {sel.length > 0 ? <BallRow numbers={sel} animate={false} /> : <p className="text-sm text-muted">아직 고른 번호가 없어요.</p>}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {NUMBERS.map((n) => {
            const on = sel.includes(n);
            return (
              <button
                key={n}
                type="button"
                onClick={() => toggle(n)}
                aria-pressed={on}
                className={`h-11 rounded-full text-lg font-black transition ${on ? `ball ball-${ballColor(n)}` : "bg-sea-50 text-sea-900 border border-sea-200"}`}
              >
                {n}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={() => { setSel([]); setChecked(null); }} className="rounded-2xl border-2 border-sea-200 px-4 py-3 font-black text-sea-900">
            지우기
          </button>
          <button
            type="button"
            disabled={sel.length !== 6}
            onClick={() => setChecked(sel)}
            className="flex-1 rounded-2xl bg-sea-700 py-3 text-xl font-black text-white shadow-lg disabled:opacity-40"
          >
            역대 결과 확인
          </button>
        </div>
      </Card>

      {result && (
        <>
          <Card className="border-2 border-sea-300">
            <SectionTitle sub={`${past.length.toLocaleString()}회 전체 대조`}>결과</SectionTitle>
            <div className="grid grid-cols-5 gap-1.5 text-center">
              {[1, 2, 3, 4, 5].map((r) => (
                <div key={r} className={`rounded-xl p-2 ${result.counts[r] > 0 && r <= 3 ? "bg-coral text-white" : "bg-sea-50 text-sea-900"}`}>
                  <div className="text-xs opacity-80">{r}등</div>
                  <div className="text-xl font-black">{result.counts[r]}</div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-sea-900">
              지난 {latest[0]}회에서는 <b>{result.latestRank ? `${result.latestRank}등` : "낙첨"}</b>
              {result.latestRank ? "이었어요! 🎉" : "이었어요."}
            </p>
            {result.counts[1] > 0 && <p className="mt-1 text-base font-black text-coral">세상에, 이 조합이 1등이었던 적이 있어요!</p>}
          </Card>

          {result.hits.length > 0 && (
            <Card>
              <SectionTitle sub="4등(4개 일치) 이상만 표시">맞았던 회차</SectionTitle>
              <ul className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
                {result.hits.map((h) => (
                  <li key={h.round} className="rounded-xl bg-sea-50 px-3 py-2">
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-black text-sea-900">
                        {h.round}회 <span className="font-normal text-muted">{formatShortDate(h.date)}</span>
                      </span>
                      <span className="font-black text-coral">{h.rank}등</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1">
                      {h.numbers.map((m) => (
                        <span key={m} className={checked!.includes(m) ? "" : "opacity-35"}>
                          <Ball n={m} size="sm" />
                        </span>
                      ))}
                      <span className="mx-0.5 text-sm font-black text-sea-700">+</span>
                      <span className={checked!.includes(h.bonus) ? "" : "opacity-35"}>
                        <Ball n={h.bonus} size="sm" bonus />
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}

    </main>
  );
}
