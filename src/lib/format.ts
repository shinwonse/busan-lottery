export function formatWon(n: number) {
  if (n >= 1_0000_0000) {
    const eok = Math.floor(n / 1_0000_0000);
    const man = Math.floor((n % 1_0000_0000) / 1_0000);
    return man > 0 ? `${eok}억 ${man.toLocaleString("ko-KR")}만원` : `${eok}억원`;
  }
  if (n >= 1_0000) return `${Math.floor(n / 1_0000).toLocaleString("ko-KR")}만원`;
  return `${n.toLocaleString("ko-KR")}원`;
}

export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const day = ["일", "월", "화", "수", "목", "금", "토"][new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${y}년 ${m}월 ${d}일 (${day})`;
}

export function formatShortDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${y.slice(2)}.${m}.${d}`;
}

/** 공식 로또 공 색상 구간 */
export function ballColor(n: number): "yellow" | "blue" | "red" | "gray" | "green" {
  if (n <= 10) return "yellow";
  if (n <= 20) return "blue";
  if (n <= 30) return "red";
  if (n <= 40) return "gray";
  return "green";
}
