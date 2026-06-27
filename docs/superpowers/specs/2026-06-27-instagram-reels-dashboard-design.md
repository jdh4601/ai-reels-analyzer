# Instagram 릴스 AI 분석 대시보드 — 설계 문서

- 작성일: 2026-06-27
- 작성자: Jayden + Claude
- 상태: 설계 합의 완료 (구현 계획 대기)

## 1. 목적 (Why)

창업가 인터뷰 릴스 계정을 운영하면서, 단순히 EDIT 앱이 보여주는 데이터를
보는 것을 넘어 **진단 + 컨텐츠 맞춤 해결책**까지 도출하는 로컬 AI 대시보드.

핵심 가치:
- **잘 되는 점** (강점) 을 명확히 보여준다.
- **당장 개선할 점** (약점·병목) 을 우선순위와 함께 짚는다.
- **내 컨텐츠에 최적화된 구체적 해결책** (훅/엔딩 스크립트, 구간별 처방) 을 생성한다.
- 과거 대비 **얼마나 나아졌는지** (성장 추이) 를 1급 시민으로 다룬다.

이 대시보드의 분석 초점은 **릴스 퍼널** (3초 훅 → 잔존 → CTA → 팔로우 전환) 이다.

## 2. 핵심 제약과 데이터 소스 결정 (가장 중요)

릴스 퍼널의 심층 지표 일부는 **어떤 API로도 얻을 수 없다**. 이 사실이 설계를
규정한다.

| 데이터 | 출처 | 방식 |
|---|---|---|
| 좋아요·댓글·저장·공유 수, reach, plays, 평균 시청시간(`ig_reels_avg_watch_time`), 팔로워 추이 | Instagram Graph API (소유 비즈니스/크리에이터 계정) | 자동 |
| **3초 훅 잔존율, 초단위 잔존 곡선, 유입 소스 분해(Reels탭/Explore/홈)** | EDIT 앱 / Instagram 인사이트 **화면** | 스크린샷 업로드 → Vision 파싱 |

결정 사항 (사용자 확정):
1. **데이터 백본 = 정식 Instagram Graph API** (Smithery 스크래퍼 MCP 아님 — 그것은
   공개 데이터만 긁고 비공개 인사이트를 못 줌).
2. **앱 전용 3개 지표 = EDIT 스크린샷 업로드 → Claude Vision 파싱으로 보완.**
3. **형태 = 로컬 Next.js 웹앱** (App Router).
4. **분석 초점 = 릴스 퍼널.**
5. **비교 범위 = 내 계정만 (시계열)**. 경쟁/벤치마크 계정 비교는 후순위.
6. **"실시간"의 정의 = 새 데이터(스샷/API)를 넣는 즉시 재분석·재진단.**

> 주의: 정식 Graph API조차 릴별 잔존 곡선·3초 훅·유입소스 분해는 제공하지 않는다.
> 그 3개는 스크린샷이 유일한 출처다.

## 3. 전체 아키텍처

```
┌─────────────────────────────────────────────┐
│  Next.js 앱 (로컬, App Router)                │
│                                              │
│  [수집 계층]                                  │
│   ├ Graph API 클라이언트 (집계 지표 자동)      │
│   ├ 스크린샷 파서 (Claude Vision)             │
│   │   → 3초훅·잔존곡선·유입소스               │
│   └ SRT 파서 (자막 → 타임스탬프 라인)          │
│              ↓                               │
│  [정규화 데이터 모델]  Reel / AccountSnapshot   │
│              ↓  (로컬 JSON 스토어)             │
│  [분석 엔진 — 결정론적·테스트 가능]            │
│   ├ 지표 계산 (공유율·저장율·완료율…)          │
│   ├ 벤치마크/개인화 베이스라인 대비 진단        │
│   ├ 텐션 저하 구간 탐지 (잔존 곡선 급락)        │
│   └ 시계열 추이 + 델타                         │
│              ↓                               │
│  [추천 엔진]                                  │
│   ├ 룰 기반 플레이북 (약점→처방 매핑)          │
│   └ Claude API: 훅 3안 / 엔딩 3안 /            │
│       구간별 처방 / 콘텐츠 코멘트              │
│              ↓                               │
│  [대시보드 UI]                                │
│   병목 배너 · 진단 카드 · 잔존곡선 차트 ·       │
│   지표 바 · 성장 추이 · 해결책 탭             │
└─────────────────────────────────────────────┘
```

### 빌드 단계 (각 단계가 그 자체로 동작)

- **Phase 1 (MVP):** 스크린샷 업로드 → Vision 파싱 → 분석 엔진 → 진단 + 룰 기반
  해결책 + 시각화. (Instagram Graph API 없이 완성 가능. Anthropic 키만 필요.)
