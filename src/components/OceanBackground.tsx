const BUBBLES = [
  { left: "8%", size: 14, dur: 18, delay: 0 },
  { left: "22%", size: 8, dur: 14, delay: 4 },
  { left: "41%", size: 18, dur: 22, delay: 2 },
  { left: "63%", size: 10, dur: 16, delay: 7 },
  { left: "78%", size: 22, dur: 26, delay: 1 },
  { left: "91%", size: 12, dur: 19, delay: 9 },
];

export function OceanBackground() {
  return (
    <>
      {BUBBLES.map((b, i) => (
        <span
          key={i}
          className="bubble"
          style={{ left: b.left, width: b.size, height: b.size, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }}
        />
      ))}
      <svg className="wave-strip" viewBox="0 0 1200 90" preserveAspectRatio="none" aria-hidden>
        <path
          d="M0 50 Q75 20 150 50 T300 50 T450 50 T600 50 T750 50 T900 50 T1050 50 T1200 50 V90 H0 Z"
          fill="rgba(30,155,215,0.18)"
        />
        <path
          d="M0 65 Q75 40 150 65 T300 65 T450 65 T600 65 T750 65 T900 65 T1050 65 T1200 65 V90 H0 Z"
          fill="rgba(15,110,163,0.16)"
        />
      </svg>
    </>
  );
}
