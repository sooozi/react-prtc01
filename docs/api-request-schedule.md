# 일정(Schedule) API 요청 명세서

프론트엔드 일정(Schedule) 기능의 localStorage 구현을 API 연동으로 전환하기 위한 요청 문서입니다.  
백엔드 구현·Swagger 반영 시 참고용입니다.

---

## 문서 정보

| 항목      | 내용                                                                       |
| --------- | -------------------------------------------------------------------------- |
| 프로젝트  | react-practice (BPLTE Core)                                                |
| Base URL  | `/bplte/core` (기존 `VITE_API_BASE_URL`과 동일)                            |
| 인증      | `Authorization: Bearer {token}` (로그인 사용자만)                          |
| 응답 형식 | 기존과 동일 (`resultCode`, `resultMessage`, `resultDetailMessage`, `data`) |
| 성공 코드 | `BPLTE200`                                                                 |
| 날짜 형식 | `YYYY-MM-DD` (타임존 필드 없음, KST/로컬 날짜 기준)                        |
| 일시 형식 | `YYYY-MM-DD HH:mm:ss`                                                      |

---

## 배경 — 현재 상태 (localStorage)

| 항목     | 내용                                                                                  |
| -------- | ------------------------------------------------------------------------------------- |
| 저장소   | browser `localStorage` (`scheduleItems` 키)                                           |
| 한계     | 기기·브라우저 간 동기화 불가, 로그인 사용자와 미연동                                  |
| CRUD     | `readScheduleItems` / `addScheduleItem` / `updateScheduleItem` / `deleteScheduleItem` |
| 카테고리 | 프론트 하드코딩 4종 (업무/회의/개인/기타)                                             |

### 현재 localStorage 데이터 구조

```typescript
{
  id: string; // uuid
  category: string; // "work" | "meeting" | "personal" | "other"
  categoryLabel: string; // "업무"
  date: string; // "YYYY-MM-DD" (하루만, start/end 없음)
  note: string; // 일정 제목
  createdTimestamp: number;
}
```

### localStorage → API 전환 범위

| 현재 (localStorage)         | API 전환 후                           |
| --------------------------- | ------------------------------------- |
| `readScheduleItems()`       | `GET /schedules?from&to`              |
| `addScheduleItem()`         | `POST /schedules`                     |
| `updateScheduleItem()`      | `PUT /schedules/{scheduleId}`         |
| (드래그 날짜 변경)          | `PATCH /schedules/{scheduleId}/dates` |
| `deleteScheduleItem()`      | `DELETE /schedules/{scheduleId}`      |
| `CATEGORY_OPTIONS` 하드코딩 | `GET /schedule-categories` (+ CRUD)   |

> **범위 외:** 기존 localStorage 데이터를 서버로 이관하는 import API는 이번 요청에 포함하지 않습니다.

---

## 프론트 기능 ↔ API 필요 여부

| #   | 기능                                         | API 필요                                 |
| --- | -------------------------------------------- | ---------------------------------------- |
| 1   | `+N` 클릭 시 해당 날짜 일정 목록 툴팁/팝오버 | **없음** (목록 조회 API로 충분)          |
| 2   | 일정 드래그로 시작일·마감일 변경             | **있음** (`PATCH /schedules/{id}/dates`) |
| 3   | 일정 등록·수정 시 시작일·마감일 지정         | **있음** (`POST`, `PUT /schedules`)      |
| 4   | 카테고리 이름·색상 사용자 커스텀             | **있음** (카테고리 CRUD)                 |

---

## 기능 ↔ API ↔ 화면 매트릭스