- **Phase 2:** Graph API 라이브 연동 (집계 지표 자동 + 시계열 추이).
- **Phase 3:** Claude API 맞춤 스크립트 생성 (훅/엔딩 3버전, 구간별 처방, 콘텐츠
  코멘트).

설계 원칙: **진단은 결정론(룰 기반, 테스트 가능), 창의적 생성만 LLM.**

## 4. 데이터 모델

```typescript
interface Reel {
  id: string;
  postedAt: string;          // ISO
  durationSec: number;

  // --- Graph API 자동 수집 (Phase 2) / Phase 1은 스샷에서 ---
  views: number;             // plays (EDIT '조회수' = 비율 분모)
  reach: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  avgWatchTimeSec: number;   // ig_reels_avg_watch_time

  // --- 스크린샷 Vision 파싱 (API 불가) ---
  hookRetention3s?: number;          // % (예: 35.3)
  retentionCurve?: { sec: number; pct: number }[];
  reachSources?: {                    // %
    reelsTab?: number; explore?: number;
    home?: number; profile?: number; other?: number;
  };
  followsFromReel?: number;

  // --- 콘텐츠 ---
  caption?: string;
  transcript?: TranscriptLine[];      // SRT 파싱 결과

  // --- 파생 (분석 엔진이 계산) ---
  derived?: DerivedRates;
}

interface TranscriptLine { startSec: number; endSec: number; text: string; }

interface DerivedRates {
  shareRate: number;       // shares / views * 100
  saveRate: number;        // saves / views * 100
  likeRate: number;        // likes / views * 100
  commentRate: number;     // comments / views * 100
  engagementRate: number;  // (likes+comments+saves+shares)/views*100
  completionRate: number;  // avgWatchTimeSec / durationSec * 100
  followRate?: number;     // followsFromReel / views * 100
}

interface AccountSnapshot {     // 시계열 추이 (Phase 2)
  date: string;
  followerCount: number;
  reachLast7d: number;
}
```

비율 분모는 **views(조회수)** 로 통일 — EDIT 앱이 비율을 그렇게 계산하므로
사용자가 보던 숫자(예: 공유율 1.70%)와 일치한다.

## 5. 진단 엔진

### 임계값 (시드값, `config/benchmarks.ts` 로 분리하여 튜닝 가능)

지난 대화 데이터 + 일반 Reels 벤치마크에서 도출한 시작값. `weight` 는 우선순위
계산용.

| 지표 | 🔴 약점 | 🟡 보통 | 🟢 강점 | weight |
|---|---|---|---|---|
| 3초 훅 잔존 | < 45% | 45–55% | > 55% | 5 |
| 완료율(avg/length) | < 30% | 30–50% | > 50% | 3 |
| 공유율 | < 0.4% | 0.4–0.8% | > 0.8% | 4 |
| 저장율 | < 0.3% | 0.3–0.6% | > 0.6% | 3 |
| 좋아요율 | < 1.5% | 1.5–3% | > 3% | 1 |
| 댓글율 | < 0.1% | 0.1–0.3% | > 0.3% | 2 |
| 팔로우 전환율 | < 0.4% | 0.4–0.8% | > 0.8% | 4 |

### 진단 로직 (결정론적)

```
각 지표 → 밴드 판정(weak/ok/strong)
강점 = strong 지표 목록
약점 = weak 지표 목록
우선순위 점수 = weight × (정규화된 벤치마크 하단 대비 갭)
  → 최고 점수 약점 = "이번 병목" (배너로 강조)
```

### 개인화 베이스라인 ("내 컨텐츠 최적화"의 핵심)

릴스가 **5개 이상** 쌓이면, 고정 글로벌 벤치마크 → **계정 자체의 롤링 중앙값**
대비 진단으로 자동 전환한다. "이 릴스는 네 평소보다 훅이 12%p 낮다" 처럼 계정
고유 기준으로 평가. 글로벌 임계값은 콜드스타트용.

### 텐션 저하 구간 탐지 (결정론 + LLM)

```
[결정론] 잔존 곡선에서 급락 구간 탐지:
  drop[i] = pct[i-1] - pct[i]
  임계 초과(예: > 8%p/초) 구간을 크기순 랭킹
  0~3초 훅 이탈은 별도 분리 보고
        ↓
[LLM] 각 급락 구간 [startSec, endSec] 와 겹치는 SRT 라인 매핑 →
  "8~10초, 22%p 이탈: 추상적 설명이 길어지는 구간" + 처방
```

대본 없이 곡선만 있으면 "어디서"까지, SRT가 있으면 "왜"까지 도출.

