// 동행복권 비공식 JSON 엔드포인트에서 로또 6/45 역대 당첨번호를 수집한다.
//
//   node scripts/fetch-draws.mjs          # data/draws.json에 없는 회차만 증분 수집
//   node scripts/fetch-draws.mjs --full   # 1회부터 전체 재수집
//
// 엔드포인트는 공식 문서가 없는 내부 API라 예고 없이 바뀔 수 있다.
// 응답은 지정 회차를 포함해 이전 10회차를 한 번에 돌려준다.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_FILE = resolve(ROOT, "data/draws.json");

const LATEST_URL = "https://www.dhlottery.co.kr/lt645/result";
const DETAIL_URL = "https://www.dhlottery.co.kr/lt645/selectPstLt645InfoNew.do";
const HEADERS = {
  accept: "application/json, text/html;q=0.9",
  "user-agent": "Mozilla/5.0 (busan-lottery data sync; weekly)",
};
const DELAY_MS = 300;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getLatestRound() {
  const res = await fetch(LATEST_URL, { headers: HEADERS });
  if (!res.ok) throw new Error(`최신 회차 페이지 요청 실패: ${res.status}`);
  const html = await res.text();
  const m = html.match(/id="opt_val"[^>]*value="(\d+)"/i);
  if (!m) throw new Error("최신 회차를 HTML에서 찾지 못했습니다. 사이트 구조가 바뀐 것 같습니다.");
  return Number(m[1]);
}

async function fetchChunk(round) {
  const url = new URL(DETAIL_URL);
  url.searchParams.set("srchDir", "center");
  url.searchParams.set("srchLtEpsd", String(round));
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`${round}회차 요청 실패: ${res.status}`);
  const json = await res.json();
  const list = json?.data?.list;
  if (!Array.isArray(list)) throw new Error(`${round}회차 응답 형식이 예상과 다릅니다.`);
  return list.map(normalize);
}

function normalize(item) {
  const ymd = String(item.ltRflYmd);
  return {
    round: Number(item.ltEpsd),
    date: `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`,
    numbers: [item.tm1WnNo, item.tm2WnNo, item.tm3WnNo, item.tm4WnNo, item.tm5WnNo, item.tm6WnNo]
      .map(Number)
      .sort((a, b) => a - b),
    bonus: Number(item.bnsWnNo),
    prizes: [1, 2, 3, 4, 5].map((rank) => ({
      rank,
      winners: Number(item[`rnk${rank}WnNope`]),
      amount: Number(item[`rnk${rank}WnAmt`]),
    })),
    firstPrizeByType:
      Number(item.winType0) === 0
        ? { auto: Number(item.winType1), manual: Number(item.winType2), semiAuto: Number(item.winType3) }
        : null,
    totalSales: Number(item.wholEpsdSumNtslAmt),
  };
}

function validate(draw) {
  const ok =
    Number.isInteger(draw.round) &&
    draw.round > 0 &&
    draw.numbers.length === 6 &&
    new Set(draw.numbers).size === 6 &&
    draw.numbers.every((n) => n >= 1 && n <= 45) &&
    draw.bonus >= 1 &&
    draw.bonus <= 45 &&
    !draw.numbers.includes(draw.bonus) &&
    /^\d{4}-\d{2}-\d{2}$/.test(draw.date);
  if (!ok) throw new Error(`검증 실패: ${JSON.stringify(draw)}`);
}

async function loadExisting() {
  try {
    const parsed = JSON.parse(await readFile(OUT_FILE, "utf8"));
    return Array.isArray(parsed.draws) ? parsed.draws : [];
  } catch {
    return [];
  }
}

async function main() {
  const full = process.argv.includes("--full");
  const latest = await getLatestRound();
  const existing = full ? [] : await loadExisting();
  const byRound = new Map(existing.map((d) => [d.round, d]));
  const have = (r) => byRound.has(r);

  const missing = [];
  for (let r = 1; r <= latest; r++) if (!have(r)) missing.push(r);

  console.log(`최신 회차 ${latest}, 보유 ${byRound.size}회차, 수집 대상 ${missing.length}회차`);
  if (missing.length === 0 && existing.length > 0) {
    console.log("새 회차 없음. 파일을 건드리지 않습니다.");
    return;
  }

  // 빠진 회차들을 10개 단위 요청으로 커버한다.
  // srchDir=center 는 요청 회차 r 기준 r-5..r+4 범위를 돌려주고 양 끝에서는 잘린다.
  let i = 0;
  while (i < missing.length) {
    const target = Math.min(latest, missing[i] + 5);
    const chunk = await fetchChunk(target);
    let maxRound = 0;
    for (const d of chunk) {
      validate(d);
      byRound.set(d.round, d);
      maxRound = Math.max(maxRound, d.round);
    }
    const before = i;
    while (i < missing.length && byRound.has(missing[i])) i++;
    if (i === before) throw new Error(`${missing[i]}회차를 응답에서 받지 못했습니다 (요청 ${target}, 수신 최대 ${maxRound}).`);
    process.stdout.write(`\r  ${maxRound}회차까지 수신 (${byRound.size}/${latest})`);
    await sleep(DELAY_MS);
  }
  if (missing.length) process.stdout.write("\n");

  const draws = [...byRound.values()].sort((a, b) => a.round - b.round);
  for (let r = 1; r <= latest; r++) {
    if (!byRound.has(r)) throw new Error(`${r}회차가 비어 있습니다.`);
  }

  await mkdir(dirname(OUT_FILE), { recursive: true });
  await writeFile(
    OUT_FILE,
    JSON.stringify({ updatedAt: new Date().toISOString(), latestRound: latest, draws }, null, 0) + "\n",
  );
  console.log(`저장 완료: ${OUT_FILE} (${draws.length}회차)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
