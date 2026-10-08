# Camino — 스페인어 학습 기록 웹앱 · 구현 핸드오프

## 개요

Jake의 스페인어 로드맵(스페인 북부 이민, 약 2년 안에 B2)을 매일 실행하고 기록하는 개인용 웹앱이다. 앱을 열면 오늘 할 일이 바로 보이고, 체크 한 번으로 기록된다. 쌓인 기록과 진도, 월간 점검도 한곳에서 본다.

- 화면은 5개다: 오늘 · 기록 · 진도 · 월간 점검 · 설정.
- 할 일·자료·기준·문구는 모두 `data/spanish-plan.json`에서 읽는다. 계획 내용을 코드에 새로 쓰지 않는다.
- 첫 실행은 `data/sample-log.json`의 기록(2026-10-06)으로 시작한다.
- 서버는 없다. 기록은 브라우저 localStorage에 저장하고, JSON으로 내보내고 가져온다.
- 기기 간 동기화는 사용자의 GitHub 비공개 gist를 저장소로 쓴다. 브라우저에서 GitHub API를 직접 호출하고, 기기마다 gist 권한 토큰을 한 번 입력한다.

## 이 패키지에 대해

`reference/Camino.dc.html`은 **HTML로 만든 디자인 레퍼런스(동작하는 프로토타입)**다. 그대로 배포할 프로덕션 코드가 아니다. 이 화면과 동작을 실제 코드베이스에서 다시 구현하는 것이 목표다. 대상 저장소(`blackprown-jake/myspainjourney`)가 비어 있으므로 아래 '권장 구현 방향'의 스택으로 새로 만든다.

```
README.md                 이 문서(구현 명세)
CLAUDE.md                 Claude Code용 작업 규칙 요약
data/
  spanish-plan.json       학습 계획(읽기 전용, 앱에 그대로 포함)
  sample-log.json         첫 실행 시드 기록
design-system/            Wanted Design System 중 이 앱이 쓰는 부분
  styles.css              토큰 전체 @import
  tokens/*.css            디자인 토큰(CSS 변수)
  components/**/*.jsx     React 컴포넌트 원본 소스
  assets/icons/           Icon.jsx + icon-data.js(글리프 93개)
  assets/fonts/           PretendardVariable.woff2
  _ds_bundle.js           프로토타입 전용 번들(구현에는 쓰지 않음)
reference/
  Camino.dc.html          인터랙티브 프로토타입(모든 화면이 동작함)
  support.js              프로토타입 실행 런타임
```

### 프로토타입 여는 방법

패키지 루트에서 정적 서버를 띄운다. 파일을 더블클릭해서 열면 브라우저에 따라 막힐 수 있다.

```
npx serve .          # 또는: python3 -m http.server
→ http://localhost:<포트>/reference/Camino.dc.html
```

- 인터넷 연결이 필요하다. React 런타임과 Wanted Sans 폰트를 CDN에서 불러온다.
- 창 너비가 760px 미만이면 모바일 레이아웃으로 바뀐다.
- 프로토타입도 localStorage 키 `camino.v1`에 아래 명세와 같은 형식으로 저장한다. 프로토타입에서 내보낸 파일은 구현된 앱에서 그대로 가져올 수 있어야 한다.

## 충실도

**하이파이(Hi-fi).** 색, 타이포, 간격, 컴포넌트, 문구, 상호작용이 모두 확정안이다. 프로토타입과 같은 모습으로 구현하되, 컴포넌트는 `design-system/components`의 React 소스를 옮겨 쓴다.

## 권장 구현 방향

- **스택:** Vite + React + TypeScript, 정적 배포(GitHub Pages 등).
- **디자인 시스템:** `design-system/styles.css`를 전역으로 불러온다. `design-system/components/**`, `assets/icons/`의 JSX는 이미 React 컴포넌트이므로 import 경로만 맞춰 그대로 쓴다. 새 색·크기를 만들지 말고 토큰(`var(--…)`)만 쓴다.
- **계획 데이터:** `spanish-plan.json`을 빌드할 때 import하고 TypeScript 타입을 정의한다.
- **상태:** 저장 데이터 하나(`CaminoData`)를 관리하는 훅이나 스토어를 만든다. 바뀔 때마다 localStorage에 쓰고, `storage` 이벤트로 탭 사이를 동기화한다.
- **순수 로직:** 카드 생성, 요일 규칙, 연속일, 잔디 단계, 가져오기 병합은 UI와 분리한다. 아래 '검증 예시'를 단위 테스트로 쓴다.
- **동기화:** GitHub Gist 연동과 병합은 `src/lib/sync.ts`로 분리한다(아래 '기기 간 동기화').
- **로직 원본:** `reference/Camino.dc.html` 하단의 `class Component`에 있다. 주요 메서드:
  - 카드·안내: `cardsFor`, `rhythm`, `resInfo`, `buildDay`
  - 데이터: `importFile`, `exportData`, `fixMissing`, `makeDemo`
  - 동기화: `runSync`, `merge`, `stamp`, `readGist`, `findGist`, `connect`, `disconnect`
  - 파생 값 계산: `renderVals`

## 데이터

### 계획 파일 `spanish-plan.json` (읽기 전용)

| 필드 | 쓰는 곳 |
| --- | --- |
| `meta.startDate` | 기본 학습 시작일 |
| `meta.goal` | 진도 화면 부제 |
| `meta.principle` | 진도 화면 안내문 |
| `blocks[]` | `vocab` 단어 · `input` 대량 입력 · `structure` 구조 또는 집중 듣기 · `output` 말하기·쓰기. `structure`의 화면 이름은 "또는" 앞(구조)과 뒤(집중 듣기)를 상황에 따라 쓴다 |
| `modes[]` | `min` 최소판 15분 · `1h` 1시간판 60분 · `2h` 2시간판 120분. `blockMinutes`, `description` |
| `stages[]` | 0~4단계. `name`, `period`, `cumulativeHoursTarget`, `focus`, `tasks[block].{task, resources[]}`, `gate` |
| `weeklyRhythm[]` | 요일 규칙 |
| `dailyOrderTips[]` | 순서 안내 4개 |
| `exams[]` | DELE A2·B1·B2 |
| `monthlyReview.checklist[]` | 월말 체크리스트 4개 |
| `adjustmentRules[]` | 계획 조정 신호와 방법 5개 |
| `resources[]` | 자료 정보(`name`, `url`, `cost`, `howTo`) |

### 저장 데이터 — localStorage `camino.v1`

```ts
type BlockId = 'vocab' | 'input' | 'structure' | 'output' | 'review'; // review = 일요일 주간 점검
type ModeId = 'min' | '1h' | '2h';

interface CaminoData {
  version: 1;
  settings: { startDate: string; stage: number; defaultMode: ModeId }; // startDate: YYYY-MM-DD, stage: 0~4
  logs: DayLog[];                                // 날짜 오름차순
  gates: Record<string, boolean[]>;              // 단계 id → 넘어가는 기준 체크 상태(기준을 ' · '로 나눈 순서)
  monthly: Record<string, { checks: boolean[]; memo: string; signals: boolean[] }>; // 키: YYYY-MM
  updated?: Record<string, number>;              // 단위별 마지막 수정 시각(ms). 키: settings · gates · log:YYYY-MM-DD · monthly:YYYY-MM
}

interface DayLog {
  date: string;              // YYYY-MM-DD
  stage: number;             // 그날의 단계
  mode?: ModeId;             // 없으면 settings.defaultMode
  entries: { block: BlockId; task: string; minutes: number | null; note: string }[]; // 블록당 하루 1건
  reflection: { learned: string; difficult: string };
}
```

- `DayLog`는 sample-log.json과 같은 형식이다(`mode` 필드만 추가). `minutes: null`은 분을 아직 입력하지 않았다는 뜻이다.
- 저장된 데이터가 없으면 다음 값으로 시작한다:
  - `settings`: `{ startDate: plan.meta.startDate, stage: 0, defaultMode: '1h' }`
  - `logs`: sample-log.json의 `logs`
  - `gates`, `monthly`: 빈 객체 `{}`