## 6. 추천 엔진

### 계층 1 — 룰 기반 플레이북 (결정론, 테스트 가능)

| 약점 플래그 | 자동 처방 |
|---|---|
| 훅 3초 < 45% | "도입 2~3초 컷, 가장 센 문장으로 콜드 오픈 + 궁금증 갭" |
| 공유율 < 0.4% | "공유 유발 한 줄(공감/저장각) 삽입" |
| 댓글율 < 0.1% | "엔딩에 의견 갈리는 질문 1개" |
| 팔로우 < 0.4% | "엔딩 3단(여운→정체성→이득형 CTA) + 다음편 떡밥 루프" |
| 완료율 낮음 | "급락 구간 컷 편집/속도 조절" |

### 계층 2 — LLM 맞춤 생성 (Claude API, Phase 3)

플레이북이 *무엇을* 정하면 LLM이 **실제 대본으로** 구체화:
- **3초 훅 3안** — SRT에서 가장 센 문장 추출 → 콜드 오픈 변형
- **엔딩 3안** — 여운형 / 떡밥형 / 질문형
- **텐션 저하 구간별 설명+처방** — 구간 초 + 대본 매핑
- **콘텐츠 코멘트** — 서사·카피 정성 평가

모델/SDK 사양:
- 기본 모델 `claude-opus-4-8` (vision 파싱 + 생성 모두). 파싱 비용 절감이
  필요하면 `claude-haiku-4-5` 옵션.
- 스크린샷 파싱: base64 이미지 블록 + `messages.parse()` + Zod 스키마로 구조화
  출력 (3초 훅, 잔존 곡선 좌표, 유입 소스).
- adaptive thinking (`thinking: {type: "adaptive"}`) 사용, `output_config.effort`
  로 조절.

## 7. 대시보드 UI

로컬 Next.js, 단일 스크롤 페이지. 색은 진단 밴드와 통일 (🔴🟡🟢).

```
┌──────────────────────────────────────────────────────────┐
│  [계정 헤더]  @계정 · 팔로워 1,234 (▲21) · 7일 reach ▁▂▄▆█ │ ← Phase2
├──────────────────────────────────────────────────────────┤
│  [릴스 선택 ▾]  창업가 인터뷰 #12 (53s)   [📷스샷] [📄SRT] │
├──────────────────────────────────────────────────────────┤
│  ⚡ 이번 병목:  훅 3초 잔존 35% — 도달이 여기서 막힘         │
│     (지난 3개 평균 대비 +7%p 개선)                         │
├───────────────┬───────────────┬──────────────────────────┤
│ 🟢 잘되는 점   │ 🔴 당장 개선   │  📊 지표 (벤치 대비 바)    │
├───────────────┴───────────────┴──────────────────────────┤
│  📉 잔존 곡선 + 텐션 저하 구간 (Recharts)                  │
│   [급락 구간 클릭 → 해당 SRT 라인 + 구간 처방 펼침]         │
├──────────────────────────────────────────────────────────┤
│  📈 성장 추이 (릴스 시간순 훅·공유율 등 + 델타 배지)        │
├──────────────────────────────────────────────────────────┤
│  💡 해결책: [훅 3안][엔딩 3안][구간 처방][콘텐츠 코멘트]    │
└──────────────────────────────────────────────────────────┘
```

### 컴포넌트 분해 (각자 단일 책임)

| 컴포넌트 | 책임 | 의존 |
|---|---|---|
| `AccountHeader` | 팔로워·reach 추이 | AccountSnapshot |
| `ReelPicker` + `IngestButtons` | 릴스 선택·스샷/SRT 업로드 | — |
| `BottleneckBanner` | 최우선 약점 1개 + 개선 맥락 | Diagnosis |
| `DiagnosisCards` | 강점/약점 리스트 | Diagnosis |
| `MetricBars` | 지표별 벤치 대비 바 | DerivedRates |
| `RetentionChart` | 곡선 + 급락 구간 하이라이트 | retentionCurve + dropSegments |
| `GrowthTrend` | 시간순 추이 + 델타 배지 | Reel[] 시계열 |
| `SolutionsPanel` | 훅/엔딩/구간/코멘트 탭 | 추천 엔진 출력 |

### 시각화 결정
- 차트: **Recharts** (곡선 + 영역 하이라이트, React 친화적).
- 색 = 진단 밴드 (🔴🟡🟢) — 직관적.
- 인터랙션: 곡선 급락 구간 클릭 → SRT 라인 + 처방.

## 8. 데이터 수집 워크플로우

### 스크린샷 입력 시점
릴스당 1회, 게시 후 성숙한 뒤(권장 3~7일, 인사이트 안정화 후). 한 번 넣으면
저장되며, 숫자 갱신을 원할 때만 재업로드.

