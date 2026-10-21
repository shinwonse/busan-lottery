import { consecutiveCount, sumOf, type NumberStat } from "./analysis";
import type { CompactDraw } from "./types";

export type Strategy = "bukangi" | "hot" | "cold" | "balanced" | "random";

export const STRATEGIES: { id: Strategy; name: string; emoji: string; desc: string }[] = [
  { id: "bukangi", name: "부캉이 추천", emoji: "🦈", desc: "자주 나온 번호와 오래 안 나온 번호를 섞고, 역대 패턴(홀짝·합계)에 맞춰 고릅니다." },
  { id: "hot", name: "핫 번호", emoji: "🔥", desc: "최근 20회에서 자주 나온 번호에 무게를 둡니다." },
  { id: "cold", name: "콜드 번호", emoji: "🧊", desc: "오래 안 나온 번호가 '이제 나올 때 됐다'는 가정으로 고릅니다." },
  { id: "balanced", name: "균형 조합", emoji: "⚖️", desc: "홀짝 3:3 근처, 고저 균형, 합계 중간 구간, 색상 구간 골고루." },
  { id: "random", name: "완전 랜덤", emoji: "🎲", desc: "아무 조건 없이 공을 뽑습니다. 사실 확률은 이게 제일 정직합니다." },
];

export type Pick = { numbers: number[]; bonus: number; reasons: string[] };

/** 결정적 난수 (mulberry32). 같은 seed면 같은 번호. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashSeed(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function weightedSample(weights: number[], count: number, rand: () => number): number[] {
  const w = [...weights];
  const out: number[] = [];
  while (out.length < count) {
    const total = w.reduce((a, b) => a + b, 0);
    if (total <= 0) break;
    let r = rand() * total;
    let idx = 1;
    for (; idx <= 45; idx++) {
      r -= w[idx];
      if (r <= 0) break;
    }
    idx = Math.min(idx, 45);
    out.push(idx);
    w[idx] = 0;
  }
  return out.sort((a, b) => a - b);
}

function passesPattern(ns: number[]) {
  const odd = ns.filter((n) => n % 2 === 1).length;
  const high = ns.filter((n) => n >= 23).length;
  const sum = sumOf(ns);
  const bands = new Set(ns.map((n) => Math.min(4, Math.floor((n - 1) / 10)))).size;
  return odd >= 2 && odd <= 4 && high >= 2 && high <= 4 && sum >= 100 && sum <= 175 && consecutiveCount(ns) <= 2 && bands >= 3;
}

function describe(ns: number[], stats: NumberStat[]): string[] {
  const odd = ns.filter((n) => n % 2 === 1).length;
  const high = ns.filter((n) => n >= 23).length;
  const sum = sumOf(ns);
  const byN = new Map(stats.map((s) => [s.n, s]));
  const hot = ns.filter((n) => (byN.get(n)?.recentCount ?? 0) >= 3);
  const cold = ns.filter((n) => (byN.get(n)?.gap ?? 0) >= 15);
  const reasons = [`홀수 ${odd}개 · 짝수 ${6 - odd}개`, `고번호(23 이상) ${high}개`, `합계 ${sum}`];
  if (hot.length) reasons.push(`최근 자주 나온 번호: ${hot.join(", ")}`);
  if (cold.length) reasons.push(`오래 쉬고 있던 번호: ${cold.join(", ")}`);
  const consec = consecutiveCount(ns);
  if (consec > 0) reasons.push(`연속 번호 ${consec}쌍 포함`);
  return reasons;
}

export function generatePick(strategy: Strategy, stats: NumberStat[], pastDraws: CompactDraw[], seed: number): Pick {
  const rand = rng(seed);
  const pastKeys = new Set(pastDraws.map((d) => d.slice(2, 8).join("-")));
  const maxCount = Math.max(...stats.map((s) => s.count));
  const maxGap = Math.max(...stats.map((s) => s.gap));
  const maxRecent = Math.max(1, ...stats.map((s) => s.recentCount));

  const weightsFor = (kind: "hot" | "cold" | "flat" | "mix"): number[] => {
    const w = new Array(46).fill(0);
    for (const s of stats) {
      if (kind === "flat") w[s.n] = 1;
      else if (kind === "hot") w[s.n] = 1 + 3 * (s.recentCount / maxRecent) + (s.count / maxCount);
      else if (kind === "cold") w[s.n] = 1 + 3 * (s.gap / maxGap) + (1 - s.count / maxCount);
      else w[s.n] = 1 + 1.5 * (s.recentCount / maxRecent) + 1.5 * (s.gap / maxGap);
    }
    return w;
  };

  let numbers: number[] = [];
  for (let attempt = 0; attempt < 200; attempt++) {
    if (strategy === "random") numbers = weightedSample(weightsFor("flat"), 6, rand);
    else if (strategy === "hot") numbers = weightedSample(weightsFor("hot"), 6, rand);
    else if (strategy === "cold") numbers = weightedSample(weightsFor("cold"), 6, rand);
    else if (strategy === "balanced") numbers = weightedSample(weightsFor("flat"), 6, rand);
    else {
      // bukangi: 핫 3개 + 콜드 3개를 가중 추출한 뒤 패턴 필터
      const hot = weightedSample(weightsFor("hot"), 3, rand);
      const coldW = weightsFor("cold");
      for (const n of hot) coldW[n] = 0;
      numbers = [...hot, ...weightedSample(coldW, 3, rand)].sort((a, b) => a - b);
    }
    if (pastKeys.has(numbers.join("-"))) continue; // 역대 1등 조합 그대로는 제외
    if (strategy === "random" || strategy === "hot" || strategy === "cold") break;
    if (passesPattern(numbers)) break;
  }

  // 보너스 예상: 본번호를 제외한 나머지에서 역대 보너스 출현 빈도에 가중치를 둬 1개
  const bonusW = new Array(46).fill(0);
  for (const s of stats) if (!numbers.includes(s.n)) bonusW[s.n] = 1 + s.bonusCount / 10;
  const [bonus] = weightedSample(bonusW, 1, rand);

  return { numbers, bonus, reasons: describe(numbers, stats) };
}

export function generateSet(strategy: Strategy, stats: NumberStat[], pastDraws: CompactDraw[], seed: number, games = 5): Pick[] {
  return Array.from({ length: games }, (_, i) => generatePick(strategy, stats, pastDraws, seed + i * 7919));
}