- 날짜는 모두 로컬 시간 기준 `YYYY-MM-DD`이고, 한 주는 월요일부터 센다.
- `updated`는 동기화 병합에 쓴다. 로컬에서 저장할 때마다 이전 데이터와 단위별로 비교해, 바뀜 단위만 지금 시각으로 찍는다. 동기화 결과를 적용할 때는 찍지 않는다. 값이 없으면 0으로 본다.

### 내보내기·가져오기

- **내보내기:** `{ version: 1, exportedAt: ISO 시각, settings, logs, gates, monthly }`를 `camino-YYYY-MM-DD.json`으로 내려받는다.
- **검증:** `logs` 배열이 있어야 하고, 각 항목에 `date`(YYYY-MM-DD)와 `entries` 배열이 있어야 한다. 아니면 오류 Alert를 띄운다.
- **`settings` 객체가 있는 파일(내보낸 파일):** 전체를 교체한다. `settings`는 기존 값 위에 덮어쓰고, `logs`·`gates`·`monthly`는 파일 내용으로 바꾼다.
- **`logs`만 있는 파일(sample-log.json 형식):** 날짜 기준으로 기존 기록에 합친다. 같은 날짜는 가져온 기록으로 바꾼다.
- 가져온 뒤에는 `reflection` 기본값을 채우고 날짜순으로 정렬한다. 6초 동안 되돌릴 수 있다.

## 기기 간 동기화 (GitHub Gist)

서버 없이 사용자의 GitHub 비공개(secret) gist 하나를 저장소로 쓴다. 브라우저에서 GitHub REST API를 직접 호출한다.

### 연결 정보

- 기기마다 한 번, `gist` 권한만 있는 classic 토큰을 붙여 넣는다. 토큰 만들기 링크: `https://github.com/settings/tokens/new?scopes=gist&description=Camino`
- 기기별 연결 정보는 localStorage `camino.sync.v1`에 둔다. 기록(`camino.v1`)과 분리하고, 내보내기 파일이나 gist 내용에 넣지 않는다.

  ```ts
  interface SyncConfig {
    token?: string;          // 없으면 동기화 꺼짐
    login?: string;          // GitHub 계정
    gistId?: string | null;
    status?: 'syncing' | 'ok' | 'offline' | 'auth' | 'scope' | 'error';
    error?: string | null;
    lastSyncAt?: number;     // ms
    everSynced?: boolean;    // 이 기기에서 한 번이라도 동기화했는지
    lastMerged?: number;     // 마지막 동기화에서 원격에서 가져온 날 수
  }
  ```

- gist는 설명 "Camino 스페인어 학습 기록", 비공개(`public: false`), 파일 `camino-data.json` 하나다. 내용은 `CaminoData` 전체(JSON, 2칸 들여쓰기)다.
- 연결 정보가 바뀌면 같은 페이지의 다른 컴포넌트와 다른 탭도 상태를 다시 읽는다(커스텀 이벤트 + `storage` 이벤트).

### API

모든 요청에 `Authorization: Bearer {token}`, `Accept: application/vnd.github+json`, `cache: 'no-store'`를 쓴다. `no-store`가 없으면 GitHub API 응답이 브라우저에 60초간 캐시되어, 다른 기기가 방금 올린 내용을 못 볼 수 있다.

| 용도 | 요청 |
| --- | --- |
| 토큰 확인 | `GET /user` → `login` |
| gist 찾기 | `GET /gists?per_page=100&page=N`에서 `files['camino-data.json']`이 있는 첫 gist(최대 10쪽) |
| 읽기 | `GET /gists/{id}` → `files['camino-data.json'].content`. `truncated`면 `raw_url`을 받아 온다 |
| 만들기 | `POST /gists` `{ description, public: false, files: { 'camino-data.json': { content } } }` |
| 쓰기 | `PATCH /gists/{id}` `{ files: { 'camino-data.json': { content } } }` |

### 동기화 한 번 — `runSync()`

1. 토큰이 없으면 끝낸다. 이미 실행 중이면, 끝난 뒤 한 번 더 실행하도록 표시만 한다.
2. 상태를 `syncing`으로 바꾼다. `login`이 없으면 `GET /user`.
3. `gistId`가 있으면 읽는다(404면 `gistId`를 버린다). 없으면 찾는다.
4. 원격 데이터가 있으면 `merge(local, remote, preferRemoteOnTie = !everSynced)`.
5. 그사이 로컬 데이터가 바뀌었으면 결과를 쓰지 않고 다시 실행한다.
6. 병합 결과가 로컬과 다르면 localStorage에 쓰고, 화면이 다시 읽게 한다. 이때 `updated`를 새로 찍지 않는다.
7. gist가 없으면 만든다. 파일이 없거나 병합 결과가 원격과 다르면 PATCH한다.
8. `status: 'ok'`, `lastSyncAt`, `everSynced: true`, `lastMerged`를 저장한다.

**실행 시점**

- 앱을 열 때(0.3초 뒤)
- 창으로 돌아올 때(`focus`, `visibilitychange` → visible), 인터넷이 다시 연결될 때(`online`)
- 로컬에서 기록을 바꾼 뒤 2초(디바운스)
- 설정의 '지금 동기화', 오류 Alert의 '다시 시도'

예약이 겹치면 전역 타이머 하나로 합친다. 예시 데이터 모드에서는 동기화하지 않는다.

### 병합 규칙 — `merge(a, b, preferB)`

- 병합 단위는 `settings`, `gates`, 날짜별 `DayLog`, 달별 `monthly`다. 단위마다 `updated` 시각이 더 최근인 쪽을 통째로 쓴다(필드 단위 병합은 하지 않는다).
- 한쪽에만 있는 단위는 그대로 가져온다. 기록 날짜는 합집합이 된다.
- 시각이 같으면(둘 다 시각 없음 등) 로컬을 쓰되, 그 기기의 첫 동기화에서는 원격을 쓴다. 동기화 이전에 다른 기기에서 쌓은 기록이 새 기기의 시드 기록에 덮이지 않게 하기 위해서다.
- 체크 해제는 `entries`에서 빼는 것이라 날짜 단위는 남는다. 그래서 삭제 표시(tombstone)가 필요 없다.

### 오류 처리

| 상황 | status | 화면 |
| --- | --- | --- |
| 네트워크 실패이고 `navigator.onLine === false` | offline | 오프라인 안내. `online` 이벤트에 다시 시도 |
| 네트워크 실패(온라인) | error | "GitHub에 연결하지 못했어요." + 다시 시도 |
| 401 | auth | 토큰 다시 넣기 |
| 403 · 404 | scope | gist 권한 확인 |
| 그 외 | error | "HTTP {code}" + 다시 시도 |

### 연결·해제

- **연결:** `GET /user`로 토큰을 확인한다. 같은 계정이면 기존 `gistId`와 `everSynced`를 유지하고, 다른 계정이면 비운다. 이어서 `runSync()`를 실행하고, 성공하면 결과 Alert를 띄운다.
- **해제:** 이 기기의 `camino.sync.v1`만 지운다. 기록과 gist는 그대로 남는다. 6초 동안 되돌릴 수 있다.

### 보안

- 토큰은 그 브라우저의 localStorage에만 저장된다. gist 권한만 주고 만료일을 정하도록 안내한다.
- secret gist는 검색에 나오지 않지만, URL을 아는 사람은 볼 수 있다(암호화 아님). 학습 기록 수준의 내용만 저장한다.

## 계산 규칙

### 오늘 할 일 카드 — `cardsFor(date, stage, mode)`

**일요일**에는 평소 루틴 대신 카드 2장을 보여 준다.
1. 대량 입력: "즐기기용 영상이나 영화 1편"(일요일 activity의 ', ' 앞부분). 자료는 현재 단계의 input 자료, 목표는 max(5, 모드 총 시간 − 10)분.
2. 주간 점검(`review`): "주간 점검 10분". 목표는 문구 속 숫자인 10분.