### 캡처할 화면 (API가 못 주는 것만)
1. **잔존율 곡선** 화면 → retentionCurve + 3초 훅
2. **유입 소스** 화면 → Reels탭/탐색/홈 %
3. (Phase 1 한정) 지표 요약 화면 → 좋아요·댓글·공유·저장 (Phase 2부터 API 자동)

### 모바일 스크린샷 → 대시보드 (PC를 거치지 않음)
**선택: 폰에서 직접 업로드 (LAN 페이지).**
로컬 서버를 `0.0.0.0:3000` 으로 바인딩 → 폰 브라우저로 `http://<맥 LAN IP>:3000/upload`
접속 → 폰 스샷을 폰에서 바로 업로드. PC 전송 단계 제거.

### SRT 입력
CapCut 오토캡션 → SRT 내보내기 워크플로우. 표준 SRT 파싱:
```
1
00:00:00,000 --> 00:00:02,500
연구개발에 실패해서
  → { startSec: 0, endSec: 2.5, text: "연구개발에 실패해서" }
```

## 9. 사전 준비 (외부 의존성)

| 항목 | 용도 | 단계 |
|---|---|---|
| Meta 개발자 앱 + IG 비즈니스/크리에이터 계정(FB 페이지 연결) | Graph API 토큰 | Phase 2 |
| 장기 액세스 토큰 + IG Business 계정 ID | 자동 수집 | Phase 2 |
| Anthropic API 키 | 스샷 Vision 파싱 + 처방 생성 | **Phase 1부터** |

모든 키는 `.env.local` (gitignore), **서버 라우트에서만** 호출 (클라이언트 노출 0).
`.env.example` 제공.

## 10. 저장

`/data` 로컬 **JSON 파일 스토어** (릴스별 + 계정 스냅샷). 리포지토리 인터페이스
뒤에 두어 나중에 SQLite로 교체 가능. 릴스 수십 개 규모라 메모리 로드로 충분.
(gitignore)

## 11. 프로젝트 구조

```
instagram-dashboard/
├── app/
│   ├── page.tsx                    # 대시보드
│   ├── upload/page.tsx             # 모바일 LAN 업로드 페이지
│   └── api/{reels,parse-screenshot,recommend}/route.ts
├── lib/
│   ├── graph/                      # Graph API 클라이언트
│   ├── parsing/{srt.ts,screenshot.ts}
│   ├── analysis/                   # ★순수함수·TDD 핵심
│   │   ├── metrics.ts  diagnosis.ts  dropDetection.ts  baseline.ts
│   ├── recommend/                  # 플레이북 + LLM
│   ├── store/                      # 리포지토리(JSON→SQLite)
│   └── schemas/                    # Zod
├── components/                     # 7절의 UI
├── config/benchmarks.ts            # 임계값
├── data/                           # JSON 스토어 (gitignore)
└── __tests__/ + fixtures/
```

## 12. 테스트 전략

(사용자의 TDD 규칙 준수: 새 기능은 실패 테스트 먼저.)

- **단위(TDD 먼저):** SRT 파서 · 지표 계산 · 진단 엔진 · 급락 탐지 ·
  우선순위 랭킹 · 개인화 베이스라인 — 전부 순수함수.
- **픽스처:** 지난 6장 스샷의 실제 수치 + 샘플 SRT + 샘플 Graph 응답으로 회귀
  테스트.
- **LLM/Vision:** 출력은 Zod 스키마로 검증, 테스트는 녹화된 픽스처로 목킹
  (라이브 호출 안 함).
- **명령:** `npx jest` · `npx tsc --noEmit`.
- 결정론 코어 100% 테스트, LLM 호출만 목킹.

## 13. 비목표 (YAGNI)

- 경쟁/벤치마크 계정 비교 (후순위)
- Vercel 배포 / 공유 URL (로컬 우선)
- SQLite (JSON 스토어로 시작, 필요 시 교체)
- 릴스 외 콘텐츠 타입(피드/스토리) 분석

## 14. 성공 기준

- Phase 1: EDIT 스크린샷 + SRT를 넣으면 진단(강점/약점/병목) + 룰 기반 해결책 +
  잔존 곡선/지표 시각화가 즉시 표시된다.
- Phase 2: Graph API 연동 후 집계 지표와 팔로워/도달 추이가 자동 갱신된다.
- Phase 3: 릴스별 맞춤 훅/엔딩 스크립트와 구간 처방이 실제 대본 기반으로 생성된다.
- 릴스 5개 이상에서 개인화 베이스라인 + 성장 추이(델타)가 동작한다.