| 기능               | 사용자 동작                      | API                                       | 비고                   |
| ------------------ | -------------------------------- | ----------------------------------------- | ---------------------- |
| 시작·마감일 등록   | 사이드 패널에서 일정 추가        | `POST /schedules`                         | `endDate >= startDate` |
| 시작·마감일 수정   | 사이드 패널에서 일정 수정        | `PUT /schedules/{id}`                     | 전체 교체 방식         |
| 드래그 날짜 변경   | 달력에서 일정 끌어 이동·리사이즈 | `PATCH /schedules/{id}/dates`             | 제목·카테고리 불변     |
| 카테고리 표시      | 등록/수정 폼 칩, 달력 색상       | `GET /schedule-categories`                |                        |
| 카테고리 추가      | 이름·색상 입력                   | `POST /schedule-categories`               |                        |
| 카테고리 수정·삭제 | 설정 UI                          | `PUT`, `DELETE /schedule-categories/{id}` |                        |
| 달력 월 표시       | 월 이동                          | `GET /schedules?from&to`                  | 기간 겹침 조회         |
| `+N` 더보기        | 셀에서 +N 클릭                   | (추가 API 없음)                           | GET 응답 재사용        |
| 일정 삭제          | 사이드 패널 삭제                 | `DELETE /schedules/{id}`                  |                        |

---

## API 목록 요약

| #   | Method | URL                                 | 용도                       |
| --- | ------ | ----------------------------------- | -------------------------- |
| 1   | GET    | `/schedule-categories`              | 카테고리 목록              |
| 2   | POST   | `/schedule-categories`              | 카테고리 등록              |
| 3   | PUT    | `/schedule-categories/{categoryId}` | 카테고리 수정              |
| 4   | DELETE | `/schedule-categories/{categoryId}` | 카테고리 삭제              |
| 5   | GET    | `/schedules?from=&to=`              | 기간별 일정 목록 (달력·+N) |
| 6   | POST   | `/schedules`                        | 일정 등록                  |
| 7   | PUT    | `/schedules/{scheduleId}`           | 일정 전체 수정             |
| 8   | PATCH  | `/schedules/{scheduleId}/dates`     | 드래그 날짜만 변경         |
| 9   | DELETE | `/schedules/{scheduleId}`           | 일정 삭제                  |

---

## 공통 데이터 모델

### ScheduleCategory (카테고리)

| 필드         | 타입     | 필수 | 설명                           |
| ------------ | -------- | ---- | ------------------------------ |
| `categoryId` | `number` | Y    | 카테고리 ID                    |
| `name`       | `string` | Y    | 카테고리 이름 (trim 후 1~20자) |
| `color`      | `string` | Y    | HEX 색상 (예: `#4F46E5`)       |
| `sortOrder`  | `number` | N    | 표시 순서 (작을수록 앞)        |

### ScheduleItem (일정)

| 필드            | 타입     | 필수 | 설명                                                   |
| --------------- | -------- | ---- | ------------------------------------------------------ |
| `scheduleId`    | `number` | Y    | 일정 ID                                                |
| `title`         | `string` | Y    | 일정 제목 (프론트 기존 필드명: `note`)                 |
| `categoryId`    | `number` | Y    | 카테고리 ID                                            |
| `categoryName`  | `string` | Y    | 조회 편의용 (join, 달력·+N 표시)                       |
| `categoryColor` | `string` | Y    | 조회 편의용 (join, 달력 막대 색상)                     |
| `startDate`     | `string` | Y    | 시작일 `YYYY-MM-DD`                                    |
| `endDate`       | `string` | Y    | 마감일 `YYYY-MM-DD` (당일 일정이면 `startDate`와 동일) |
| `regDt`         | `string` | Y    | 등록일시 `YYYY-MM-DD HH:mm:ss`                         |
| `mdfcnDt`       | `string` | N    | 수정일시                                               |

### localStorage → API 필드 매핑

| localStorage (현재) | API (요청)              | 비고                            |
| ------------------- | ----------------------- | ------------------------------- |
| `id` (uuid string)  | `scheduleId` (number)   |                                 |
| `note`              | `title`                 | Swagger 필드명 협의             |
| `date`              | `startDate` + `endDate` | 단일일: `startDate === endDate` |
| `category` (enum)   | `categoryId` (number)   | 커스텀 카테고리                 |
| `categoryLabel`     | `categoryName`          | GET 시 join                     |
| —                   | `categoryColor`         | 신규                            |
| `createdTimestamp`  | `regDt`                 |                                 |

### 공통 검증 규칙