결과적으로 최소판은 5+10분, 1시간판은 50+10분, 2시간판은 110+10분이다.

**그 외 요일**에는 `blocks` 순서대로 `modes[mode].blockMinutes[block]`분짜리 카드를 만들고, 0분인 블록은 만들지 않는다. 할 일과 자료는 `stages[stage].tasks[block]`에서 가져온다. 아래 경우는 다르게 처리한다.

- **월·수·금 + 2단계 이상:** `structure` 카드 이름을 "집중 듣기"로 바꾸고, 할 일은 월·수·금 activity("집중 듣기 세션: 1~2분 구간 받아쓰기 → 스크립트 비교 → 따라 말하기")로 한다.
- **토요일 + 정확히 2단계:** `output` 카드 할 일은 "튜터 수업 30~60분, 주간 일기", 목표는 max(모드의 output 분, 30)이다. 1시간판은 output이 0분이지만 토요일엔 30분 카드가 생긴다. 3단계부터는 튜터가 주 2회에 요일 자유라 평소 output 카드를 그대로 쓴다.
- **화·목:** 시간은 바꾸지 않고 안내 문구만 표시한다.
- **최소판:** 카드 할 일 문구를 모드 설명에서 가져온다. 첫 문장 "Anki 복습 + 쉬운 영상 1개"를 ' + '로 나눠 순서대로 넣으므로 단어는 "Anki 복습", 대량 입력은 "쉬운 영상 1개"가 된다.
- **추가 기록:** 기록은 있는데 오늘 카드 목록에 없는 블록(예: 모드를 바꾸기 전에 체크한 블록)은 "추가 기록" 태그를 단 카드로 뒤에 붙인다. 목표는 기록된 분이다.

### 요일 안내 문구 — `rhythm(date, stage)`

그 요일의 `weeklyRhythm` 항목을 보고 다음 순서로 정한다.

- **stage < fromStage:** `noteBeforeStage`가 있으면 그것을 쓰고, 없으면 표시하지 않는다.
  - 월·수·금 0~1단계: "0~1단계에서는 Language Transfer를 그대로 진행"
  - 토요일 0~1단계: 표시 없음
- **`note`가 있고 stage > fromStage:** `note`를 쓴다. 토요일 3단계부터는 "3단계부터 튜터는 주 2회(요일 자유)".
- **그 외:** `activity`를 쓴다.

표시 형식은 calendar 아이콘 + "**{X요일}** · {문구}"이다.

### 카드별 순서 팁

`dailyOrderTips` 중 "Anki"나 "Language Transfer"로 시작하는 팁을 카드에 붙인다.

- 카드의 할 일이나 자료 이름에 그 단어가 들어 있어야 한다.
- 할 일 문구에 팁 내용이 이미 들어 있으면 붙이지 않는다(예: 0단계 구조 카드).
- 첫 번째로 맞는 팁 하나만 붙이고, 체크 전 카드에만 보여 준다.

### 자료 정보 연결 — `resInfo(name)`

할 일의 자료 문자열을 `resources[]`의 자료와 연결한다. 괄호 안 내용을 빼고 소문자로 바꿔 아래 순서로 비교한다.
1. 이름이 같은 자료
2. 자료 문자열이 계획 자료 이름을 포함하면 그중 가장 긴 이름
3. 계획 자료 이름이 자료 문자열을 포함하면 그중 가장 짧은 이름

연결되면 사용법(`howTo`)·비용·링크를 펼쳐 볼 수 있다. 연결되지 않는 자료(예: "등급별 읽기책")는 이름만 보여 준다.

### 시간·연속일·잔디

- **누적 시간:** 모든 기록의 분 합계이고, `null`은 0으로 센다. 분이 비어 있는 기록 수는 따로 세서 안내한다.
- **공부한 날:** 기록(`entries`)이 1개 이상인 날이다. 분이 비어 있어도 공부한 날로 친다.
- **연속 학습일:** 오늘 공부했으면 오늘부터, 아직 안 했으면 어제부터 거꾸로 세어 공부한 날이 끊길 때까지의 일수다. 하루가 끝나기 전에는 연속을 끊지 않는다. 0일이면 "오늘 첫 기록을 남겨 보세요"를 보여 준다.
- **잔디 단계:**

  | 단계 | 조건 |
  | --- | --- |
  | 0 | 기록 없음 |
  | 1 | 1~29분(분 미입력 포함) |
  | 2 | 30~59분 |
  | 3 | 60~119분 |
  | 4 | 120분 이상 |

- **시간 표기(`fmt`):** 60분 미만은 "N분", 60분 이상은 "H시간 M분"(M이 0이면 "H시간").
- **기간:** 이번 주는 이번 주 월~일요일, 이번 달은 이번 달 1일~말일이다.

### 단계와 넘어가는 기준

- 넘어가는 기준 항목은 `stages[n].gate`를 " · "로 나눈 것이다(예: 2단계는 2개). 체크 상태는 `gates[n]`에 저장한다.
- **기준을 모두 체크하면 '다음 단계로'가 켜진다. 누적 시간은 참고 지표일 뿐 조건이 아니다.** 계획의 원칙("날짜가 아니라 기준으로")을 따른 것이다.
- 넘어가면 `settings.stage`가 1 오르고, 오늘 기록이 있으면 그 `stage`도 갱신한다. 되돌리기 토스트를 띄운다.
- 지난 날의 카드와 상세는 그날 기록의 `stage`·`mode`로 다시 계산한다. 오늘이나 기록이 없는 날은 현재 `settings.stage`를 쓴다.
- 통과한 단계의 통과 날짜는 그 단계보다 높은 `stage`가 처음 기록된 날이다.

### 월간 점검

**자동 감지.** 기준일은 그 달 말일과 오늘 중 이른 날이다. 기준일을 포함한 최근 14일의 공부한 날을 보고 다음 신호를 감지한다.
- "Anki 복습이 30분을 넘김": vocab 기록 중 30분을 넘긴 것이 하나라도 있을 때
- "2주 연속 최소판만 함": 공부한 날이 7일 이상이고 모두 최소판일 때

감지되면 신호 옆에 "최근 2주 기록에서 감지" 태그를 붙인다. 체크는 사용자가 직접 한다.

**그 달의 단계.** 그 달 말일까지의 마지막 기록의 `stage`다. 이번 달이면 현재 단계를 쓴다.

**체크리스트 보조 문구.**
- 1번: "이번 달 {fmt} · 누적 {x.x} / {목표}시간({n}단계 목표)". 누적은 그 달 말일까지 합한다.
- 4번: 그 단계의 `gate` 문구를 보여 주고, 아래에 '진도에서 확인' 버튼을 둔다.

## 화면

### 공통

