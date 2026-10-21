import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bukangi } from "@/components/Bukangi";
import { Ball, BallRow } from "@/components/Ball";
import { Card, SectionTitle } from "@/components/ui";
import { companions, NUMBERS, numberStats } from "@/lib/analysis";
import { draws, latestRound } from "@/lib/draws";
import { formatShortDate } from "@/lib/format";

export function generateStaticParams() {
  return NUMBERS.map((n) => ({ n: String(n) }));
}

export async function generateMetadata({ params }: PageProps<"/stats/[n]">): Promise<Metadata> {
  const { n } = await params;
  return { title: `${n}번 통계` };
}

export default async function NumberPage({ params }: PageProps<"/stats/[n]">) {
  const n = Number((await params).n);
  if (!Number.isInteger(n) || n < 1 || n > 45) notFound();

  const stat = numberStats(draws).find((s) => s.n === n)!;
  const rank = [...numberStats(draws)].sort((a, b) => b.count - a.count).findIndex((s) => s.n === n) + 1;
  const appearances = draws.filter((d) => d.numbers.includes(n)).reverse();
  const expected = (draws.length * 6) / 45;
  const buddies = companions(draws, n, 6);

  return (
    <main className="flex flex-col gap-4">
      <Link href="/stats" className="pt-2 text-sm font-bold text-sea-700">
        ← 통계로 돌아가기
      </Link>
      <header className="flex items-center gap-4">
        <Ball n={n} size="lg" />
        <div className="flex-1">
          <h1 className="text-3xl font-black text-sea-900">{n}번</h1>
          <p className="text-sm text-muted">출현 순위 45개 중 {rank}위</p>
        </div>
        <Bukangi size={90} mood={stat.gap >= 15 ? "sleep" : "happy"} />
      </header>

      <Card>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          {[
            ["본번호 출현", `${stat.count}회`],
            ["기대값 대비", `${((stat.count / expected) * 100).toFixed(0)}%`],
            ["보너스 출현", `${stat.bonusCount}회`],
            ["최근 20회", `${stat.recentCount}회`],
            ["마지막 출현", stat.lastRound ? `${stat.lastRound}회` : "없음"],
            ["안 나온 지", `${stat.gap}회째`],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-sea-50 p-3">
              <dt className="text-muted">{k}</dt>
              <dd className="text-lg font-black text-sea-900">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-xs text-muted">기대값은 모든 번호가 똑같이 나왔을 때의 횟수({expected.toFixed(0)}회)예요.</p>
      </Card>

      <Card>
        <SectionTitle sub={`${n}번과 같은 회차에 자주 나온 번호`}>짝꿍 번호</SectionTitle>
        <BallRow numbers={buddies.map((b) => b.n)} animate={false} />
        <p className="mt-2 text-sm text-muted">{buddies.map((b) => `${b.n}번 ${b.count}회`).join(" · ")}</p>
      </Card>

      <Card>
        <SectionTitle sub={`최근 순 · 1회 ~ ${latestRound}회`}>나온 회차 ({appearances.length}회)</SectionTitle>
        <ul className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
          {appearances.map((d) => (
            <li key={d.round} className="flex items-center gap-2 rounded-xl bg-sea-50 px-3 py-2">
              <span className="w-16 shrink-0 text-sm font-black text-sea-900">
                {d.round}회
                <span className="block text-[11px] font-normal text-muted">{formatShortDate(d.date)}</span>
              </span>
              <div className="flex flex-wrap gap-1">
                {d.numbers.map((m) => (
                  <span key={m} className={m === n ? "" : "opacity-40"}>
                    <Ball n={m} size="sm" />
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </main>
  );
}
