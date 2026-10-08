# Camino — Claude Code 작업 규칙

이 저장소는 스페인어 학습 기록 웹앱 **Camino**를 구현한다. 명세의 기준은 `README.md`다.

- 구현 전에 `README.md` 전체와 `data/spanish-plan.json`을 읽는다. 화면·문구·계산 규칙은 README를 따른다.
- 동작이 애매하면 `reference/Camino.dc.html` 하단 `class Component`의 로직을 기준으로 한다(정적 서버로 열어 직접 확인 가능).
- 스택: Vite + React + TypeScript. 서버 없음, localStorage 키 `camino.v1`, 정적 배포.
- 계획 내용(할 일·자료·기준·문구)을 코드에 새로 쓰지 않는다. 항상 `spanish-plan.json`에서 읽는다.
- 스타일은 `design-system/`의 토큰(`var(--…)`)과 `design-system/components`의 React 컴포넌트만 쓴다. 새 색·폰트·그림자를 만들지 않는다.
- 저장 형식은 README의 `CaminoData`를 그대로 지킨다(프로토타입·`sample-log.json`과 호환되어야 함).
- 기기 간 동기화는 README '기기 간 동기화'대로 브라우저에서 GitHub Gist API를 직접 호출한다. 토큰은 `camino.sync.v1`에만 두고 내보내기 파일이나 gist 내용에 넣지 않는다.
- 순수 로직(카드 생성, 요일 규칙, 연속일, 잔디 단계, 가져오기 병합)은 `src/lib`로 분리하고 README '검증 예시'를 단위 테스트로 만든다.
- `reference/`와 `design-system/_ds_bundle.js`는 참고용이다. 앱 빌드에 포함하지 않는다.
