import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Button, Confirm } from "@/components";
import {
  addScheduleItem,
  deleteScheduleItem,
  updateScheduleItem,
  type ScheduleCategory,
  type ScheduleItem,
} from "@/lib/schedule/scheduleItems";
import "@/pages/schedule/components/side-panel/SidePanel.scss";

const CATEGORY_OPTIONS = [
  { value: "work", label: "업무", theme: "work" as const },
  { value: "meeting", label: "회의", theme: "meeting" as const },
  { value: "personal", label: "개인", theme: "personal" as const },
  { value: "other", label: "기타", theme: "other" as const },
] as const;

type SidePanelProps = {
  editingItem?: ScheduleItem | null; // 수정할 일정
  selectedDate?: string | null; // 선택된 날짜
  onClearSelection?: () => void;
  onUpdated?: (item: ScheduleItem) => void;
  onClose?: () => void;
};

export default function SidePanel({
  editingItem = null,
  selectedDate = null,
  onClearSelection,
  onUpdated,
  onClose,
}: SidePanelProps) {
  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [category, setCategory] = useState<ScheduleCategory>(editingItem?.category ?? "work");
  const [date, setDate] = useState<string>(editingItem?.date ?? selectedDate ?? todayISO);
  const [note, setNote] = useState<string>(editingItem?.note ?? "");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 수정 모드 여부
  const isEditMode = Boolean(editingItem);

  // 선택된 카테고리 라벨
  const selectedCategoryLabel =
    CATEGORY_OPTIONS.find((c) => c.value === category)?.label ?? category;

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  function showToast(message: string) {
    setToastMessage(message);
  }

  // 등록 버튼 클릭 시
  function handleSubmit() {
    addScheduleItem({
      category,
      categoryLabel: selectedCategoryLabel,
      date,
      note,
    });

    setNote("");
    onClose?.();
  }

  // 수정 버튼 클릭 시
  function handleUpdate() {
    if (!editingItem) {
      showToast("수정할 일정이 없습니다. 달력에서 일정을 선택해 주세요.");
      return;
    }

    const hasChanges =
      editingItem.category !== category || editingItem.date !== date || editingItem.note !== note;

    if (!hasChanges) {
      showToast("변경된 내용이 없습니다.");
      return;
    }

    setToastMessage(null);

    const updated = updateScheduleItem(editingItem.id, {
      category,
      categoryLabel: selectedCategoryLabel,
      date,
      note,
    });

    if (!updated) {
      showToast("수정할 일정을 찾을 수 없습니다. 이미 삭제되었을 수 있습니다.");
      onClearSelection?.();
      return;
    }

    onUpdated?.(updated);
    showToast("일정이 수정되었습니다.");
  }

  // 삭제 버튼 클릭 시
  function handleDelete() {
    if (!editingItem) {
      showToast("삭제할 일정이 없습니다. 달력에서 일정을 선택해 주세요.");
      return;
    }
    setShowDeleteConfirm(true); // Confirm 열기
  }

  // 컨펌 > 취소 버튼 클릭 시
  function handleDeleteConfirmCancel() {
    setShowDeleteConfirm(false);
  }

  // Confirm에서 [삭제] 확인 시
  function handleDeleteConfirm() {
    if (!editingItem) {
      setShowDeleteConfirm(false);
      return;
    }

    const deleted = deleteScheduleItem(editingItem.id);
    setShowDeleteConfirm(false);
    if (!deleted) {
      showToast("삭제할 일정을 찾을 수 없습니다.");
      onClearSelection?.();
      return;
    }
    onClearSelection?.();
    showToast("일정이 삭제되었습니다.");
  }

  // 토스트 메시지 표시
  const toastEl =
    toastMessage &&
    createPortal(
      <div className="schedule-toast" role="status" aria-live="polite">
        {toastMessage}
      </div>,
      document.body,
    );

  return (
    <>
      {toastEl}

      <Confirm
        open={showDeleteConfirm}
        title="일정 삭제"
        message="이 일정을 삭제할까요?"
        confirmLabel="삭제"
        cancelLabel="취소"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteConfirmCancel}
      />

      <aside className="schedule-side-panel" aria-labelledby="schedule-side-panel-title">
        <div className="schedule-side-panel__card">
          <header className="schedule-side-panel__hero">
            <div className="schedule-side-panel__hero-row">
              <h2 id="schedule-side-panel-title" className="schedule-side-panel__title">
                {isEditMode ? "일정 수정" : "일정 입력"}
              </h2>
              {onClose ? (
                <button
                  type="button"
                  className="schedule-side-panel__close"
                  onClick={onClose}
                  aria-label="일정 입력 닫기"
                >
                  <span aria-hidden>×</span>
                </button>
              ) : null}
            </div>
          </header>

          <div className="schedule-side-panel__body">
            <div className="schedule-side-panel__field">
              <div id="schedule-category-label" className="schedule-side-panel__label">
                카테고리
              </div>
              <div className="schedule-side-panel__chip-well">
                <div
                  className="schedule-side-panel__chips"
                  role="radiogroup"
                  aria-labelledby="schedule-category-label"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`schedule-side-panel__chip schedule-side-panel__chip--${opt.theme}`}
                    >
                      <input
                        type="radio"
                        name="schedule-category"
                        value={opt.value}
                        className="schedule-side-panel__chip-input"
                        checked={category === opt.value}
                        onChange={() => setCategory(opt.value)}
                      />
                      <span className="schedule-side-panel__chip-text">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="schedule-side-panel__field">
              <label htmlFor="schedule-date" className="schedule-side-panel__label">
                날짜
              </label>
              <div className="schedule-side-panel__input-shell">
                <input
                  id="schedule-date"
                  type="date"
                  className="schedule-side-panel__input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="schedule-side-panel__field">
              <label htmlFor="schedule-note" className="schedule-side-panel__label">
                내용
              </label>
              <div className="schedule-side-panel__input-shell schedule-side-panel__input-shell--grow">
                <textarea
                  id="schedule-note"
                  className="schedule-side-panel__textarea"
                  rows={6}
                  placeholder="제목 없이 간단히 메모할 수 있어요."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>

            <div className="schedule-side-panel__actions">
              {isEditMode ? (
                <>
                  <Button type="button" variant="primary" size="sm" onClick={handleUpdate}>
                    수정
                  </Button>
                  <Button type="button" variant="danger" size="sm" onClick={handleDelete}>
                    삭제
                  </Button>
                </>
              ) : (
                <Button type="button" variant="primary" size="sm" onClick={handleSubmit}>
                  등록
                </Button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
