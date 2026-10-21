import type { Metadata } from "next";
import { Suspense } from "react";
import { HistoryClient, type HistoryRow } from "./HistoryClient";
import { draws } from "@/lib/draws";

export const metadata: Metadata = { title: "역대 당첨번호" };

export default function HistoryPage() {
  const rows: HistoryRow[] = draws.map((d) => [d.round, d.date, ...d.numbers, d.bonus, ...d.prizes.flatMap((p) => [p.winners, p.amount])] as HistoryRow);
  return (
    <Suspense fallback={null}>
      <HistoryClient rows={rows} />
    </Suspense>
  );
}
