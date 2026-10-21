import type { Draw } from "./types";

export const NUMBERS = Array.from({ length: 45 }, (_, i) => i + 1);

export type NumberStat = {
  n: number;
  count: number; // 본번호 출현 횟수
  bonusCount: number;
  lastRound: number | null; // 마지막 본번호 출현 회차
  gap: number; // 최근 몇 회째 안 나왔는지
  recentCount: number; // 최근 N회 출현 횟수
};

export function numberStats(draws: Draw[], recentWindow = 20): NumberStat[] {
  const count = new Array(46).fill(0);
  const bonusCount = new Array(46).fill(0);
  const lastRound: (number | null)[] = new Array(46).fill(null);
  const recentCount = new Array(46).fill(0);
  const latest = draws[draws.length - 1]?.round ?? 0;
  const recentFrom = latest - recentWindow + 1;

  for (const d of draws) {
    for (const n of d.numbers) {
      count[n]++;
      lastRound[n] = d.round;
      if (d.round >= recentFrom) recentCount[n]++;
    }
    bonusCount[d.bonus]++;
  }

  return NUMBERS.map((n) => ({
    n,
    count: count[n],
    bonusCount: bonusCount[n],
    lastRound: lastRound[n],
    gap: lastRound[n] === null ? draws.length : latest - (lastRound[n] as number),
    recentCount: recentCount[n],
  }));
}

export function hotNumbers(stats: NumberStat[], k = 6) {
  return [...stats].sort((a, b) => b.recentCount - a.recentCount || b.count - a.count || a.n - b.n).slice(0, k);
}

export function coldNumbers(stats: NumberStat[], k = 6) {
  return [...stats].sort((a, b) => b.gap - a.gap || a.count - b.count || a.n - b.n).slice(0, k);
}

export function mostFrequent(stats: NumberStat[], k = 6) {
  return [...stats].sort((a, b) => b.count - a.count || a.n - b.n).slice(0, k);
}

export function leastFrequent(stats: NumberStat[], k = 6) {
  return [...stats].sort((a, b) => a.count - b.count || a.n - b.n).slice(0, k);
}

/** 홀수 개수 분포 (0~6) */
export function oddCountDistribution(draws: Draw[]) {
  const dist = new Array(7).fill(0);
  for (const d of draws) dist[d.numbers.filter((n) => n % 2 === 1).length]++;
  return dist;
}

/** 고번호(23~45) 개수 분포 (0~6) */
export function highCountDistribution(draws: Draw[]) {
  const dist = new Array(7).fill(0);
  for (const d of draws) dist[d.numbers.filter((n) => n >= 23).length]++;
  return dist;
}

export function sumOf(numbers: number[]) {
  return numbers.reduce((a, b) => a + b, 0);
}

/** 합계 구간 분포 (10 단위) */
export function sumBuckets(draws: Draw[], size = 20) {
  const map = new Map<number, number>();
  for (const d of draws) {
    const s = sumOf(d.numbers);
    const b = Math.floor(s / size) * size;
    map.set(b, (map.get(b) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => a[0] - b[0]).map(([from, count]) => ({ from, to: from + size - 1, count }));
}

export function sumStats(draws: Draw[]) {
  const sums = draws.map((d) => sumOf(d.numbers)).sort((a, b) => a - b);
  const mean = sums.reduce((a, b) => a + b, 0) / sums.length;
  const q = (p: number) => sums[Math.min(sums.length - 1, Math.floor(p * sums.length))];
  return { min: sums[0], max: sums[sums.length - 1], mean: Math.round(mean), p10: q(0.1), p90: q(0.9), median: q(0.5) };
}

export function consecutiveCount(numbers: number[]) {
  let c = 0;
  for (let i = 1; i < numbers.length; i++) if (numbers[i] === numbers[i - 1] + 1) c++;
  return c;
}

/** 연속번호 쌍 개수 분포 */
export function consecutiveDistribution(draws: Draw[]) {
  const dist = new Array(6).fill(0);
  for (const d of draws) dist[consecutiveCount(d.numbers)]++;
  return dist;
}

/** 끝자리(0~9) 분포 */
export function lastDigitDistribution(draws: Draw[]) {
  const dist = new Array(10).fill(0);
  for (const d of draws) for (const n of d.numbers) dist[n % 10]++;
  return dist;
}

/** 색상 구간(1-10, 11-20, 21-30, 31-40, 41-45)별 출현 수 */
export function colorBandDistribution(draws: Draw[]) {
  const dist = new Array(5).fill(0);
  for (const d of draws) for (const n of d.numbers) dist[Math.min(4, Math.floor((n - 1) / 10))]++;
  return dist;
}

/** 가장 자주 같이 나온 번호 쌍 */
export function topPairs(draws: Draw[], k = 10) {
  const map = new Map<string, number>();
  for (const d of draws) {
    const ns = d.numbers;
    for (let i = 0; i < 6; i++)
      for (let j = i + 1; j < 6; j++) {
        const key = `${ns[i]}-${ns[j]}`;
        map.set(key, (map.get(key) ?? 0) + 1);
      }
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map(([key, count]) => ({ pair: key.split("-").map(Number) as [number, number], count }));
}

/** 특정 번호와 함께 가장 자주 나온 번호들 */
export function companions(draws: Draw[], n: number, k = 5) {
  const count = new Array(46).fill(0);
  for (const d of draws) if (d.numbers.includes(n)) for (const m of d.numbers) if (m !== n) count[m]++;
  return NUMBERS.filter((m) => m !== n)
    .map((m) => ({ n: m, count: count[m] }))
    .sort((a, b) => b.count - a.count || a.n - b.n)
    .slice(0, k);
}

/** 1등 자동/수동/반자동 누계 (집계가 있는 회차만) */
export function firstPrizeTypeTotals(draws: Draw[]) {
  let auto = 0, manual = 0, semiAuto = 0, rounds = 0;
  for (const d of draws) {
    if (!d.firstPrizeByType) continue;
    const t = d.firstPrizeByType;
    if (t.auto + t.manual + t.semiAuto === 0) continue;
    auto += t.auto; manual += t.manual; semiAuto += t.semiAuto; rounds++;
  }
  return { auto, manual, semiAuto, rounds };
}

/** 역대 최고 1등 당첨금 회차 */
export function biggestJackpots(draws: Draw[], k = 5) {
  return [...draws]
    .filter((d) => d.prizes[0].winners > 0)
    .sort((a, b) => b.prizes[0].amount - a.prizes[0].amount)
    .slice(0, k);
}

export type Rank = 1 | 2 | 3 | 4 | 5 | null;

export function rankOf(ticket: number[], numbers: number[], bonus: number): Rank {
  const hit = ticket.filter((n) => numbers.includes(n)).length;
  if (hit === 6) return 1;
  if (hit === 5 && ticket.includes(bonus)) return 2;
  if (hit === 5) return 3;
  if (hit === 4) return 4;
  if (hit === 3) return 5;
  return null;
}
