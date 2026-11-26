# TodoList 웹앱 아키텍처 및 구현 명세서

## 1. 개요
본 프로젝트는 사용자가 일상의 할 일을 빠르고 안정적으로 기록·관리할 수 있는 순수 클라이언트 기반의 한국어 TodoList 웹 애플리케이션입니다.

## 2. 핵심 설계 원칙
- **로컬 우선(Local First)**: 별도의 백엔드/인증 없이 브라우저의 `localStorage`를 활용하여 데이터를 영속화합니다.
- **예측 가능성 및 복원력**:
  - `todo-app:v1` 네임스페이스 및 스키마 버전을 부여하여 데이터 손상을 방지합니다.
  - JSON 파싱 오류나 저장소 용량 초과 시에도 메모리 상에서 앱이 정상 동작하며, 사용자에게 친절한 에러 안내를 제공합니다.
  - 개별 삭제 시 즉각적인 "실행 취소(Undo)"를 지원하여 원래 위치와 ID, 생성/수정 시간을 완벽히 복원합니다.
- **접근성(a11y) 및 사용성**:
  - WAI-ARIA 속성(`aria-pressed`, `aria-describedby`, `aria-invalid`, `role="status"`, `role="dialog"`) 준수.
  - 한글 IME(자모 결합 상태, `isComposing`)를 정확히 감지하여 중복 추가/제출을 방지합니다.
  - 모바일(320px~), 태블릿(768px), 데스크톱(1024px~) 반응형 완비 및 터치 타깃 44px 이상 확보.
  - 4.5:1 이상의 텍스트 명도 대비 준수.

## 3. 디렉터리 구조
```
todo-list/
├── docs/
│   ├── ARCHITECTURE.md    # 시스템 구조 및 설계 명세
│   └── CHECKLIST.md       # 구현 및 QA 체크리스트
├── skills/
│   └── todo-app/
│       └── SKILL.md       # TodoList 작업 및 QA 워크플로 스킬
├── src/
│   ├── components/        # UI 컴포넌트
│   │   ├── Header.tsx             # 헤더 및 진행률 요약
│   │   ├── TodoInput.tsx          # 할 일 추가 폼 (IME 대응)
│   │   ├── FilterAndSearch.tsx    # 상태 필터 및 검색 바
│   │   ├── TodoList.tsx           # 할 일 목록
│   │   ├── TodoItem.tsx           # 개별 항목 (인라인 편집 지원)
│   │   ├── SummaryFooter.tsx      # 하단 요약 및 일괄 삭제 버튼
│   │   ├── UndoToast.tsx          # 실행 취소 플로팅 토스트
│   │   └── ConfirmDialog.tsx      # 일괄 삭제 확인 모달 대화상자
│   ├── hooks/             # 비즈니스 로직 훅
│   │   └── useTodos.ts            # 할 일 상태 및 스토리지 연동 관리
│   ├── lib/               # 유틸리티 및 스토리지 엔진
│   │   └── storage.ts             # 검증, 파싱, 복구 로직이 포함된 localStorage 래퍼
│   ├── styles/            # 스타일 및 디자인 토큰
│   │   ├── tokens.css             # DESIGN.md 기반 CSS custom properties
│   │   └── global.css             # 리셋, 베이스 및 레이아웃 스타일
│   ├── types/             # 타입 정의
│   │   └── todo.ts                # TodoItem, TodoFilter, StorageSchema 등
│   ├── test/              # 테스트 설정 및 테스트 코드
│   │   ├── setup.ts
│   │   ├── storage.test.ts
│   │   ├── useTodos.test.ts
│   │   └── components.test.tsx
│   ├── App.tsx            # 메인 앱 컨테이너
│   └── main.tsx           # 엔트리 포인트
├── DESIGN.md              # 디자인 시스템 명세
└── package.json
```

## 4. 데이터 모델 명세
```typescript
export interface TodoItem {
  id: string;          // 고유 식별자 (crypto.randomUUID 또는 타임스탬프)
  text: string;        // 할 일 내용 (최대 200자, 공백 trim)
  completed: boolean;  // 완료 여부
  createdAt: string;   // 생성 일시 (ISO 8601 문자열)
  updatedAt: string;   // 수정 일시 (ISO 8601 문자열)
}

export interface TodoStorageData {
  schemaVersion: 1;
  tasks: TodoItem[];
}
```
