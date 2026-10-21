import raw from "../../data/draws.json";
import type { CompactDraw, Draw, DrawsFile } from "./types";

const file = raw as DrawsFile;

export const draws: Draw[] = file.draws;
export const latestRound = file.latestRound;
export const updatedAt = file.updatedAt;
export const latestDraw = draws[draws.length - 1];

export function getDraw(round: number): Draw | undefined {
  return draws[round - 1]?.round === round ? draws[round - 1] : draws.find((d) => d.round === round);
}

export function toCompact(list: Draw[] = draws): CompactDraw[] {
  return list.map((d) => [d.round, d.date, ...(d.numbers as [number, number, number, number, number, number]), d.bonus]);
}

export function fromCompact(c: CompactDraw): Pick<Draw, "round" | "date" | "numbers" | "bonus"> {
  return { round: c[0], date: c[1], numbers: c.slice(2, 8) as number[], bonus: c[8] };
}

/** 다음 추첨 회차와 날짜 (매주 토요일) */
export function nextDrawInfo() {
  const d = new Date(latestDraw.date + "T20:45:00+09:00");
  d.setUTCDate(d.getUTCDate() + 7);
  return { round: latestRound + 1, date: d.toISOString().slice(0, 10) };
}
