export const SCHEDULE_STORAGE_KEY = "scheduleItems";
export const SCHEDULE_ITEMS_UPDATED_EVENT = "schedule-items-updated";

export type ScheduleCategory = "work" | "meeting" | "personal" | "other";

export type ScheduleItem = {
  id: string;
  category: ScheduleCategory;
  categoryLabel: string;
  date: string;
  note: string;
  createdTimestamp: number;
};

/** 등록·수정 폼에서 넘기는 필드 (id·생성 시각 제외) */
export type ScheduleItemDraft = Pick<ScheduleItem, "category" | "categoryLabel" | "date" | "note">;

// 일정 데이터 변경 시 이벤트 발생
function notifyScheduleItemsUpdated() {
  window.dispatchEvent(new Event(SCHEDULE_ITEMS_UPDATED_EVENT));
}

// 일정 데이터 저장
function writeScheduleItems(items: ScheduleItem[]) {
  localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(items));
  notifyScheduleItemsUpdated();
}

// 일정 데이터 읽기
export function readScheduleItems(): ScheduleItem[] {
  const raw = localStorage.getItem(SCHEDULE_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => {
      const row = item as ScheduleItem & { createdAt?: number };
      return {
        ...row,
        createdTimestamp: row.createdTimestamp ?? row.createdAt ?? 0,
      };
    });
  } catch {
    return [];
  }
}

// id에 해당하는 일정 찾기
export function findScheduleItemById(id: string): ScheduleItem | undefined {
  return readScheduleItems().find((item) => item.id === id);
}

// 일정 추가
export function addScheduleItem(draft: ScheduleItemDraft): ScheduleItem {
  const item: ScheduleItem = {
    ...draft,
    id: crypto.randomUUID(),
    createdTimestamp: Date.now(),
  };
  writeScheduleItems([item, ...readScheduleItems()]);
  return item;
}

/** id에 해당하는 일정을 찾아 내용을 갱신. 없으면 null */
export function updateScheduleItem(id: string, draft: ScheduleItemDraft): ScheduleItem | null {
  const items = readScheduleItems();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null; // 일정이 없으면 null 반환

  const updated: ScheduleItem = {
    ...items[index], // 기존 일정 정보 유지
    ...draft, // 새로운 일정 정보 적용
    id, // id 유지
    createdTimestamp: items[index].createdTimestamp, // 생성 시각 유지
  };

  const next = [...items]; // 기존 일정 목록 복사
  next[index] = updated;
  writeScheduleItems(next);
  return updated;
}

// id에 해당하는 일정 삭제
export function deleteScheduleItem(id: string): boolean {
  const items = readScheduleItems();
  const next = items.filter((item) => item.id !== id);
  if (next.length === items.length) return false;
  writeScheduleItems(next);
  return true;
}
