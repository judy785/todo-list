---
name: todo-app
description: 한국어 TodoList 웹 애플리케이션의 개발, 컴포넌트 검증, 접근성 및 QA 테스트를 자동화하고 안내하는 스킬
---

# TodoList 개발 및 QA 가이드 스킬

이 스킬은 로컬 우선(Local-first) 한국어 TodoList 웹 애플리케이션의 개발 및 QA 품질 검증을 표준화합니다.

## 핵심 검증 워크플로

1. **입력 및 IME 검증**:
   - 한글 입력 시 `e.nativeEvent.isComposing` 상태를 확인하여 자모 결합 중 엔터 입력 시 중복 추가가 발생하지 않는지 점검.
   - 200자 제한, 공백만 입력 시 차단 및 오류 메시지 제공.
2. **저장소 및 복원력 검증**:
   - `localStorage` 스키마 검증 (`schemaVersion: 1`).
   - 잘못된 JSON이 저장되어 있을 때 앱이 크래시되지 않고 안전하게 기본값 유지 및 알림 표시.
   - 저장 실패(QuotaExceeded 등) 시 메모리 상태 보존.
3. **삭제 및 실행 취소(Undo)**:
   - 삭제 시 토스트 알림 표시 및 1회 취소 기능 지원.
   - 취소 시 원래 위치와 속성(id, text, completed, createdAt, updatedAt) 그대로 복구.
4. **접근성(a11y) 기준**:
   - `aria-pressed`, `aria-describedby`, `aria-invalid`, `role="status"` 적절히 부여.
   - 모달 대화상자 포커스 트랩(Focus Trap), Esc 닫기, 이전 포커스 복원.
   - 4.5:1 이상의 텍스트 명도 대비 유지.
