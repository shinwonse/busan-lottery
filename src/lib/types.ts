export type Prize = { rank: number; winners: number; amount: number };

export type Draw = {
  round: number;
  date: string; // YYYY-MM-DD
  numbers: number[]; // 오름차순 6개
  bonus: number;
  prizes: Prize[];
  firstPrizeByType: { auto: number; manual: number; semiAuto: number } | null;
  totalSales: number;
};

export type DrawsFile = { updatedAt: string; latestRound: number; draws: Draw[] };

/** 클라이언트로 넘길 때 쓰는 압축 형식: [회차, 날짜, n1..n6, 보너스] */
export type CompactDraw = [number, string, number, number, number, number, number, number, number];
