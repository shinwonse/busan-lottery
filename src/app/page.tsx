import Link from "next/link";
import { Bukangi } from "@/components/Bukangi";
import { BallRow } from "@/components/Ball";
import { Card, Disclaimer, SectionTitle } from "@/components/ui";
import { coldNumbers, hotNumbers, numberStats } from "@/lib/analysis";
import { draws, latestDraw, nextDrawInfo, toCompact } from "@/lib/draws";
import { formatDate, formatWon } from "@/lib/format";
import { generatePick, hashSeed } from "@/lib/generator";

export default function HomePage() {
  const stats = numberStats(draws);
  const next = nextDrawInfo();
  const weekly = generatePick("bukangi", stats, toCompact(), hashSeed(`bukangi-week-${next.round}`));
  const hot = hotNumbers(stats, 3);
  const cold = coldNumbers(stats, 3);
  const first = latestDraw.prizes[0];

  return (
    <main className="flex flex-col gap-4">
      <header className="flex items-end justify-between gap-2 pt-2">
        <div>
          <p className="text-sm font-bold text-sea-700">부산 북항에서 온</p>
          <h1 className="text-3xl font-black leading-tight text-sea-900">부캉이 로또</h1>
          <p className="mt-1 text-sm text-muted">역대 번호 분석 · 이번 주 추천</p>
        </div>
        <Bukangi size={128} mood="happy" className="animate-float -mb-2" />
      </header>

      <Card>
        <SectionTitle sub={formatDate(latestDraw.date)}>{latestDraw.round}회 당첨번호</SectionTitle>
        <BallRow numbers={latestDraw.numbers} bonus={latestDraw.bonus} size="lg" />
        <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl bg-sea-50 p-3">
            <dt className="text-muted">1등 당첨금</dt>
            <dd className="text-base font-black text-sea-900">{first.winners > 0 ? formatWon(first.amount) : "이월"}</dd>
          </div>
          <div className="rounded-xl bg-sea-50 p-3">
            <dt className="text-muted">1등 당첨자</dt>
            <dd className="text-lg font-black text-sea-900">{first.winners}명</dd>
          </div>
        </dl>
        <Link href={`/history?round=${latestDraw.round}`} className="mt-3 inline-block text-sm font-bold text-sea-700 underline underline-offset-4">
          등수별 당첨금 보기
        </Link>
      </Card>

      <Card className="border-2 border-sea-300 bg-gradient-to-b from-foam to-sea-50">
        <div className="flex items-start justify-between gap-2">
          <SectionTitle sub={`${next.round}회 · ${formatDate(next.date)} 추첨`}>🦈 이번 주 부캉이 추천</SectionTitle>
          <Bukangi size={72} mood="wow" />
        </div>
        <BallRow numbers={weekly.numbers} size="lg" />
        <ul className="mt-3 space-y-1 text-sm text-sea-900">
          {weekly.reasons.map((r) => (
            <li key={r}>· {r}</li>
          ))}
        </ul>
        <Link
          href="/pick"
          className="mt-4 block rounded-2xl bg-sea-700 py-4 text-center text-xl font-black text-white shadow-lg active:scale-[0.98]"
        >
          다른 번호 더 뽑기
        </Link>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <h3 className="mb-2 text-base font-black text-coral">🔥 최근 20회 핫</h3>
          <BallRow numbers={hot.map((s) => s.n)} size="sm" animate={false} />
          <p className="mt-2 text-xs text-muted">{hot.map((s) => `${s.n}번 ${s.recentCount}회`).join(" · ")}</p>
        </Card>
        <Card className="p-4">
          <h3 className="mb-2 text-base font-black text-sea-700">🧊 오래 안 나온</h3>
          <BallRow numbers={cold.map((s) => s.n)} size="sm" animate={false} />
          <p className="mt-2 text-xs text-muted">{cold.map((s) => `${s.n}번 ${s.gap}회째`).join(" · ")}</p>
        </Card>
      </div>

      <Link href="/stats" className="card block p-4 text-center text-lg font-black text-sea-900">
        📊 전체 통계 보러 가기
      </Link>

      <Disclaimer />
    </main>
  );
}
