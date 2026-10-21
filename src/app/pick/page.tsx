import type { Metadata } from "next";
import { PickClient } from "./PickClient";
import { numberStats } from "@/lib/analysis";
import { draws, nextDrawInfo, toCompact } from "@/lib/draws";

export const metadata: Metadata = { title: "번호 뽑기" };

export default function PickPage() {
  const stats = numberStats(draws);
  return <PickClient stats={stats} past={toCompact()} next={nextDrawInfo()} />;
}