- `title`: trim 후 1자 이상, 최대 200자
- `endDate` >= `startDate`
- `color`: `#` + 6자리 hex (3자리 shorthand 허용 여부는 백엔드 결정)
- `categoryId`: **로그인 사용자 본인 카테고리만** 허용 (타인/없는 ID → 400 또는 403)
- 로그인 사용자 **본인 일정·카테고리만** 조회·수정·삭제

### 기간 일정 표시 규칙

- API는 **1건**으로 반환: `{ startDate: "2026-06-20", endDate: "2026-06-22" }`
- 달력 셀(6/20, 6/21, 6/22)에 각각 표시하는 것은 **프론트 책임**
- GET 응답에 날짜별 중복 row를 펼쳐서 내려줄 필요 없음

### GET /schedules 정렬 (권장)

동일 조회 결과 내:

1. `startDate` ASC
2. `regDt` ASC (또는 `title` ASC — Swagger에 명시)

---

## 카테고리 제약·시드

### 신규 사용자 기본 카테고리 (시드)

| name | color     | sortOrder |
| ---- | --------- | --------- |
| 업무 | `#2563EB` | 1         |
| 회의 | `#7C3AED` | 2         |
| 개인 | `#16A34A` | 3         |
| 기타 | `#6B7280` | 4         |

### 카테고리 제약 (확인 필요)

| 항목               | 권장                                        |
| ------------------ | ------------------------------------------- |
| 사용자당 이름 중복 | 불가 (400)                                  |
| 사용자당 최대 개수 | 20개 (협의)                                 |
| 기본 4개 삭제      | 불가 (403 또는 400)                         |
| color 변경         | 기존 일정 GET 시 **변경된 color** join 반환 |

### 카테고리 삭제 규칙 (확인 필요)

- [ ] **A안:** 해당 카테고리를 쓰는 일정이 있으면 `400` + 에러 메시지
- [ ] **B안:** 일정을 기본 카테고리(예: 기타)로 이전 후 삭제

---

## API 상세

### 1. 카테고리 목록 조회

기능 #4 — 사이드 패널 카테고리 칩·달력 색상

```
GET /schedule-categories
```

**Response `data`**

```json
[
  {
    "categoryId": 1,
    "name": "업무",
    "color": "#2563EB",
    "sortOrder": 1
  },
  {
    "categoryId": 2,
    "name": "회의",
    "color": "#7C3AED",
    "sortOrder": 2
  }
]
```

---

### 2. 카테고리 등록

기능 #4 — 사용자 카테고리 이름·색상 추가

```
POST /schedule-categories
Content-Type: application/json
```

**Request Body**

```json
{
  "name": "운동",
  "color": "#16A34A"
}
```

**Response `data`**

```json
{
  "categoryId": 5,
  "name": "운동",
  "color": "#16A34A",
  "sortOrder": 5
}
```

**에러**

- 이름 중복: `400`
- 최대 개수 초과: `400`

---

### 3. 카테고리 수정

기능 #4 — 카테고리 이름·색상 변경

```
PUT /schedule-categories/{categoryId}
Content-Type: application/json
```

**Request Body**

```json
{
  "name": "헬스",
  "color": "#15803D"
}
```

**Response `data`**: 수정된 `ScheduleCategory` 1건

> color 변경 후 `GET /schedules` 응답의 `categoryColor`도 새 값으로 join되어야 함.

---

### 4. 카테고리 삭제

```
DELETE /schedule-categories/{categoryId}
```

**Response `data`**: `null` 또는 삭제된 `categoryId`

**에러**

- 기본 카테고리 삭제 시도: `400` 또는 `403`
- A안: 연결된 일정 존재: `400`

---

### 5. 일정 목록 조회 (기간)

기능 #1 (`+N` 팝오버), #3 — 달력 월·날짜별 일정 표시

```
GET /schedules?from={from}&to={to}
```

**Query**

| 파라미터 | 타입     | 필수 | 설명                     |
| -------- | -------- | ---- | ------------------------ |
| `from`   | `string` | Y    | 조회 시작일 `YYYY-MM-DD` |
| `to`     | `string` | Y    | 조회 종료일 `YYYY-MM-DD` |

