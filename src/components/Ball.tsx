import { ballColor } from "@/lib/format";

type BallProps = { n: number; size?: "sm" | "md" | "lg" | "fluid"; bonus?: boolean; delay?: number };

export function Ball({ n, size = "md", bonus = false, delay = 0 }: BallProps) {
  const sz =
    size === "fluid"
      ? "w-full aspect-square text-[clamp(0.9rem,4.6vw,1.3rem)]"
      : size === "lg"
        ? "h-11 w-11 text-xl"
        : size === "sm"
          ? "h-8 w-8 text-sm"
          : "h-10 w-10 text-lg";
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
 * 당첨번호 한 줄.
 * - sm: 보너스까지 한 줄에 작은 공으로 (목록용)
 * - 그 외: 6칸 그리드에 공이 화면 폭에 맞춰 줄어들어 어떤 휴대폰에서도 한 줄에 들어간다.
 *   보너스는 아래 줄, 같은 칸 크기로 정렬.
 */
export function BallRow({ numbers, bonus, bonusLabel = "+ 보너스", size = "md", animate = true }: { numbers: number[]; bonus?: number; bonusLabel?: string; size?: "sm" | "md" | "lg"; animate?: boolean }) {
  if (size === "sm") {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        {numbers.map((n, i) => (
          <Ball key={`${n}-${i}`} n={n} size="sm" delay={animate ? i * 70 : 0} />
        ))}
        {bonus !== undefined && (
          <>
            <span className="font-black text-sea-700" aria-hidden>
              +
            </span>
            <Ball n={bonus} size="sm" bonus delay={animate ? 7 * 70 : 0} />
          </>
        )}
      </div>
    );
  }

  const gap = size === "lg" ? "gap-2" : "gap-1.5";
  return (
    <div className="flex flex-col gap-2">
      <div className={`grid grid-cols-6 ${gap}`}>
        {numbers.map((n, i) => (
          <Ball key={`${n}-${i}`} n={n} size="fluid" delay={animate ? i * 70 : 0} />
        ))}
      </div>
      {bonus !== undefined && (
        <div className={`grid grid-cols-6 items-center ${gap}`}>
          <span className="col-span-2 whitespace-nowrap text-xs font-black text-sea-700" aria-hidden>
            {bonusLabel}
          </span>
          <Ball n={bonus} size="fluid" bonus delay={animate ? 7 * 70 : 0} />
        </div>
      )}
    </div>
  );
}
