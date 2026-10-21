/**
 * 부캉이: 2026년 가을 부산 북항에 나타난 상어에서 영감을 받은 자체 제작 캐릭터.
 * 실제 공모 캐릭터와는 무관한 오리지널 일러스트입니다.
 */
export type BukangiMood = "happy" | "think" | "wow" | "sleep";

export function Bukangi({ size = 160, mood = "happy", className = "" }: { size?: number; mood?: BukangiMood; className?: string }) {
  const eye =
    mood === "sleep" ? (
      <path d="M118 78 q8 6 16 0" stroke="#0b3d5c" strokeWidth="4" fill="none" strokeLinecap="round" />
    ) : (
      <>
        <circle cx="126" cy="78" r={mood === "wow" ? 13 : 11} fill="#fff" />
        <circle cx={mood === "think" ? 130 : 128} cy={mood === "think" ? 74 : 79} r={mood === "wow" ? 7 : 6} fill="#0b3d5c" />
        <circle cx={mood === "think" ? 132 : 130} cy={mood === "think" ? 72 : 76} r="2.2" fill="#fff" />
      </>
    );

  const mouth =
    mood === "wow" ? (
      <ellipse cx="124" cy="104" rx="7" ry="9" fill="#0b3d5c" />
    ) : mood === "think" ? (
      <path d="M114 104 q10 -3 20 2" stroke="#0b3d5c" strokeWidth="4" fill="none" strokeLinecap="round" />
    ) : mood === "sleep" ? (
      <path d="M116 104 q8 4 16 0" stroke="#0b3d5c" strokeWidth="4" fill="none" strokeLinecap="round" />
    ) : (
      <>
        <path d="M108 100 q16 16 34 0" stroke="#0b3d5c" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M118 104 l3 6 l3 -6" fill="#fff" />
        <path d="M130 104 l3 6 l3 -6" fill="#fff" />
      </>
    );

  return (
    <svg
      width={size}
      height={size * 0.72}
      viewBox="0 0 200 144"
      className={className}
      role="img"
      aria-label="부캉이 상어 캐릭터"
    >
      {/* 꼬리 */}
      <path d="M26 72 L2 46 L10 74 L2 100 Z" fill="#5f8fb0" />
      {/* 등지느러미 */}
      <path d="M88 44 L104 12 L116 46 Z" fill="#5f8fb0" />
      {/* 몸통 */}
      <ellipse cx="104" cy="82" rx="78" ry="44" fill="#6f9fc0" />
      {/* 배 */}
      <path d="M46 94 q60 40 128 6 q-30 32 -78 30 q-36 -4 -50 -36 Z" fill="#f4f9fc" />
      {/* 옆지느러미 */}
      <path d="M92 110 L76 136 L110 122 Z" fill="#5f8fb0" />
      {/* 아가미 */}
      <path d="M96 72 q-4 10 0 20 M104 70 q-4 12 0 24" stroke="#5f8fb0" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* 볼터치 */}
      <circle cx="142" cy="96" r="6" fill="#ffb3a7" opacity="0.85" />
      {eye}
      {mouth}
      {mood === "sleep" && (
        <text x="150" y="40" fontSize="20" fontWeight="900" fill="#0f6ea3">
          z
        </text>
      )}
    </svg>
  );
}
