import type { Metadata } from "next";
import { CheckClient } from "./CheckClient";
import { toCompact } from "@/lib/draws";

export const metadata: Metadata = { title: "내 번호 확인" };

export default function CheckPage() {
  return <CheckClient past={toCompact()} />;
}
