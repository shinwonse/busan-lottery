"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Bukangi } from "@/components/Bukangi";
import { BallRow } from "@/components/Ball";
import { Card } from "@/components/ui";
import { formatDate, formatWon } from "@/lib/format";

/** [회차, 날짜, n1..n6, 보너스, 1등당첨자, 1등금액, 2등당첨자, 2등금액, ... 5등금액] */
export type HistoryRow = [number, string, ...number[]];

const PAGE = 20;
const RANK_LABEL = ["1등", "2등", "3등", "4등", "5등"];

function parse(r: HistoryRow) {
  return {
    round: r[0],
    date: r[1],
    numbers: r.slice(2, 8) as number[],
    bonus: r[8] as number,
    prizes: [0, 1, 2, 3, 4].map((i) => ({ winners: r[9 + i * 2] as number, amount: r[10 + i * 2] as number })),
  };
}

export function HistoryClient({ rows }: { rows: HistoryRow[] }) {
  const sp = useSearchParams();
  const initial = sp.get("round") ?? "";
  const [query, setQuery] = useState(initial);
  const [open, setOpen] = useState<number | null>(initial ? Number(initial) : null);
  const [limit, setLimit] = useState(PAGE);
  const latest = rows[rows.length - 1][0];

  const list = useMemo(() => {
    const q = query.trim();
    const all = [...rows].reverse();
    if (!q) return all;
    const n = Number(q);
    if (Number.isInteger(n) && n > 0) return all.filter((r) => r[0] === n);
    return all;
  }, [rows, query]);

  const shown = list.slice(0, limit);

  return (
    <main className="flex flex-col gap-4">
      <header className="flex items-end justify-between pt-2">
        <div>
          <h1 className="text-3xl font-black text-sea-900">역대 당첨번호</h1>
          <p className="mt-1 text-sm text-muted">1회 ~ {latest}회 · 누르면 등수별 당첨금이 보여요</p>
        </div>
        <Bukangi size={100} mood="happy" className="-mb-2" />
      </header>

      <Card className="p-3">
        <label className="flex items-center gap-2">
          <span className="shrink-0 text-base font-black text-sea-900">회차 찾기</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={latest}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(PAGE);
              setOpen(e.target.value ? Number(e.target.value) : null);
            }}
            placeholder={`1 ~ ${latest}`}
            className="w-full rounded-xl border-2 border-sea-200 bg-foam px-3 py-2 text-lg font-bold text-sea-900 outline-none focus:border-sea-700"
          />
          {query && (
            <button type="button" onClick={() => { setQuery(""); setOpen(null); }} className="shrink-0 rounded-xl bg-sea-100 px-3 py-2 font-bold text-sea-900">
              지우기
            </button>
          )}
        </label>
      </Card>

      {shown.length === 0 && (
        <Card className="text-center text-muted">
          <Bukangi size={100} mood="think" className="mx-auto" />
          그런 회차는 없어요. 1부터 {latest} 사이로 찾아 주세요.
        </Card>
      )}

      <ul className="space-y-3">
        {shown.map((r) => {
          const d = parse(r);
          const isOpen = open === d.round;
          return (
            <li key={d.round}>
              <Card className="p-4">
                <button type="button" className="w-full text-left" onClick={() => setOpen(isOpen ? null : d.round)} aria-expanded={isOpen}>
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="text-xl font-black text-sea-900">{d.round}회</span>
                    <span className="text-sm text-muted">{formatDate(d.date)}</span>
                  </div>
                  <BallRow numbers={d.numbers} bonus={d.bonus} animate={false} />
                  <p className="mt-2 text-sm font-bold text-sea-700">
                    1등 {d.prizes[0].winners}명 · {d.prizes[0].winners > 0 ? formatWon(d.prizes[0].amount) : "이월"}
                  </p>
                </button>
                {isOpen && (
                  <table className="mt-3 w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted">
                        <th className="py-1 font-normal">등수</th>
                        <th className="py-1 font-normal">당첨자</th>
                        <th className="py-1 text-right font-normal">1인당 당첨금</th>
                      </tr>
                    </thead>
                    <tbody>
                      {d.prizes.map((p, i) => (
                        <tr key={i} className="border-t border-sea-100">
                          <td className="py-1.5 font-black text-sea-900">{RANK_LABEL[i]}</td>
                          <td className="py-1.5">{p.winners.toLocaleString()}명</td>
                          <td className="py-1.5 text-right font-bold">{p.amount > 0 ? formatWon(p.amount) : "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card>
            </li>
          );
        })}
      </ul>

      {shown.length < list.length && (
        <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="card w-full py-4 text-lg font-black text-sea-900">
          더 보기 ({list.length - shown.length}회 남음)
        </button>
      )}
    </main>
  );
}