**조회 조건**

- `startDate <= to` AND `endDate >= from` 인 일정 포함 (기간 겹침)
- 로그인 사용자 본인 일정만 반환
- **페이지네이션·limit 없음** — 해당 기간 일정 전체 반환 (한 날짜 10개 이상이어도 전부)

**프론트 호출 예**

- 2026년 6월 달력: `from=2026-05-26&to=2026-07-06` (전후 주 포함 그리드)

**Response `data`**

```json
[
  {
    "scheduleId": 10,
    "title": "팀 회의",
    "categoryId": 2,
    "categoryName": "회의",
    "categoryColor": "#7C3AED",
    "startDate": "2026-06-20",
    "endDate": "2026-06-22",
    "regDt": "2026-06-10 09:00:00",
    "mdfcnDt": null
  },
  {
    "scheduleId": 11,
    "title": "병원 예약",
    "categoryId": 3,
    "categoryName": "개인",
    "categoryColor": "#16A34A",
    "startDate": "2026-06-20",
    "endDate": "2026-06-20",
    "regDt": "2026-06-11 14:00:00",
    "mdfcnDt": null
  }
]
```

**프론트 사용처**

- 달력 셀에 일정 막대 표시 (기간 일정은 프론트에서 날짜별 펼침)
- 셀에 2~3개 초과 시 `+N` 클릭 → **이 API 응답에서 해당 날짜 일정 전체**를 팝오버 표시

---

### 6. 일정 등록

기능 #3 — 시작일·마감일 지정하여 일정 추가

```
POST /schedules
Content-Type: application/json
```

**Request Body**

```json
{
  "title": "팀 회의",
  "categoryId": 2,
  "startDate": "2026-06-20",
  "endDate": "2026-06-22"
}
```

**Response `data`**

```json
{
  "scheduleId": 10,
  "title": "팀 회의",
  "categoryId": 2,
  "categoryName": "회의",
  "categoryColor": "#7C3AED",
  "startDate": "2026-06-20",
  "endDate": "2026-06-22",
  "regDt": "2026-06-10 09:00:00",
  "mdfcnDt": null
}
```

**에러**

- `endDate < startDate`: `400`
- 존재하지 않거나 타인 `categoryId`: `400` 또는 `403`

---

### 7. 일정 수정 (전체)

기능 #3 — 사이드 패널에서 제목·카테고리·기간 수정

```
PUT /schedules/{scheduleId}
Content-Type: application/json
```

**Request Body** (전체 교체 — partial update 아님)

```json
{
  "title": "팀 회의 (수정)",
  "categoryId": 2,
  "startDate": "2026-06-21",
  "endDate": "2026-06-23"
}
```

**Response `data`**

```json
{
  "scheduleId": 10,
  "title": "팀 회의 (수정)",
  "categoryId": 2,
  "categoryName": "회의",
  "categoryColor": "#7C3AED",
  "startDate": "2026-06-21",
  "endDate": "2026-06-23",
  "regDt": "2026-06-10 09:00:00",
  "mdfcnDt": "2026-06-12 15:30:00"
}
```

---

### 8. 일정 날짜 변경 (드래그 전용)

기능 #2 — 달력에서 드래그하여 시작일·마감일만 변경

```
PATCH /schedules/{scheduleId}/dates
Content-Type: application/json
```

**Request Body**

```json
{
  "startDate": "2026-06-25",
  "endDate": "2026-06-27"
}
```

**Response `data`**

```json
{
  "scheduleId": 10,
  "title": "팀 회의",
  "categoryId": 2,
  "categoryName": "회의",
  "categoryColor": "#7C3AED",
  "startDate": "2026-06-25",
  "endDate": "2026-06-27",
  "regDt": "2026-06-10 09:00:00",
  "mdfcnDt": "2026-06-12 16:00:00"
}
```

**드래그 비즈니스 규칙**

