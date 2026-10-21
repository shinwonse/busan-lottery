import type { Metadata } from "next";
import Link from "next/link";
import { Bukangi } from "@/components/Bukangi";
import { Ball, BallRow } from "@/components/Ball";
import { Bar, Card, SectionTitle } from "@/components/ui";
import {
  biggestJackpots,
  coldNumbers,
  colorBandDistribution,
  consecutiveDistribution,
  firstPrizeTypeTotals,
  highCountDistribution,
  hotNumbers,
  lastDigitDistribution,
  leastFrequent,
  mostFrequent,
  numberStats,
  oddCountDistribution,
  sumBuckets,
  sumStats,
  topPairs,
} from "@/lib/analysis";
import { draws, latestRound } from "@/lib/draws";
import { ballColor, formatWon } from "@/lib/format";

export const metadata: Metadata = { title: "통계" };

const BAND_LABEL = ["1~10", "11~20", "21~30", "31~40", "41~45"];
const BAND_COLOR = ["var(--ball-yellow)", "var(--ball-blue)", "var(--ball-red)", "var(--ball-gray)", "var(--ball-green)"];

export default function StatsPage() {
  const stats = numberStats(draws);
  const maxCount = Math.max(...stats.map((s) => s.count));
  const minCount = Math.min(...stats.map((s) => s.count));
  const odd = oddCountDistribution(draws);
  const high = highCountDistribution(draws);
  const sums = sumBuckets(draws);
  const sumS = sumStats(draws);
  const consec = consecutiveDistribution(draws);
  const digits = lastDigitDistribution(draws);
  const bands = colorBandDistribution(draws);
  const pairs = topPairs(draws, 8);
  const types = firstPrizeTypeTotals(draws);
  const jackpots = biggestJackpots(draws, 3);
  const pct = (n: number, total = draws.length) => `${((n / total) * 100).toFixed(1)}%`;

  return (
    <main className="flex flex-col gap-4">
      <header className="flex items-end justify-between pt-2">
        <div>
          <h1 className="text-3xl font-black text-sea-900">역대 통계</h1>
          <p className="mt-1 text-sm text-muted">1회 ~ {latestRound}회 · 총 {draws.length.toLocaleString()}회 추첨</p>
        </div>
        <Bukangi size={100} mood="think" className="-mb-2" />
      </header>

      <Card>
        <SectionTitle sub="진한 막대일수록 많이 나왔어요. 번호를 누르면 자세히 볼 수 있어요.">번호별 출현 횟수</SectionTitle>
        <ul className="grid grid-cols-5 gap-1.5">
          {stats.map((s) => {
            const t = (s.count - minCount) / Math.max(1, maxCount - minCount);
            return (
              <li key={s.n}>
                <Link
                  href={`/stats/${s.n}`}
                  className="flex flex-col items-center rounded-xl py-1.5 text-sea-900"
                  style={{ background: `color-mix(in srgb, var(--ball-${ballColor(s.n)}) ${Math.round(20 + t * 80)}%, white)` }}
                >
                  <span className="text-xl font-black">{s.n}</span>
                  <span className="text-xs font-bold">{s.count}회</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>

      <div className="grid grid-cols-1 gap-3">
        <Card>
          <SectionTitle sub="전체 기간 기준">가장 많이 나온 번호</SectionTitle>
          <BallRow numbers={mostFrequent(stats).map((s) => s.n)} animate={false} />
          <p className="mt-2 text-sm text-muted">{mostFrequent(stats).map((s) => `${s.n}번 ${s.count}회`).join(" · ")}</p>
        </Card>
        <Card>
          <SectionTitle sub="전체 기간 기준">가장 적게 나온 번호</SectionTitle>
          <BallRow numbers={leastFrequent(stats).map((s) => s.n)} animate={false} />
          <p className="mt-2 text-sm text-muted">{leastFrequent(stats).map((s) => `${s.n}번 ${s.count}회`).join(" · ")}</p>
        </Card>
        <Card>
          <SectionTitle sub="최근 20회에서 자주 나온 번호">🔥 핫 번호</SectionTitle>
          <BallRow numbers={hotNumbers(stats).map((s) => s.n)} animate={false} />
          <p className="mt-2 text-sm text-muted">{hotNumbers(stats).map((s) => `${s.n}번 ${s.recentCount}회`).join(" · ")}</p>
        </Card>
        <Card>
          <SectionTitle sub="마지막으로 나온 지 가장 오래된 번호">🧊 콜드 번호</SectionTitle>
          <BallRow numbers={coldNumbers(stats).map((s) => s.n)} animate={false} />
          <p className="mt-2 text-sm text-muted">{coldNumbers(stats).map((s) => `${s.n}번 ${s.gap}회째 안 나옴`).join(" · ")}</p>
        </Card>
      </div>

      <Card>
        <SectionTitle sub="당첨번호 6개 중 홀수가 몇 개였나">홀짝 비율</SectionTitle>
        <ul className="space-y-1.5">
          {odd.map((c, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span className="w-24 shrink-0 font-bold text-sea-900">홀{i} : 짝{6 - i}</span>
              <Bar value={c} max={Math.max(...odd)} label={`${c}회 (${pct(c)})`} />
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <SectionTitle sub="고번호(23~45)가 몇 개였나">고저 비율</SectionTitle>
        <ul className="space-y-1.5">
          {high.map((c, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span className="w-24 shrink-0 font-bold text-sea-900">저{6 - i} : 고{i}</span>
              <Bar value={c} max={Math.max(...high)} label={`${c}회 (${pct(c)})`} color="var(--sea-700)" />
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <SectionTitle sub={`평균 ${sumS.mean} · 중앙값 ${sumS.median} · 10~90% 구간 ${sumS.p10}~${sumS.p90}`}>번호 6개 합계</SectionTitle>
        <ul className="space-y-1.5">
          {sums.map((b) => (
            <li key={b.from} className="flex items-center gap-2 text-sm">
              <span className="w-24 shrink-0 font-bold text-sea-900">
                {b.from}~{b.to}
              </span>
              <Bar value={b.count} max={Math.max(...sums.map((x) => x.count))} label={`${b.count}회`} color="var(--sea-500)" />
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <SectionTitle sub="예: 7, 8처럼 이어지는 번호가 몇 쌍 있었나">연속 번호</SectionTitle>
        <ul className="space-y-1.5">
          {consec.map((c, i) =>
            c > 0 || i < 3 ? (
              <li key={i} className="flex items-center gap-2 text-sm">
                <span className="w-24 shrink-0 font-bold text-sea-900">{i === 0 ? "없음" : `${i}쌍`}</span>
                <Bar value={c} max={Math.max(...consec)} label={`${c}회 (${pct(c)})`} color="var(--coral)" />
              </li>
            ) : null,
          )}
        </ul>
      </Card>

      <Card>
        <SectionTitle sub="공 색깔 구간별로 몇 개 나왔나 (총 번호 수 기준)">색상 구간</SectionTitle>
        <ul className="space-y-1.5">
          {bands.map((c, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span className="w-24 shrink-0 font-bold text-sea-900">{BAND_LABEL[i]}</span>
              <Bar value={c} max={Math.max(...bands)} label={`${c}개 (${pct(c, draws.length * 6)})`} color={BAND_COLOR[i]} />
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted">41~45 구간은 번호가 5개뿐이라 적게 보이는 게 정상이에요.</p>
      </Card>

      <Card>
        <SectionTitle>끝자리 분포</SectionTitle>
        <ul className="space-y-1.5">
          {digits.map((c, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span className="w-24 shrink-0 font-bold text-sea-900">끝자리 {i}</span>
              <Bar value={c} max={Math.max(...digits)} label={`${c}개`} color="var(--sea-900)" />
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <SectionTitle sub="두 번호가 같은 회차에 함께 나온 횟수">자주 같이 나온 짝꿍</SectionTitle>
        <ul className="grid grid-cols-2 gap-2">
          {pairs.map((p) => (
            <li key={p.pair.join("-")} className="flex items-center justify-between rounded-xl bg-sea-50 px-3 py-2">
              <span className="flex gap-1">
                <Ball n={p.pair[0]} size="sm" />
                <Ball n={p.pair[1]} size="sm" />
              </span>
              <span className="text-sm font-black text-sea-900">{p.count}회</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <SectionTitle sub={`집계가 있는 ${types.rounds}회차 기준`}>1등은 자동? 수동?</SectionTitle>
        <ul className="space-y-1.5 text-sm">
          {[
            ["자동", types.auto, "var(--sea-500)"],
            ["수동", types.manual, "var(--coral)"],
            ["반자동", types.semiAuto, "var(--sea-900)"],
          ].map(([label, v, color]) => (
            <li key={label as string} className="flex items-center gap-2">
              <span className="w-24 shrink-0 font-bold text-sea-900">{label}</span>
              <Bar value={v as number} max={Math.max(types.auto, types.manual, types.semiAuto)} label={`${(v as number).toLocaleString()}명 (${pct(v as number, types.auto + types.manual + types.semiAuto)})`} color={color as string} />
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <SectionTitle>역대 최고 1등 당첨금</SectionTitle>
        <ol className="space-y-3">
          {jackpots.map((d, i) => (
            <li key={d.round} className="rounded-xl bg-sea-50 p-3">
              <div className="mb-1 flex items-baseline justify-between">
                <span className="font-black text-sea-900">
                  {["🥇", "🥈", "🥉"][i]} {d.round}회 <span className="text-xs font-normal text-muted">{d.date}</span>
                </span>
                <span className="font-black text-coral">{formatWon(d.prizes[0].amount)}</span>
              </div>
              <BallRow numbers={d.numbers} bonus={d.bonus} size="sm" animate={false} />
              <p className="mt-1 text-xs text-muted">1등 {d.prizes[0].winners}명</p>
            </li>
          ))}
        </ol>
      </Card>

    </main>
  );
}