**본문 영역**
- 앱 배경은 `--background-normal-alternative`(#F7F7F8)이고, 카드는 Card 컴포넌트(elevated, 흰 배경)를 쓴다.
- 본문 최대 너비는 1040px(설정 화면만 720px)이고 가운데 정렬한다.
- 위·좌우 padding은 `clamp(20px, 4cqw, 40px)`(본문 컨테이너 기준), 아래는 64px, 블록 사이 세로 간격은 20px이다.

**반응형.** 앱 루트 너비가 760px 미만이면 모바일 레이아웃이다.

**데스크톱 사이드바**
- 크기: 너비 232px, 흰 배경, 오른쪽 1px `--line-normal-alternative`. padding 28px 12px 20px, 세로 gap 28px.
- 로고: "Camino"(heading1 22px/700, `--label-strong`) + "스페인어 학습 기록"(caption1, `--label-alternative`). 좌우 padding 12px.
- 메뉴 5개: 높이 44px, radius 10px, padding 0 12px, gap 12px, 아이콘 22px, 글자 body2 15px.
  - 항목(아이콘): 오늘(home, 선택 시 home-fill) · 기록(calendar) · 진도(graduation) · 월간 점검(document-text) · 설정(setting)
  - 선택: 배경 `--blue-95`, 글자 `--blue-50`, 700
  - 미선택: `--label-neutral`, 500, hover `--fill-alternative`, press `--fill-normal`
- 하단(위 1px 구분선, padding-top 16px):
  - "{n}단계 · {이름}"(label2 600 `--label-neutral`)
  - "{누적 x.x} / {단계 목표}시간"(caption1 `--label-alternative`, tabular-nums)
  - 6px 진행 바(트랙 `--fill-normal`, 채움 `--blue-50`, 둥근 끝)

**모바일**
- 위 헤더: 56px, 흰 배경, 아래 1px 구분선, padding 0 8px 0 20px. "Camino"(headline1 18px/700)와 설정 IconButton.
- 아래: BottomNavigation 4탭(오늘·기록·진도·점검). 설정은 헤더 아이콘으로만 들어간다.

**되돌리기 토스트**
- 위치·모양: 하단 20px 가운데. 배경 `--inverse-background`, 글자 `--inverse-label` body2. radius 12px, padding 8px 8px 8px 18px, `--elevation-strong`.
- 오른쪽 "되돌리기" 버튼: `--inverse-primary`, label1 700, padding 8px 10px, radius 8px, hover rgba(255,255,255,0.08).
- 6초 뒤 사라진다.
- 문구: "{블록} 기록을 지웠어요" / "{n}단계를 시작했어요" / "{n}단계로 바꿨어요" / "기록을 가져왔어요".

**화면 제목**(기록·진도·월간 점검·설정)
- h1은 title2 28px/700/-0.012em `--label-strong`, 아래 부제는 body2 `--label-alternative`.
- 예시 데이터 모드에서는 제목 옆에 Tag(small) "예시 데이터"를 붙인다.

### 1. 오늘

**목적:** 열자마자 오늘 할 일을 보고, 체크로 기록한다.

**레이아웃:** 데스크톱은 2단이다. 왼쪽 본문(flex 999 1 440px)과 오른쪽 320px 열(순서 안내 + 오늘 배운 것), gap 24px. 모바일은 1단이다.

**왼쪽 열**(위에서부터, gap 20px)
1. **머리말**(gap 8px)
   - "{n}단계 · {단계 이름}"(label1 14px/600 `--blue-50`)
   - h1 "{M}월 {D}일 {X}요일"(title2)
   - 한 줄(label1 600, gap 6px 16px): fire 18 + "연속 {n}일"(`--green-30`) / clock 18 + "오늘 {기록 분} / {목표 분}분"(`--label-neutral`)
2. **모드 선택**
   - SegmentedControl large: "최소판 15분" / "1시간판" / "2시간판". 모바일에서는 전체 폭.
   - 아래에 모드 설명(label2 `--label-alternative`). 일요일엔 숨긴다.
   - 모드를 바꾸면 그날 기록의 `mode`로 저장되고, 카드가 바로 다시 구성된다. 새 날의 기본 모드는 `settings.defaultMode`.
3. **요일 안내 줄**(있을 때만): calendar 18(`--label-alternative`) + 문구(body2 `--label-neutral`).
4. **분 미입력 Alert**(cautionary, 있을 때만)
   - 제목 "분이 비어 있는 기록 {n}건", 본문 "공부한 시간이 비어 있어요. 목표 시간을 채워 두었으니 확인만 해 주세요.", 액션 "입력하기".
   - 액션을 누르면 가장 이른 미입력 기록의 입력 패널을 연다. 오늘 기록이 아니면 기록 화면으로 가서 그 날짜를 선택한다.
5. **완료 Alert**(positive, 기본 카드를 모두 체크했을 때): "오늘 할 일을 모두 마쳤어요" / "{n}분 공부했어요 · 연속 {s}일째".
6. **순서 안내 접이식 줄**(모바일만)
   - 흰 배경, 1px `--line-normal-alternative`, radius 12px, 높이 48px.
   - bulb 18(blue) + "순서 안내"(600) + 첫 팁 미리보기(말줄임, `--label-alternative`) + chevron-down/up.
   - 펼치면 번호 목록이 나온다.
7. **할 일 카드 목록**(gap 12px). 카드 하나는 Card padding 20px, 안쪽 가로 gap 16px이다.
   - **체크 버튼** 44×44, radius 12px
     - 미체크: 1.5px `--line-normal-strong` 테두리, 흰 배경, check 24px `--label-disable`. hover는 배경 `--fill-alternative`·아이콘 `--label-assistive`, press는 `--fill-strong`.
     - 체크: 배경 `--accent-foreground-green`, 흰 check 26px, 테두리 없음. hover는 inset overlay rgba(0,0,0,0.06), press는 0.12.
     - role="checkbox", aria-label "{블록} 완료로 표시" / "{블록} 완료 취소". 전환 120ms `--ease-standard`.
     - Checkbox 컴포넌트가 아니라 이 명세대로 만든 별도 버튼이다.
   - **본문**(gap 10px)
     - 첫 줄: 8px 블록 색 점 + 블록 이름(label2 600 `--label-alternative`) + (해당 시) "추가 기록" Tag small + 오른쪽 clock 16 + "{목표}분"(label1 600 `--label-neutral`).
     - 할 일: headline1 18px/600 `--label-strong`. 체크 후에는 `--label-alternative`.
     - 자료 목록: document-text 16 + 자료 이름(body2 `--label-neutral`, hover `--label-strong`) + 정보가 있으면 chevron 16.
       - 누르면 아래 패널이 펼쳐진다: 왼쪽 22px 들여쓰기, padding 12px 14px, radius 12px, 배경 `--background-normal-alternative`.
       - 패널 내용: howTo(body2, 줄높이 1.6) + 비용(caption1 `--label-alternative`) + "사이트 열기" 링크(external-link 14, label2 600 `--blue-50`, 새 탭).
       - 한 번에 하나만 열린다.
     - 순서 팁(체크 전에만): bulb 16 + 팁(label2 600 `--blue-50`).
     - 체크 후 기록 줄:
       - 분이 없으면 "분 입력 필요" Tag(orange), 있으면 check 16 + "{분}분 기록"(label1 600 `--green-30`).
       - 그 옆에 메모(label1 `--label-neutral`), 오른쪽에 "고치기" 텍스트 버튼(small, assistive, pencil).
     - 입력 패널(체크 직후 / 고치기): padding 16px, radius 12px, 배경 `--background-normal-alternative`.
       - TextField "공부한 시간(분)"(number, 128px)과 TextField "한 줄 메모"(placeholder "예: LT 3~4강, 새 카드 10장", 나머지 폭). gap 10px, 줄바꿈 허용.
       - 아래 오른쪽: "건너뛰기"(text assistive small) + "저장"(solid small).
8. **오늘 배운 것 카드**(모바일만, 아래와 같은 내용).

**오른쪽 열**(데스크톱만, gap 16px)
- **순서 안내** Card(outlined, padding 20px)
  - 머리: bulb 20(blue) + "순서 안내"(headline2 17px/600)
  - 번호 목록(gap 12px): 22px 원(배경 `--fill-normal`, caption1 600 `--label-neutral`) + 팁(body2 `--label-neutral`)
- **오늘 배운 것** Card(outlined, padding 20px, gap 14px)
  - 머리: write 20(`--accent-foreground-green`) + "오늘 배운 것"(headline2) + 오른쪽 "자동 저장"(caption1 `--label-alternative`)
  - TextField "배운 표현"(placeholder "예: 모음 e(mesa)") + TextField "어려웠던 점". 입력하는 즉시 저장된다.
  - 기본 카드를 다 끝냈거나 이미 내용이 있을 때만 보인다.

**동작**
- 체크하면 `{block, task: 카드 할 일, minutes: 목표, note: ''}`가 즉시 저장되고, 분에 목표 시간이 채워진 입력 패널이 열린다.
- 입력 패널의 '저장'은 분(0 이상의 숫자, 비우면 null)과 메모(앞뒤 공백 제거)를 저장한다. '건너뛰기'는 패널만 닫는다.
- 체크를 해제하면 기록을 지우고 되돌리기 토스트를 띄운다.
- 블록당 하루 1건만 남는다. 같은 블록을 다시 체크하면 교체된다.

### 2. 기록

**목적:** 쌓인 기록을 보고, 지난 날짜도 고친다.

1. **머리말**(양 끝 정렬, 줄바꿈 허용)
   - 왼쪽: 제목 "기록" + 부제 "날짜를 누르면 그날 한 일을 보고 고칠 수 있어요."
   - 오른쪽: 합계 2칸(사이 1px `--line-normal-normal` 구분, 각 padding 24px). "이번 주"·"이번 달"(label2 600 `--label-alternative`) + 합계(heading1 22px/700, tabular-nums) + "공부한 날 {n}일"(caption1).
2. **분 미입력 Alert:** 제목은 오늘 화면과 같고, 본문 "공부한 시간이 비어 있는 날을 차례로 열어 드릴게요.", 액션 "확인하기".
3. **학습 잔디(데스크톱)** — Card padding 24px
   - 머리줄: "학습 잔디"(headline2) + 기간 "{YYYY}년 {M}월 – {YYYY}년 {M}월"(label2 `--label-alternative`) + 오른쪽 IconButton small chevron-left/right("이전 기간"/"다음 기간").
   - 격자: 열이 주(32주), 행이 월~일이다. 왼쪽에 요일 라벨(caption2 11px 600). 칸은 20×20, radius 5px, gap 4px. 달이 바뀌는 열 위 18px에 "{M}월"을 표시한다.
   - 보이는 기간: 시작한 지 32주 미만이면 시작 주부터 32주, 아니면 이번 주로 끝나는 32주. 32주 단위로 이동하고, 시작 주보다 앞이나 이번 주보다 뒤로는 못 간다.
   - 칸 색: 단계 0~4는 `--fill-normal` / `--green-90` / `--green-70` / `--green-50` / `--green-30`.
     - 시작일 전: 투명, 비활성
     - 미래: `--fill-alternative`, 비활성
     - 선택한 날: 바깥 2px `--label-normal` 링 / 오늘: 안쪽 2px `--blue-50` 링
     - title·aria-label: "{M}월 {D}일 {요일} · {fmt}"
   - 범례(caption1 `--label-alternative`, 12px 칸, radius 3px): 0분 · 1~29분 · 30~59분 · 60~119분 · 120분 이상. 오른쪽에 "최소판 15분도 공부한 날로 칠해요".
4. **학습 잔디(모바일)** — Card padding 16px, 월 달력
   - 머리줄: IconButton chevron("이전 달"/"다음 달", 시작 달부터 이번 달까지) + "{YYYY}년 {M}월"(headline2).
   - 7열 그리드, gap 4px, 월요일 시작. 칸은 정사각형(최소 높이 44px), radius 10px, 날짜 숫자 label1 600.
   - 단계 3 이상 칸은 흰 글자, 미래·시작 전 칸은 `--label-assistive` 글자. 색과 링 규칙은 데스크톱과 같고, 아래에 범례를 둔다.
5. **아래 2단**(gap 20px, 줄바꿈 허용)
   - **날짜 상세** Card(padding 24px, flex 999 1 420px). 기본 선택은 오늘이다.
     - 머리
       - 왼쪽: "{오늘 · }{n}단계 · {모드 이름}"(label2 600 `--label-alternative`) + "{M}월 {D}일 {X}요일"(heading1 700)
       - 오른쪽: 총 시간(heading2 20px/700) + "{체크 수} / {카드 수} 완료"(caption1)
     - 빈 상태 문구
       - 미래: "아직 오지 않은 날이에요."
       - 시작 전: "학습을 시작하기 전이에요."
       - 기록 없음: "기록이 없는 날이에요. 공부했다면 체크해서 남겨 두세요."
     - 카드 목록(각 행 위 1px 구분선, padding 14px 0)
       - 체크 버튼: 오늘 화면과 같은 44px 버튼. 지난 날도 체크·해제할 수 있다.
       - 블록 점과 이름, 오른쪽 "목표 {n}분"(label2).
       - 할 일(body1 16px): 체크된 항목은 기록된 `task` 문구(600 `--label-strong`), 미체크 항목은 계획 할 일(`--label-alternative`).
       - 기록 줄: 분 Tag 또는 "{n}분"(label1 600 `--green-30`) + 메모 + "고치기".
       - 입력 패널: 오늘 화면과 같고, 버튼만 "닫기" / "저장".
     - 배운 것(위 구분선, padding-top 16px). 기록이 있거나 내용이 있는 날만 보인다.
       - 머리: write 18 + "배운 것"(headline2) + 오른쪽 "고치기"(내용 없으면 "남기기"). 편집 중에는 "완료".
       - 보기: 2열 그리드로 "배운 표현" / "어려웠던 점"(label2 600 `--label-alternative`) + 내용(body2, 줄높이 1.6, 비면 "—"). 둘 다 비면 "아직 남긴 내용이 없어요."
       - 편집: TextField 2개, 입력하는 즉시 저장.
   - **블록별 시간** Card(padding 24px, flex 1 1 300px)
     - 머리: "블록별 시간"(headline2) + SegmentedControl small "이번 주 / 이번 달 / 전체"(기본 이번 달).
     - "총 {fmt}"(heading1 700).
     - 막대: 높이 12px, 둥근 끝, 세그먼트 사이 3px, 블록 색, 분 비율대로.
     - 목록(행 위 1px 구분선, padding 10px 0): 10px 색 점 + 블록 이름(body2, word-break: keep-all) + "{fmt}"(label1 600 `--label-neutral`) + "{%}"(label2, 40px 오른쪽 정렬). 주간 점검 행은 0분보다 클 때만 보인다.
     - 기간 합계가 0분이면 "이 기간에 기록된 시간이 아직 없어요."를 보여 준다. 분 미입력 기록이 있으면 " 비어 있는 분을 채우면 여기에 나타나요."를 덧붙인다.

### 3. 진도

**목적:** 지금 단계와 넘어가는 기준을 확인하고 다음 단계로 넘어간다.

1. **제목** "진도" + 부제 `meta.goal`.
2. **분 미입력 Alert:** 본문 "분이 비어 있는 기록은 누적 시간에 들어가지 않아요.", 액션 "확인하기".
3. **지금 단계** Card(padding 24px, 2단 gap 28px 48px, 각 열 flex 1 1 320px)
   - **왼쪽**
     - "지금 단계 · {period}"(label1 600 blue)
     - "{n}단계 · {name}"(title3 24px/700)
     - focus(body2, 줄높이 1.6, `--label-neutral`)
     - "누적 공부 시간"(label2 600) + "{x.x}시간"(title2 700, tabular) + "/ {목표}시간"(body1 600 `--label-alternative`)
     - 10px 진행 바(blue, 너비 전환 200ms)
   - **오른쪽**
     - "넘어가는 기준"(headline2)
     - 기준 행: button role=checkbox, 최소 높이 48px, padding 12px 8px, 좌우 margin −8px, radius 10px, hover `--fill-alternative`, press `--fill-normal`. 안에 Checkbox + 기준 문구(body1).
     - 하단(위 구분선, padding-top 14px):
       - Button large "다음 단계로"(icon-right arrow-right). 기준을 다 채우기 전에는 disabled.
       - 상태 문구: "기준을 모두 채웠어요"(label1 600 `--green-30`) / "기준 {n}개가 남았어요"(`--label-alternative`)
       - `meta.principle`(caption1)
     - 마지막 단계에서는 버튼을 보여 주지 않는다.
4. **전체 로드맵** Card(padding 24px)
   - 머리: "전체 로드맵"(headline2) + 오른쪽 "누적 {x.x} / 1,080시간"(label2).
   - 단계 행: 왼쪽 32px 타임라인 + 오른쪽 내용, gap 16px.
   - **원 32px**
     - 통과: `--accent-foreground-green` 배경 + 흰 check 18
     - 현재: `--blue-50` 배경 + 흰 단계 번호(label1 700)
     - 이후: 흰 배경 + 1.5px `--line-normal-normal` 테두리 + 번호(600 `--label-alternative`)
   - **원 사이 세로선:** 2px, 위아래 6px 여백. 통과 구간은 `--accent-foreground-green`, 그 외는 `--line-normal-normal`.
   - **내용**(padding-top 4px, gap 6px)
     - "{n}단계 · {name}"(body1 700, 현재 단계는 `--blue-50`) + "{period} · 누적 {목표}시간"(label2) + 오른쪽 상태("진행 중" blue / "{M}월 {D}일 통과" `--green-30`, label2 600)
     - focus(body2 `--label-neutral`)
     - "넘어가는 기준 · {gate}"(label2 `--label-alternative`)
     - 시험이 있는 단계: Tag(primary) "DELE A2" 등 + target(label2 600) + note(label2)
     - 행 아래 20px 간격

### 4. 월간 점검

**목적:** 한 달에 한 번 돌아보고 계획을 조정한다.

1. **머리**
   - 왼쪽: 제목 "월간 점검" + 부제 "한 달에 한 번, 이번 달을 돌아보고 계획을 조정해요."
   - 오른쪽: 달 이동. IconButton chevron-left + "{YYYY}년 {M}월"(headline2, 최소 112px 가운데) + chevron-right. 시작 달부터 이번 달까지 이동할 수 있다.
2. **2단**(gap 20px). 왼쪽 열은 flex 999 1 420px, gap 20px.
   - **월말 체크리스트** Card(padding 24px)
     - 머리: "월말 체크리스트"(headline2) + 오른쪽 "{n} / 4"(label2 600).
     - 4개 행(위 1px 구분선, button role=checkbox, 최소 52px, padding 14px 8px): Checkbox + 문구(body1) + 보조 문구(label2, 1번·4번만. '계산 규칙 › 월간 점검' 참조).
     - 4번 아래에 "진도에서 확인" 텍스트 버튼(small, chevron-right)을 두고, 누르면 진도 화면으로 간다.
   - **이번 달 메모** Card(padding 24px, gap 10px)
     - "이번 달 메모"(headline2)
     - textarea: 최소 높이 112px, padding 12px 14px, radius 12px, 1.5px 테두리 `--wt-border-solid`(포커스 시 `--wt-primary`), 15px/1.5, 세로 리사이즈, placeholder "예: 지난달보다 영상이 잘 들림, 녹음에서 r 발음이 어색함"
     - "자동 저장 · 달마다 따로 남아요"(caption1)
   - **계획 조정** Card(오른쪽 열, padding 24px, flex 1 1 300px)
     - 머리: "계획 조정"(headline2) + "해당하는 신호를 고르면 조정 방법을 알려 드려요."(label2).
     - `adjustmentRules` 5개 행: Checkbox + 신호(body2) + (감지 시) Tag orange small "최근 2주 기록에서 감지".
     - 체크하면 아래에 조정 방법 박스가 열린다: 왼쪽 34px 들여쓰기, padding 12px 14px, radius 12px, 배경 `--blue-95`. arrow-right 16 blue + 조정 문구(body2 600).
3. 체크리스트·메모·신호는 `monthly["YYYY-MM"]`에 달마다 따로 저장한다.

### 5. 설정

본문 최대 너비 720px.

1. **제목** "설정" + 부제 "학습 계획과 기록 데이터를 관리해요."
2. **예시 데이터 알림**(예시 데이터 모드에서만): Alert info "예시 데이터를 보고 있어요" / "여기서 바꾼 내용은 저장되지 않아요."
3. **결과 알림:** 내보내기·가져오기 결과를 Alert(positive/negative)로 보여 준다. 다른 화면으로 가면 사라진다.
4. **기기 간 동기화** Card(padding 24px, gap 16px). 설정의 첫 카드다.
   - **머리:** "기기 간 동기화"(headline2) + "GitHub 비공개 gist에 기록을 저장해 휴대폰과 PC의 기록을 자동으로 맞춰요."(label2 `--label-alternative`). 오른쪽에 상태 표시(8px 점 + label2 600):

     | 상태 | 문구 | 글자 색 | 점 색 |
     | --- | --- | --- | --- |
     | 토큰 없음 | 꺼짐 | `--label-alternative` | `--label-assistive` |
     | syncing | 동기화 중 | `--blue-50` | `--blue-50` |
     | ok | 동기화됨 | `--green-30` | `--status-positive` #00BF40 |
     | offline | 오프라인 | `--orange-30` #9C5800 | `--status-cautionary` #FF9200 |
     | auth · scope · error | 확인 필요 | `--red-40` #E52222 | `--status-negative` #FF4242 |

   - **연결 전**(auth·scope 상태에서도 이 폼을 보여 줌)
     - 번호 단계 2개(22px 번호 원 + body2 `--label-neutral`):
       1. "GitHub에서 gist 권한만 있는 토큰을 만들어요." + "토큰 만들기" 링크(external-link 14, 새 탭)
       2. "만든 토큰을 붙여 넣고 연결해요. 기기마다 한 번씩 하면 돼요."
     - TextField "GitHub 토큰"(type password, placeholder "ghp_로 시작하는 토큰", flex 1 1 200px) + Button medium. 아래 끝 정렬, 좁으면 줄바꿈.
       - 버튼 문구: "연결", 연결 중에는 "연결 중…", 토큰이 있는데 auth·scope면 "다시 연결".
       - 입력이 비었거나 연결 중이면 disabled.
     - 캐션: "토큰은 이 브라우저에만 저장되고 내보내기 파일에는 들어가지 않아요."
   - **연결됨**
     - 2열 정보(라벨 label2 600 `--label-alternative` / 값 body2 `--label-normal`):
       - 계정: "@{login}"
       - 저장 위치: "비공개 gist · camino-data.json" + "열기" 링크(`https://gist.github.com/{login}/{gistId}`)
       - 마지막 동기화: "방금 전" / "N분 전" / "오늘 HH:MM" / "M월 D일 HH:MM". 30초마다 갱신하고, 기록이 없으면 "아직 없음".
     - 캐션: "앱을 열 때, 다른 창에서 돌아올 때, 기록을 바꾸고 2초 뒤에 자동으로 맞춰요. 같은 날을 두 기기에서 고치면 나중에 고친 쪽이 남아요."
     - 버튼:
       - Button outlined assistive "지금 동기화"(refresh 아이콘, 동기화 중 disabled)
       - Button text assistive "연결 해제"(토스트 "이 기기의 동기화를 해제했어요" + 되돌리기)
   - **카드 안 Alert:** 상태 문제(offline·auth·scope·error)를 먼저 보여 주고, 없으면 연결 결과 메시지를 보여 준다.

     | 상황 | tone | 제목 | 본문 | 액션 |
     | --- | --- | --- | --- | --- |
     | 연결 성공 | positive | 동기화를 연결했어요 | @{login} 계정의 비공개 gist에 기록을 저장해요.(합친 날이 있으면 " 다른 기기의 기록 {n}일을 합쳤어요.") | — |
     | 연결 실패 | negative | 연결하지 못했어요 | 401: 토큰이 맞지 않아요. 복사한 토큰 전체를 붙여 넣었는지 확인해 주세요. · 네트워크: GitHub에 연결하지 못했어요. 인터넷 연결을 확인해 주세요. · 그 외: 잠시 후 다시 시도해 주세요. (HTTP {code}) | — |
     | offline | cautionary | 오프라인이에요 | 기록은 이 기기에 먼저 저장하고, 인터넷에 연결되면 자동으로 올려요. | — |
     | auth | negative | 토큰을 다시 넣어 주세요 | 토큰이 만료됐거나 삭제됐어요. 새 토큰을 만들어 붙여 넣으면 이어서 동기화해요. | — |
     | scope | negative | gist 권한이 없는 토큰이에요 | 토큰을 만들 때 gist 항목을 체크했는지 확인해 주세요. | — |
     | error | negative | 동기화하지 못했어요 | {오류} · 잠시 후 다시 시도해 주세요. | 다시 시도 |

   - **예시 데이터 모드:** 상태 "꺼짐"과 "예시 데이터에서는 동기화하지 않아요."만 보여 준다.
5. **학습 계획** Card(padding 24px, gap 22px)
   - "학습 계획"(headline2)
   - TextField type=date "학습 시작일"(최대 240px) + 캡션 "기록 화면의 잔디가 이 날짜부터 시작해요."
   - "기본 모드"(14px 600) + SegmentedControl(medium) + 캡션 "새 날을 열 때 이 모드로 시작해요. 오늘 화면에서 고른 모드는 그날만 적용돼요."
6. **현재 단계** Card
   - "현재 단계" + 설명 "보통은 진도 화면에서 기준을 채우고 넘어가요. 잘못 넘어갔거나 이미 알고 있는 단계가 있을 때 여기서 바꿔요."
   - 5개 행(button role=radio, 최소 56px): Radio + "{n}단계 · {name}"(body1 600) + "{period} · 누적 {목표}시간"(label2).
   - 바꾸면 되돌리기 토스트를 띄운다.
7. **데이터** Card(gap 16px)
   - "데이터" + "저장된 기록 {n}일 · 누적 {x.x}시간"(body2 `--label-neutral`)
   - 버튼: Button outlined assistive "내보내기"(download 아이콘), "가져오기"(upload 아이콘, 숨은 file input, `.json`만)
   - 안내(caption1 목록):
     - 동기화를 켜지 않으면 기록은 이 브라우저에만 저장돼요. 기기를 바꾸거나 브라우저 데이터를 지우기 전에 내보내 두세요.
     - 내보낸 파일을 가져오면 전체가 그 파일로 바뀌어요.
     - sample-log.json처럼 logs만 있는 파일은 기존 기록에 합쳐지고, 같은 날짜는 가져온 기록으로 바뀌어요.
   - 결과 문구(제목 / 본문):

     | 상황 | 제목 | 본문 |
     | --- | --- | --- |
     | 가져오기 성공 | 기록 {n}일을 가져왔어요 | 내보낸 파일로 전체를 바꿨어요. / 같은 날짜는 가져온 기록으로 바꿨어요. |
     | 가져오기 실패 | 가져오지 못했어요 | logs 배열이 있는 JSON 파일인지 확인해 주세요. |
     | 내보내기 성공 | 기록을 내보냈어요 | {파일명} 파일로 저장했어요. |
     | 내보내기 실패 | 내보내지 못했어요 | 브라우저에서 다운로드를 막고 있는지 확인해 주세요. |

## 상호작용·상태 요약

**UI 상태(저장하지 않음)**
- 현재 화면
- 열린 입력 패널(`날짜|블록`)과 초안(분, 메모)
- 모바일 순서 안내 펼침 여부, 펼친 자료 1개
- 되돌리기(문구, 실행 함수, 6초)
- 기록 화면: 선택 날짜, 달력의 달, 잔디 페이지, 비율 기간
- 배운 것을 편집 중인 날짜
- 월간 점검의 달
- 설정 결과 메시지
- 동기화: 토큰 입력값, 연결 중 여부, 연결 결과 메시지(연결 상태 자체는 `camino.sync.v1`에 저장)

**그 외 규칙**
- 화면을 옮기면 입력 패널, 배운 것 편집, 설정 메시지를 닫는다.
- 모션은 상태 전환에만 쓴다. 120ms(`--duration-fast`) 또는 200ms(`--duration-normal`), `cubic-bezier(0.4, 0, 0.2, 1)`. 튀거나 커지는 효과는 없다.
- 저장할 때마다 localStorage에 쓰고, 다른 탭에서 바뀌면 `storage` 이벤트로 다시 읽는다.

## 디자인 토큰

모두 `design-system/tokens/*.css`에 CSS 변수로 들어 있다. 라이트 테마 값이다.

**색**

| 토큰 | 값 | 쓰는 곳 |
| --- | --- | --- |
| `--blue-50` | #0066FF | 주요 동작, 현재 단계, 링크, 선택 메뉴 |
| `--blue-40` | #0054D1 | 링크 hover |
| `--blue-95` | #EAF2FE | 선택 메뉴 배경, 조정 방법 박스 |
| `--green-30` | #006E25 | 연속일·기록 분·완료 문구, 잔디 4단계 |
| `--green-50` | #00BF40 | 잔디 3단계 |
| `--green-70` | #49E57D | 잔디 2단계 |
| `--green-90` | #ACFCC7 | 잔디 1단계 |
| `--accent-foreground-green` | #009632 | 체크된 버튼, 통과한 단계, 배운 것 아이콘 |
| `--accent-foreground-violet` | #5B37ED | 블록: 단어 |
| `--accent-foreground-cyan` | #0098B2 | 블록: 대량 입력 |
| `--accent-foreground-orange` | #D17600 | 블록: 구조 / 집중 듣기 |
| `--accent-foreground-pink` | #E846CD | 블록: 말하기·쓰기 |
| `--line-solid-strong` | #AEB0B6 | 블록: 주간 점검 |
| `--label-strong` | #000000 | 제목, 할 일 |
| `--label-normal` | #171717 | 본문, 선택한 날 링 |
| `--label-neutral` | rgba(46,47,51,0.88) | 보조 본문 |
| `--label-alternative` | rgba(55,56,60,0.61) | 라벨, 캡션 |
| `--label-assistive` | rgba(55,56,60,0.28) | 비활성 날짜, 체크 버튼 hover 아이콘 |
| `--label-disable` | rgba(55,56,60,0.16) | 미체크 아이콘 |
| `--background-normal-normal` | #FFFFFF | 카드, 사이드바, 헤더 |
| `--background-normal-alternative` | #F7F7F8 | 앱 배경, 입력·자료 패널 |
| `--fill-normal` | rgba(112,115,124,0.08) | 진행 바 트랙, 잔디 0단계, 번호 원, press |
| `--fill-alternative` | rgba(112,115,124,0.05) | hover, 미래 날짜 |
| `--fill-strong` | rgba(112,115,124,0.16) | 체크 버튼 press |
| `--line-normal-normal` | rgba(112,115,124,0.22) | 구분선, 타임라인 |
| `--line-normal-alternative` | rgba(112,115,124,0.08) | 행 구분선, 사이드바 경계 |
| `--line-normal-strong` | rgba(112,115,124,0.52) | 미체크 버튼 테두리 |
| `--inverse-background` | #1B1C1E | 토스트 배경 |
| `--inverse-label` | #F7F7F8 | 토스트 글자 |
| `--inverse-primary` | #3385FF | 토스트 버튼 |
| `--static-white` | #FFFFFF | 색 배경 위 아이콘·숫자 |
| `--wt-border-solid` / `--wt-primary` / `--wt-text` | #E1E2E4 / #0066FF / #171717 | 메모 textarea |

**타이포그래피**

- 글꼴: `--font-sans` = "Wanted Sans Variable" → "Pretendard Variable" → 시스템 글꼴.
- 합계·누적·비율 숫자는 `font-variant-numeric: tabular-nums`.

| 토큰 | 크기 / 줄높이 / 자간 | 굵기 | 쓰는 곳 |
| --- | --- | --- | --- |
| title2 | 28px / 1.357 / −0.012em | 700 | 화면 제목, 오늘 날짜, 누적 시간 |
| title3 | 24px / 1.334 / −0.012em | 700 | 진도 현재 단계 |
| heading1 | 22px / 1.364 / −0.011em | 700 | 로고, 기록 합계, 날짜 상세 제목 |
| heading2 | 20px / 1.4 | 700 | 상세 총 시간 |
| headline1 | 18px / 1.444 / −0.002em | 600 | 할 일 제목(모바일 로고는 700) |
| headline2 | 17px / 1.412 | 600 | 카드 제목 |
| body1 | 16px / 1.5 | 400–700 | 기준, 체크리스트, 로드맵 단계명 |
| body2 | 15px / 1.467(읽기용 1.6) | 400–600 | 본문, 메뉴 |
| label1 | 14px / 1.429 | 600 | 단계 라벨, 상태 문구 |
| label2 | 13px / 1.385 | 400–600 | 블록 이름, 보조 문구 |
| caption1 | 12px / 1.334 / 0.0252em | 400–600 | 캡션, 범례 |
| caption2 | 11px | 600 | 잔디 요일·달 라벨 |

**모양·간격·그림자**

- **둥근 모서리:**

  | 대상 | radius |
  | --- | --- |
  | 체크 버튼, 입력·자료·조정 패널, 토스트 | 12px |
  | 메뉴, 행 버튼, 모바일 달력 칸 | 10px |
  | 잔디 칸 | 5px |
  | 범례 칸 | 3px |
  | 진행 바, 점, 번호 원 | 999px(완전히 둥글게) |
  | Card | 컴포넌트 기본값 |

- **간격:** 4px 그리드. 카드 padding은 16/20/24px, 블록 사이 gap은 20px(카드 목록 12px).
- **그림자:** Card는 컴포넌트 기본값. 토스트는 `--elevation-strong`(0 2px 8px rgba(23,23,25,0.10), 0 8px 24px rgba(23,23,25,0.08)).

## 컴포넌트 (`design-system/components`)

Props는 각 JSX 파일 상단 주석과 코드에 있다.

| 컴포넌트 | 쓰는 곳 |
| --- | --- |
| Card | 모든 카드. 기본 elevated, 순서 안내·오늘 배운 것은 `variant="outlined"`. padding 8/16/20/24 |
| Button | solid: 저장, 다음 단계로 · text+assistive: 건너뛰기, 고치기, 닫기 · outlined+assistive: 내보내기, 가져오기 · text: 완료, 진도에서 확인. `size` small/medium/large, `iconLeft`/`iconRight`, `disabled` |
| IconButton | 모바일 헤더 설정, 잔디·달력·월 이동 chevron(`size` small/medium) |
| SegmentedControl | 오늘 모드(large), 기본 모드(medium), 블록 비율 기간(small). `items: {value, label}[]`, `fullWidth` |
| TextField | 분(number), 메모, 배운 표현, 어려웠던 점, 학습 시작일(date) |
| Alert | cautionary: 분 미입력 · positive: 완료, 가져오기 성공 · negative: 실패 · info: 예시 데이터. `title`, `action` + `onAction` |
| Tag | 기본 small: "예시 데이터", "추가 기록" · orange: "분 입력 필요", "최근 2주 기록에서 감지" · primary: DELE |
| Checkbox | 넘어가는 기준, 월말 체크리스트, 계획 조정 신호. 행 전체가 버튼이고 Checkbox는 표시만 한다 |
| Radio | 설정의 현재 단계. 행 전체가 버튼 |
| BottomNavigation | 모바일 하단 4탭. `items: {value, label, icon, activeIcon}[]` |
| Icon | 아래 아이콘 목록 |

## 에셋

- **아이콘**(`assets/icons/icon-data.js`, 24×24, `currentColor`): home, home-fill, calendar, graduation, document-text, setting, fire, clock, check, bulb, chevron-down/up/left/right, external-link, pencil, write, arrow-right, download, upload
- **글꼴:** Wanted Sans는 `tokens/fonts.css`에서 jsDelivr CDN으로 불러온다(배포 시 자체 호스팅 권장). Pretendard Variable은 `assets/fonts`에 들어 있다.
- 이미지는 쓰지 않는다.

## 검증 예시 (테스트 케이스)

**할 일 카드**
- **2026-10-06(화) · 0단계 · 1시간판:** 단어 15분 "Anki 새 카드 10장(발음 덱 → 기초 50단어)" / 대량 입력 30분 / 구조 15분 "Language Transfer 1~2강. …".
  - 안내 문구: "화요일 · 대량 입력 비중 확대, 구조 학습".
  - 단어 카드 팁: "Anki 복습(초록 카드)부터 처리하고 새 카드로 넘어가기". 구조 카드에는 팁이 없다.
- **같은 날 최소판:** 단어 8분 "Anki 복습" / 대량 입력 7분 "쉬운 영상 1개".
- **같은 날 2시간판:** 20 / 60 / 25분 + 말하기·쓰기 15분 "발음 덱 예시 단어를 듣고 소리 내 따라 말하기".
- **일요일 · 1시간판(단계 무관):** 대량 입력 50분 "즐기기용 영상이나 영화 1편" + 주간 점검 10분 "주간 점검 10분". 모드 설명은 숨긴다.
- **2027-02-15(월) · 2단계 · 1시간판:** 세 번째 카드가 "집중 듣기" 15분이 되고, 할 일은 집중 듣기 세션 문구다.
- **2027-02-20(토) · 2단계 · 1시간판:** 말하기·쓰기 30분 "튜터 수업 30~60분, 주간 일기"가 더해져 4장·90분이 된다.

**첫 실행(시드만 있을 때)**
- 공부한 날 1일(10/6), 누적 0시간, 분 미입력 2건 배너가 뜬다.
- 10/6 당일 기준 연속 1일이다.

**잔디 단계:** 15분 → 1, 45분 → 2, 60분 → 3, 120분 → 4. 기록은 있지만 분이 null이면 → 1.

**단계 넘어가기:** 2단계 기준 "DELE A2 모의고사 합격선 · 학습자용 팟캐스트 대부분 이해"는 체크 항목 2개가 된다. 둘 다 체크하면 누적 시간과 관계없이 '다음 단계로'가 켜진다.

**가져오기**
- sample-log.json(logs만 있음)을 가져오면 기존 기록에 합쳐진다.
- 내보낸 파일을 가져오면 settings·gates·monthly까지 전체가 교체된다.

**동기화 병합**
- 로컬 10/6(`updated` 100)과 원격 10/6(200) → 원격 10/6이 남는다.
- 로컬에만 10/7, 원격에만 10/8 → 둘 다 남는다.
- 양쪽 10/6 모두 `updated` 없음 → 그 기기의 첫 동기화면 원격, 이후에는 로컬이 남는다.
- `monthly["2026-10"]`이 원격에서 더 최근 → 원격의 메모·체크가 남는다.
- 동기화 결과를 적용한 뒤에는 `updated`가 바뀌지 않는다(다시 올릴 때 서로 덮어쓰지 않음).

## 알려진 제한·결정 사항

**사용자가 정한 것**
- 화·목 '대량 입력 비중 확대'는 계획에 수치가 없어 안내 문구로만 표시한다.
- 일요일은 평소 루틴을 대체한다.
- 다음 단계 조건은 기준 체크뿐이다. 누적 시간은 참고용이다.

**계획에 수치가 없어 기본값으로 정한 것**
- 일요일 영상 시간: 모드 총 시간 − 10분
- 토요일 튜터 수업: 30분

**동기화의 한계**
- 실시간이 아니다. 앱을 열 때, 돌아올 때, 바꾸고 2초 뒤에 맞춘다.
- 동기화 전에 같은 단위(같은 날, 같은 달 점검, 설정, 기준 체크)를 두 기기에서 각각 고치면 나중에 고친 쪽만 남는다.
- 기기마다 토큰을 넣어야 하고, 토큰이 만료되면 다시 넣어야 한다.
- GitHub API 한도(인증 시 시간당 5,000회)는 개인 사용에 충분하다.

**프로토타입에만 있는 것**
- 리뷰용 예시 데이터 시나리오(`makeDemo`. 2026-11-18, 11-22, 2027-02-15, 02-20)가 있다. 실제 앱에서는 생략하거나 저장하지 않는 개발용 옵션으로만 둔다.

**만들지 않은 것:** 다크 모드, 알림, 기록 초기화, 오프라인 설치(PWA).

**디자인 시스템**
- `design-system/`은 Wanted Design System(커뮤니티 Figma 기반 재현)의 일부다. 저장소를 공개한다면 라이선스를 확인한다.
- `design-system/_ds_bundle.js`는 프로토타입 전용이다. 원본 번들에서 아이콘 데이터가 할당되지 않던 버그를 한 줄 고친 버전이다. 구현에는 `components/`와 `assets/icons/`의 원본 소스를 쓴다.