| 유형            | 프론트 동작                               | API                              |
| --------------- | ----------------------------------------- | -------------------------------- |
| 전체 이동       | `startDate`/`endDate` 동일 간격으로 shift | PATCH body로 새 날짜 전송        |
| 마감일 리사이즈 | `endDate`만 변경 (막대 끝 드래그)         | PATCH body로 새 `endDate` 전송   |
| 시작일 리사이즈 | `startDate`만 변경                        | PATCH body로 새 `startDate` 전송 |

**서버 validation**

- `endDate >= startDate` (필수)
- 존재하지 않는 `scheduleId` → `404`
- 타인 `scheduleId` → `403`
- 제목·카테고리는 이 API에서 변경하지 않음

**비고**

- `PUT /schedules/{id}`로 통합해도 무방 (팀 convention에 따름)
- 드래그 직후 UI 갱신을 위해 응답에 `categoryName`, `categoryColor` join 포함 필수

---

### 9. 일정 삭제

```
DELETE /schedules/{scheduleId}
```

**Response `data`**: `null` 또는 삭제된 `scheduleId`

---

## 에러 응답

기존 API와 동일한 형식 사용.

| HTTP | 상황                         | 예시 resultMessage                     |
| ---- | ---------------------------- | -------------------------------------- |
| 401  | 미로그인·토큰 만료           | 인증이 필요합니다                      |
| 403  | 타인 일정·카테고리 접근      | 권한이 없습니다                        |
| 404  | 없는 scheduleId / categoryId | 일정을 찾을 수 없습니다                |
| 400  | `endDate < startDate`        | 마감일은 시작일보다 빠를 수 없습니다   |
| 400  | 카테고리 이름 중복           | 이미 사용 중인 카테고리 이름입니다     |
| 400  | 카테고리 삭제 불가 (A안)     | 이 카테고리를 사용하는 일정이 있습니다 |
| 400  | 유효하지 않은 categoryId     | 유효하지 않은 카테고리입니다           |
| 400  | title 빈 값                  | 일정 제목을 입력해 주세요              |

---

## 이번 범위 외 (Phase 2 이후)

| 항목                                    | 사유                    |
| --------------------------------------- | ----------------------- |
| `GET /schedules/{scheduleId}` 단건 조회 | 목록·선택 state로 충분  |
| `+N` 전용 API                           | `GET /schedules`로 처리 |
| 시간(`startTime`/`endTime`) 필드        | 이번 마무리 범위 아님   |
| 반복 일정 (RRULE)                       | 별도 설계 필요          |
| localStorage → 서버 import API          | 신규 저장만 API 사용    |

---

## 구현 우선순위 (프론트 관점)

| Phase | API                                                | 연결 기능                   |
| ----- | -------------------------------------------------- | --------------------------- |
| P1    | `GET/POST/PUT/DELETE /schedule-categories`         | 카테고리 커스텀 (#4)        |
| P2    | `GET /schedules?from&to`                           | 달력 표시, `+N` 팝오버 (#1) |
| P2    | `POST /schedules`, `PUT /schedules/{id}`, `DELETE` | 시작·마감일 등록·수정 (#3)  |
| P3    | `PATCH /schedules/{id}/dates`                      | 드래그 날짜 변경 (#2)       |

---

## 백엔드 확인 요청 사항

1. URL prefix `/schedules`, `/schedule-categories` 사용 가능한지
2. 일정 제목 필드명: `title` vs `note` 중 Swagger 통일안
3. 카테고리 삭제 시 기존 일정 처리 방식 (A안 / B안)
4. 기본 카테고리 4개 삭제 가능 여부
5. 카테고리 이름 사용자당 중복 허용 여부
6. `PATCH /schedules/{id}/dates` 분리 vs `PUT` 통합 여부
7. 기간 일정 1건 반환 + 프론트 날짜별 펼침 — OK?
8. `YYYY-MM-DD` 타임존 필드 없음 — OK?
9. POST/PUT/PATCH 응답에 `categoryName`, `categoryColor` join 포함 — OK?
10. Swagger 반영 일정 (Phase별)

---

## 프론트 연동 계획

API 준비 후 `src/lib/schedule/scheduleItems.ts`의 localStorage 로직을 `src/api/schedule/` HTTP 호출로 교체할 예정입니다.
