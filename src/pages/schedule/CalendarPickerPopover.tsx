import clsx from "clsx";
import { useEffect, useRef } from "react";
import type { ReactNode, RefObject } from "react";

type CalendarPickerPopoverProps = {
  buttonRef: RefObject<HTMLButtonElement | null>;
  popoverRef: RefObject<HTMLDivElement | null>;
  popoverId: string;
  isOpen: boolean;
  /** Esc 또는 트리거·패널 바깥 pointerdown 시 호출 (이 팝오버만 닫기) */
  onDismiss: () => void;
  onTriggerClick: () => void;
  triggerClassName: string;
  /** 연도 패널 등 추가 그리드/스크롤용 클래스 */
  popoverExtraClassName?: string;
  /** 트리거 안에 보여 줄 라벨 */
  triggerDisplay: ReactNode;
  children: ReactNode;
};

/** 연도·월: 트리거 버튼 + 숨김/표시 패널 */
export function CalendarPickerPopover({
  buttonRef,
  popoverRef,
  popoverId,
  isOpen,
  onDismiss,
  onTriggerClick,
  triggerClassName,
  popoverExtraClassName,
  triggerDisplay,
  children,
}: CalendarPickerPopoverProps) {
  const onDismissRef = useRef(onDismiss); // 팝오버 닫기 함수 참조

  // 팝오버 닫기 함수 참조
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  // 팝오버 닫기
  useEffect(() => {
    if (!isOpen) return;

    // Esc 키 누르면 팝오버 닫기
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onDismissRef.current();
    }

    // 트리거·패널 밖을 누르면 닫기
    function handlePointerDown(e: PointerEvent) {
      const t = e.target as Node | null;
      if (!t) return;
      if (buttonRef.current?.contains(t)) return;
      if (popoverRef.current?.contains(t)) return;
      onDismissRef.current();
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen, buttonRef, popoverRef]);

  return (
    <>
      {/* 트리거 버튼 */}
      <button
        type="button"
        ref={buttonRef}
        className={triggerClassName}
        onClick={onTriggerClick}
      >
        {triggerDisplay}
        <span
          className={clsx("month-calendar__title-caret", {
            "month-calendar__title-caret--open": isOpen,
          })}
        />
      </button>
      
      {/* 팝오버 패널 */}
      <div
        id={popoverId}
        ref={popoverRef}
        className={clsx("month-calendar__month-popover", popoverExtraClassName)}
        hidden={!isOpen}
      >
        {children}
      </div>
    </>
  );
}

type CalendarPopoverOptionProps = {
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
};

// 월 선택 옵션
export function CalendarPopoverOption({ selected, onSelect, children }: CalendarPopoverOptionProps) {
  return (
    <button
      type="button"
      className={clsx("month-calendar__month-option", selected && "month-calendar__month-option--selected")}
      onClick={onSelect}
    >
      {children}
    </button>
  );
}
