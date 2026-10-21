"use client";

import { useState } from "react";
import { Bukangi, type BukangiMood } from "@/components/Bukangi";
import { BallRow } from "@/components/Ball";
import { Card, Disclaimer, SectionTitle } from "@/components/ui";
import type { NumberStat } from "@/lib/analysis";
import { formatDate } from "@/lib/format";
import { generateSet, STRATEGIES, type Pick, type Strategy } from "@/lib/generator";
import type { CompactDraw } from "@/lib/types";

const MOOD: Record<Strategy, BukangiMood> = { bukangi: "happy", hot: "wow", cold: "sleep", balanced: "think", random: "wow" };

export function PickClient({ stats, past, next }: { stats: NumberStat[]; past: CompactDraw[]; next: { round: number; date: string } }) {
  const [strategy, setStrategy] = useState<Strategy>("bukangi");
  const [games, setGames] = useState<1 | 5>(5);
  const [picks, setPicks] = useState<Pick[] | null>(null);
  const [runId, setRunId] = useState(0);
  const [copied, setCopied] = useState(false);

  const current = STRATEGIES.find((s) => s.id === strategy)!;

  function draw() {
    const seed = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
    setPicks(generateSet(strategy, stats, past, seed, games));
    setRunId((r) => r + 1);
    setCopied(false);
  }

  async function copy() {
    if (!picks) return;
    const text = picks.map((p, i) => `${String.fromCharCode(65 + i)}  ${p.numbers.map((n) => String(n).padStart(2, " ")).join(" ")}`).join("\n");
    try {
      await navigator.clipboard.writeText(`${next.round}회 부캉이 추천\n${text}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="flex flex-col gap-4">
      <header className="flex items-end justify-between pt-2">
        <div>
          <h1 className="text-3xl font-black text-sea-900">번호 뽑기</h1>
          <p className="mt-1 text-sm text-muted">
            {next.round}회 · {formatDate(next.date)} 추첨
          </p>
        </div>
        <Bukangi size={110} mood={picks ? MOOD[strategy] : "think"} className="animate-float -mb-2" />
      </header>

      <Card>
        <SectionTitle>어떻게 뽑을까요?</SectionTitle>
        <div className="grid grid-cols-1 gap-2">
          {STRATEGIES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStrategy(s.id)}
              aria-pressed={strategy === s.id}
              className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition ${
                strategy === s.id ? "border-sea-700 bg-sea-100" : "border-sea-200 bg-foam"
              }`}
            >
              <span className="text-3xl" aria-hidden>
                {s.emoji}
              </span>
              <span>
                <span className="block text-lg font-black text-sea-900">{s.name}</span>
                <span className="block text-sm text-muted">{s.desc}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-base font-black text-sea-900">몇 게임 뽑을까요?</span>
            <div className="flex rounded-xl bg-sea-100 p-1" role="group" aria-label="게임 수">
              {([1, 5] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGames(g)}
                  aria-pressed={games === g}
                  className={`rounded-lg px-4 py-2 text-base font-black ${games === g ? "bg-sea-700 text-white" : "text-sea-900"}`}
                >
                  {g}게임
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={draw}
            className="w-full rounded-2xl bg-coral py-4 text-xl font-black text-white shadow-lg active:scale-[0.98]"
          >
            {picks ? "🦈 다시 뽑기" : "🦈 부캉이야, 뽑아줘!"}
          </button>
        </div>
      </Card>

      {picks && (
        <Card key={runId} className="border-2 border-sea-300">
          <SectionTitle sub={current.desc}>
            {current.emoji} {current.name} 결과
          </SectionTitle>
          <ol className="space-y-4">
            {picks.map((p, i) => (
              <li key={i} className="rounded-2xl bg-sea-50 p-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 shrink-0 text-xl font-black text-sea-700">{String.fromCharCode(65 + i)}</span>
                  <div className="min-w-0 flex-1">
                    <BallRow numbers={p.numbers} />
                  </div>
                </div>
                <details className="mt-2 text-sm text-muted">
                  <summary className="cursor-pointer font-bold text-sea-700">왜 이 번호?</summary>
                  <ul className="mt-1 space-y-0.5 pl-2">
                    {p.reasons.map((r) => (
                      <li key={r}>· {r}</li>
                    ))}
                  </ul>
                </details>
              </li>
            ))}
          </ol>
          <button type="button" onClick={copy} className="mt-4 w-full rounded-2xl border-2 border-sea-700 py-3 text-lg font-black text-sea-900">
            {copied ? "복사했어요 ✓" : "번호 복사하기"}
          </button>
        </Card>
      )}

      <Disclaimer />
    </main>
  );
}
