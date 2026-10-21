# 부캉이 로또 🦈

부산 북항 상어 **부캉이**와 함께 보는 로또 6/45 역대 당첨번호 분석 + 이번 주 추천 번호 웹사이트.

- 1회(2002-12-07)부터 최신 회차까지 전체 데이터 내장 (`data/draws.json`)
- 번호별 출현 횟수, 핫/콜드, 홀짝·고저·합계·연속번호·끝자리·색상 구간 통계, 자주 같이 나온 쌍
- 5가지 전략으로 번호 뽑기 (부캉이 추천 / 핫 / 콜드 / 균형 / 랜덤), 근거 표시
- 내 번호가 역대 몇 등 했는지 대조
- 큰 글씨, 모바일 우선 한국어 UI

> 로또는 매회 독립 추첨이라 과거 데이터로 다음 번호를 예측할 수 없습니다. 재미로만 보세요.

## 개발

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build
```

## 데이터 갱신

공식 공공 API가 없어서 동행복권 사이트가 내부적으로 쓰는 JSON 엔드포인트에서 수집합니다. 문서화되지 않은 엔드포인트라 예고 없이 바뀔 수 있습니다.

```bash
node scripts/fetch-draws.mjs          # 빠진 회차만 증분 수집
node scripts/fetch-draws.mjs --full   # 1회부터 전체 재수집
```

GitHub Actions(`.github/workflows/update-draws.yml`)가 매주 토요일 추첨 후 자동으로 수집해서 커밋합니다. Vercel에 연결해 두면 커밋마다 자동 배포됩니다.

## 구조

```
data/draws.json         역대 당첨번호 (스크립트가 생성)
scripts/fetch-draws.mjs 수집 스크립트
src/lib/analysis.ts     통계 계산
src/lib/generator.ts    번호 생성 전략
src/app/                페이지 (/, /pick, /stats, /history, /check)
src/components/         부캉이 캐릭터, 공, 네비게이션 등
```

부캉이 캐릭터는 이 프로젝트에서 직접 그린 오리지널 일러스트이며, 부산 동구의 공식 캐릭터와는 무관합니다.
