import { ballColor } from "@/lib/format";

export function Ball({ n, size = "md", bonus = false, delay = 0 }: { n: number; size?: "sm" | "md" | "lg"; bonus?: boolean; delay?: number }) {
  const sz = size === "lg" ? "h-11 w-11 text-xl" : size === "sm" ? "h-8 w-8 text-sm" : "h-10 w-10 text-lg";
  return (
    <span
      className={`ball ball-${ballColor(n)} ${sz} ${bonus ? "ball-bonus" : ""} animate-pop`}
      style={{ animationDelay: `${delay}ms` }}
      aria-label={bonus ? `보너스 ${n}` : String(n)}
    >
      {n}
    </span>
  );
}

/**
 * 당첨번호 한 줄. 작은 크기는 보너스까지 한 줄에, 중간 이상은 6개를 한 줄에 두고
 * 보너스는 아래 줄에 "보너스" 라벨과 함께 보여준다 (휴대폰 폭에서 줄바꿈 방지).
 */
export function BallRow({ numbers, bonus, size = "md", animate = true }: { numbers: number[]; bonus?: number; size?: "sm" | "md" | "lg"; animate?: boolean }) {
  const inline = size === "sm" || bonus === undefined;
  return (
    <div className={inline ? "flex flex-wrap items-center gap-1.5" : "flex flex-col gap-2"}>
      <div className={`flex items-center ${size === "sm" ? "gap-1.5" : "justify-between gap-1"}`}>
        {numbers.map((n, i) => (
          <Ball key={`${n}-${i}`} n={n} size={size} delay={animate ? i * 70 : 0} />
        ))}
      </div>
      {bonus !== undefined && (
        <div className="flex items-center gap-1.5">
          <span className={`font-black text-sea-700 ${size === "sm" ? "text-base" : "text-sm"}`} aria-hidden>
            {size === "sm" ? "+" : "+ 보너스"}
          </span>
          <Ball n={bonus} size={size} bonus delay={animate ? 7 * 70 : 0} />
        </div>
      )}
    </div>
  );
}
